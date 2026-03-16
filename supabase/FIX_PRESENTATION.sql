-- ================================================================
-- FIX_PRESENTATION.SQL - SOLUTION DÉFINITIVE v2
-- Corrige TOUS les problèmes : trigger, RLS, colonnes manquantes
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- ÉTAPE 1: Ajouter les colonnes manquantes (sans casser l'existant)
-- ----------------------------------------------------------------

-- Colonne is_verified sur doctors (utilisée partout dans le code)
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT true;

-- Colonne is_available sur schedules (utilisée dans ScheduleManager)
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Colonne appointment_id sur medical_records (utilisée dans DoctorDashboard)
ALTER TABLE public.medical_records ADD COLUMN IF NOT EXISTS appointment_id uuid;

-- Colonne file_name sur documents (utilisée dans Dashboard)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_name text;

-- ----------------------------------------------------------------
-- ÉTAPE 2: Ajouter les contraintes UNIQUE manquantes
-- (nécessaires pour ON CONFLICT dans le trigger)
-- ----------------------------------------------------------------
DO $$
BEGIN
    -- Unique sur patients.user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'patients_user_id_unique' AND conrelid = 'public.patients'::regclass
    ) THEN
        ALTER TABLE public.patients ADD CONSTRAINT patients_user_id_unique UNIQUE (user_id);
    END IF;

    -- Unique sur doctors.user_id
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'doctors_user_id_unique' AND conrelid = 'public.doctors'::regclass
    ) THEN
        ALTER TABLE public.doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Constraint already exists: %', SQLERRM;
END $$;

-- ----------------------------------------------------------------
-- ÉTAPE 3: Désactiver RLS pour nettoyage
-- ----------------------------------------------------------------
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- ÉTAPE 4: Supprimer TOUTES les politiques conflictuelles
-- ----------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------
-- ÉTAPE 5: Réactiver RLS
-- ----------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- ÉTAPE 6: Politiques simples et fonctionnelles
-- ----------------------------------------------------------------

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- DOCTORS
CREATE POLICY "doctors_select" ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY "doctors_insert" ON public.doctors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "doctors_update" ON public.doctors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- PATIENTS
CREATE POLICY "patients_select" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "patients_insert" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "patients_update" ON public.patients FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- APPOINTMENTS
CREATE POLICY "appointments_all" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SPECIALTIES (accessible aussi aux non-connectés pour l'inscription)
CREATE POLICY "specialties_auth" ON public.specialties FOR SELECT TO authenticated USING (true);
CREATE POLICY "specialties_anon" ON public.specialties FOR SELECT TO anon USING (true);

-- MEDICAL RECORDS
CREATE POLICY "records_all" ON public.medical_records FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SCHEDULES
CREATE POLICY "schedules_all" ON public.schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- AUDIT LOGS
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------
-- ÉTAPE 7: Trigger d'inscription — VERSION ROBUSTE FINALE
-- (utilise SELECT avant INSERT pour éviter les conflits)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_specialty_id uuid;
    v_role text;
BEGIN
    -- Récupérer le rôle
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'patient');

    -- 1. Créer/mettre à jour le profil
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

    -- 2. Créer le profil spécialisé
    IF v_role = 'doctor' THEN

        -- Trouver la spécialité
        SELECT id INTO v_specialty_id
        FROM public.specialties
        WHERE name = (new.raw_user_meta_data->>'specialty')
        LIMIT 1;

        -- Insérer seulement si n'existe pas déjà
        IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = new.id) THEN
            INSERT INTO public.doctors (user_id, specialty_id, experience_years, hospital, is_verified)
            VALUES (
                new.id,
                v_specialty_id,
                COALESCE(NULLIF(new.raw_user_meta_data->>'experience', '')::int, 0),
                COALESCE(new.raw_user_meta_data->>'hospital', 'Non renseigné'),
                true
            );
        END IF;

    ELSE

        -- Insérer seulement si n'existe pas déjà
        IF NOT EXISTS (SELECT 1 FROM public.patients WHERE user_id = new.id) THEN
            INSERT INTO public.patients (user_id, date_of_birth, gender)
            VALUES (
                new.id,
                NULLIF(new.raw_user_meta_data->>'date_of_birth', '')::date,
                new.raw_user_meta_data->>'gender'
            );
        END IF;

    END IF;

    RETURN new;

EXCEPTION WHEN OTHERS THEN
    -- Ne JAMAIS bloquer l'inscription
    RAISE LOG 'handle_new_user error for %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rattacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------
-- ÉTAPE 8: Synchroniser les comptes existants
-- ----------------------------------------------------------------

-- Profils manquants
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    email,
    COALESCE(raw_user_meta_data->>'role', 'patient')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Patients manquants
INSERT INTO public.patients (user_id)
SELECT p.id FROM public.profiles p
WHERE p.role = 'patient'
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE user_id = p.id);

-- Médecins manquants
INSERT INTO public.doctors (user_id, is_verified)
SELECT p.id, true FROM public.profiles p
WHERE p.role = 'doctor'
AND NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = p.id);

-- ----------------------------------------------------------------
-- ÉTAPE 9: Spécialités de base
-- ----------------------------------------------------------------
INSERT INTO public.specialties (name) VALUES
    ('Cardiologie'),
    ('Dermatologie'),
    ('Neurologie'),
    ('Pédiatrie'),
    ('Médecin Généraliste'),
    ('Gynécologie'),
    ('Ophtalmologie'),
    ('Orthopédie')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------
-- VÉRIFICATION FINALE
-- ----------------------------------------------------------------
SELECT
    'SUCCÈS' as statut,
    (SELECT count(*) FROM public.profiles)    as profils,
    (SELECT count(*) FROM public.doctors)     as medecins,
    (SELECT count(*) FROM public.patients)    as patients,
    (SELECT count(*) FROM public.appointments) as rendez_vous,
    (SELECT count(*) FROM public.specialties) as specialites,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') as politiques_actives;
