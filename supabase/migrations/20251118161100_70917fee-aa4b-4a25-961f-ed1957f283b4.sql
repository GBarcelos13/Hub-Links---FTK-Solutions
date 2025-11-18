-- Restrict account creation to specific email domains

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with domain validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email domain
  IF NOT (
    NEW.email LIKE '%@metodotelecom.com.br' OR 
    NEW.email LIKE '%@voicemanager.cloud'
  ) THEN
    RAISE EXCEPTION 'Only emails from @metodotelecom.com.br or @voicemanager.cloud domains are allowed';
  END IF;

  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.email);
  
  -- All users start with 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();