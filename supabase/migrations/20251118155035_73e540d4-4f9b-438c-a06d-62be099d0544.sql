-- Add database constraints for input validation
ALTER TABLE public.links ADD CONSTRAINT name_length CHECK (length(name) <= 100);
ALTER TABLE public.links ADD CONSTRAINT url_length CHECK (length(url) <= 2000);

-- Update handle_new_user function to remove hardcoded admin email
-- Everyone starts as a regular user, admins must be assigned manually
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.email);
  
  -- All users start with 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;