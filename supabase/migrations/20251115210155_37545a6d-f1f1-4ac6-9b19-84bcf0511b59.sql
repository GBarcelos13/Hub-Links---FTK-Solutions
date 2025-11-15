-- Update the trigger function to assign admin role to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, NEW.email);
  
  -- Check if email is the admin email and assign appropriate role
  IF NEW.email = 'admin@voicemanager.cloud' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;