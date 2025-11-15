-- Add RLS policies to user_roles table so users can read their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow the system to check if a user is admin (used by has_role function)
CREATE POLICY "Allow checking admin role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);