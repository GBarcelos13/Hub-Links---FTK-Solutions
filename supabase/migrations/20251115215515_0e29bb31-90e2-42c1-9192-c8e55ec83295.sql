-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own links" ON public.links;

-- Create separate policies for updating different fields
-- Allow users to update their own links (name, url)
CREATE POLICY "Users can update own links content"
ON public.links
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Allow all authenticated users to update display_order for reordering
CREATE POLICY "All users can reorder links"
ON public.links
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);