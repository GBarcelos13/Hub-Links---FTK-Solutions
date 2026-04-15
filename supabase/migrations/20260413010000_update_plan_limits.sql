-- Atualiza limites de plano e renomeia 'team' -> 'elite'

-- 1) Renomear valor do enum
alter type public.plan_tier rename value 'team' to 'elite';

-- 2) Atualizar função de limite
create or replace function public.plan_link_limit(p public.plan_tier)
returns int
language sql
immutable
as $$
  select case p
    when 'free'  then 5
    when 'pro'   then 30
    when 'elite' then 100
  end;
$$;
