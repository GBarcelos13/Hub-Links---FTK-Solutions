-- =============================================================
-- SaaS Foundation: multi-tenancy, profiles, billing, RLS
-- =============================================================

-- --- Enums -----------------------------------------------------
create type public.plan_tier as enum ('free', 'pro', 'team');
create type public.subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid'
);

-- --- Profiles (1:1 com auth.users) -----------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  slug text unique,
  plan public.plan_tier not null default 'free',
  stripe_customer_id text unique,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_slug_idx on public.profiles (slug);

-- --- Subscriptions ---------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan public.plan_tier not null default 'free',
  status public.subscription_status not null default 'active',
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_user_id_unique on public.subscriptions (user_id);

-- --- Links: adicionar user_id ----------------------------------
alter table public.links
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Para links já existentes (sem dono), remover — tabela era single-tenant
delete from public.links where user_id is null;

alter table public.links
  alter column user_id set not null;

create index if not exists links_user_id_idx on public.links (user_id);

-- --- Updated_at trigger helper ---------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- --- Auto-create profile + subscription no signup --------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  candidate text;
  suffix int := 0;
begin
  base_slug := regexp_replace(
    lower(coalesce(split_part(new.email, '@', 1), 'user')),
    '[^a-z0-9]+', '-', 'g'
  );
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then base_slug := 'user'; end if;

  candidate := base_slug;
  while exists (select 1 from public.profiles where slug = candidate) loop
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  end loop;

  insert into public.profiles (id, email, full_name, avatar_url, slug)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    candidate
  );

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --- Helper: link count ----------------------------------------
create or replace function public.user_link_count(uid uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.links where user_id = uid;
$$;

-- --- Helper: plan limits ---------------------------------------
create or replace function public.plan_link_limit(p public.plan_tier)
returns int
language sql
immutable
as $$
  select case p
    when 'free' then 10
    when 'pro'  then 500
    when 'team' then 5000
  end;
$$;

-- --- RLS -------------------------------------------------------
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.links         enable row level security;

-- Remove políticas antigas (do schema inicial aberto)
drop policy if exists "Allow all operations" on public.links;

-- Profiles: dono lê/edita; slug é público para página /u/:slug
create policy "profile_self_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profile_public_slug_select" on public.profiles
  for select using (slug is not null);

create policy "profile_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Subscriptions: só o dono lê; writes via service_role (webhook)
create policy "subscription_self_select" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Links: dono CRUD + leitura pública por slug
create policy "links_owner_all" on public.links
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "links_public_by_slug" on public.links
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = links.user_id and p.slug is not null
    )
  );

-- --- Enforce plan limit on insert ------------------------------
create or replace function public.enforce_link_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan public.plan_tier;
  current_count int;
  plan_limit int;
begin
  select plan into user_plan from public.profiles where id = new.user_id;
  if user_plan is null then user_plan := 'free'; end if;

  select public.plan_link_limit(user_plan) into plan_limit;
  select public.user_link_count(new.user_id) into current_count;

  if current_count >= plan_limit then
    raise exception 'LINK_LIMIT_REACHED: plan % allows up to % links', user_plan, plan_limit
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists links_enforce_plan_limit on public.links;
create trigger links_enforce_plan_limit
  before insert on public.links
  for each row execute function public.enforce_link_limit();

-- --- Sync plan from subscriptions ------------------------------
create or replace function public.sync_profile_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set plan = case
      when new.status in ('active','trialing') then new.plan
      else 'free'
    end
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists subscriptions_sync_plan on public.subscriptions;
create trigger subscriptions_sync_plan
  after insert or update on public.subscriptions
  for each row execute function public.sync_profile_plan();

-- --- Realtime --------------------------------------------------
-- links já está no publication; adicionar subscriptions
alter publication supabase_realtime add table public.subscriptions;
