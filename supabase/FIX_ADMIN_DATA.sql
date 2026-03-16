-- ================================================================
-- FIX_ADMIN_DATA.SQL
-- Corrige le trigger d'inscription et nettoie les données patients
-- ================================================================

-- 1. Mise à jour du trigger pour vérifier explicitement le rôle 'patient'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_specialty_id uuid;
    v_role text;
BEGIN
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');

    -- Créer/mettre à jour le profil
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        v_role
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email     = EXCLUDED.email,
        role      = EXCLUDED.role;

    -- Création du profil spécialisé
    IF v_role = 'doctor' THEN
        SELECT id INTO v_specialty_id FROM public.specialties WHERE name = (new.raw_user_meta_data->>'specialty') LIMIT 1;
        IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = new.id) THEN
            INSERT INTO public.doctors (user_id, specialty_id, experience_years, hospital, is_verified)
            VALUES (new.id, v_specialty_id, COALESCE(NULLIF(new.raw_user_meta_data->>'experience', '')::int, 0), COALESCE(new.raw_user_meta_data->>'hospital', 'Non renseigné'), true);
        END IF;
    ELSIF v_role = 'patient' THEN
        IF NOT EXISTS (SELECT 1 FROM public.patients WHERE user_id = new.id) THEN
            INSERT INTO public.patients (user_id, date_of_birth, gender)
            VALUES (new.id, NULLIF(new.raw_user_meta_data->>'date_of_birth', '')::date, new.raw_user_meta_data->>'gender');
        END IF;
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Nettoyage des admins qui sont par erreur dans la table patients
DELETE FROM public.patients 
WHERE user_id IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
);

-- 3. Vérification
SELECT count(*) as patients_count FROM public.patients;
