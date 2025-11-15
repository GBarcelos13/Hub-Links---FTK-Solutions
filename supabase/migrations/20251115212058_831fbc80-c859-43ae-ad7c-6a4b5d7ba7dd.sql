-- Remove a política antiga que permite todos verem todos os links
DROP POLICY IF EXISTS "Anyone authenticated can view links" ON public.links;

-- Cria nova política: usuários podem ver links criados por admins OU seus próprios links
CREATE POLICY "Users can view admin links and own links"
ON public.links
FOR SELECT
TO authenticated
USING (
  -- Ver links criados por admin
  has_role(created_by, 'admin'::app_role)
  OR
  -- Ver próprios links
  auth.uid() = created_by
);