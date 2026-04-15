-- Categorias de links — feature com funil de upgrade (Free=1, Pro=5, Elite=ilimitado)

-- 1) Tabela categories
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  color         text not null default 'slate',
  emoji         text not null default '📁',
  display_order int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create unique index categories_user_name_unique on public.categories (user_id, lower(name));
create index categories_user_order_idx on public.categories (user_id, display_order);

-- updated_at trigger (reaproveita função set_updated_at criada na migração inicial)
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- 2) FK em links
alter table public.links
  add column category_id uuid references public.categories(id) on delete set null;
create index links_category_idx on public.links (category_id);

-- 3) RLS dono-only
alter table public.categories enable row level security;

create policy "categories_owner_all" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Limite por plano
create or replace function public.plan_category_limit(p public.plan_tier)
returns int
language sql
immutable
as $$
  select case p
    when 'free'  then 1
    when 'pro'   then 5
    when 'elite' then 2147483647
  end;
$$;

-- 5) Trigger de enforcement
create or replace function public.enforce_category_limit()
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

  select plan_category_limit(user_plan) into plan_limit;
  select count(*) into current_count from public.categories where user_id = new.user_id;

  if current_count >= plan_limit then
    raise exception 'CATEGORY_LIMIT_REACHED: plan % allows up to % categories', user_plan, plan_limit
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists categories_enforce_plan_limit on public.categories;
create trigger categories_enforce_plan_limit
  before insert on public.categories
  for each row execute function public.enforce_category_limit();

-- 6) Realtime
alter publication supabase_realtime add table public.categories;
