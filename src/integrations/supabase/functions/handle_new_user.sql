CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_org_name text;
    final_org_name text;
    counter integer := 0;
BEGIN
    -- Get the base organization name from metadata or use email
    base_org_name := COALESCE(
        new.raw_user_meta_data->>'organization_name',
        split_part(new.email, '@', 1)
    );
    
    -- Initialize final_org_name with base_org_name
    final_org_name := base_org_name;
    
    -- Keep trying with incremented numbers until we find a unique name
    WHILE EXISTS (SELECT 1 FROM organizations WHERE name = final_org_name) LOOP
        counter := counter + 1;
        final_org_name := base_org_name || counter::text;
    END LOOP;

    -- Insert into profiles
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        organization_name
    )
    VALUES (
        new.id,
        COALESCE(
            new.raw_user_meta_data->>'preferred_username',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        ),
        COALESCE(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            split_part(new.email, '@', 1)
        ),
        COALESCE(
            new.raw_user_meta_data->>'avatar_url',
            new.raw_user_meta_data->>'picture'
        ),
        final_org_name
    );

    -- Create organization if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM organizations WHERE name = final_org_name) THEN
        INSERT INTO organizations (name, owner_id)
        VALUES (final_org_name, new.id);
    END IF;

    RETURN new;
END;
$$;