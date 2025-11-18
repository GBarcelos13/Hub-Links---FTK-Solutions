-- Add first_login flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_login boolean DEFAULT true;

-- Update existing users to not show first login dialog
UPDATE public.profiles 
SET first_login = false 
WHERE first_login IS NULL;