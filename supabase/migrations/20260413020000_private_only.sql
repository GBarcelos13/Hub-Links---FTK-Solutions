-- Remove políticas públicas herdadas do plano inicial (era link-in-bio).
-- HUB Links é privado: só o dono lê seus links e seu profile.

drop policy if exists "links_public_by_slug"       on public.links;
drop policy if exists "profile_public_slug_select" on public.profiles;
