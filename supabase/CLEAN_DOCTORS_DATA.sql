-- ----------------------------------------------------------------
-- NETTOYAGE AGGRESSIF DES MÉDECINS PAR DÉFAUT
-- ----------------------------------------------------------------

-- 1. Supprimer les docteurs par noms spécifiques (Patterns courants de démo)
-- On supprime de auth.users pour déclencher la cascade sur profiles et doctors
DELETE FROM auth.users 
WHERE id IN (
    SELECT id FROM public.profiles 
    WHERE role = 'doctor' 
    AND (
        full_name ILIKE '%Moussa Ndiaye%'
        OR full_name ILIKE '%Aminata Sow%'
        OR full_name ILIKE '%Cheikh Tidiane%'
        OR full_name ILIKE '%Fatou Diallo%'
        OR email LIKE 'doctor%@%'
        OR email LIKE '%example.com'
        OR email LIKE 'test%@%'
        OR full_name = 'Généraliste' -- Parfois utilisé comme nom par erreur
    )
);

-- 2. Unifier les spécialités (Correction du script précédent)
DO $$ 
DECLARE 
    v_target_id UUID;
    v_source_id UUID;
BEGIN
    -- Obtenir les IDs
    SELECT id INTO v_target_id FROM public.specialties WHERE name = 'Médecin Généraliste' LIMIT 1;
    SELECT id INTO v_source_id FROM public.specialties WHERE name = 'Médecin Général' LIMIT 1;

    -- Si les deux existent, migrer les médecins et supprimer la source
    IF v_target_id IS NOT NULL AND v_source_id IS NOT NULL THEN
        UPDATE public.doctors SET specialty_id = v_target_id WHERE specialty_id = v_source_id;
        DELETE FROM public.specialties WHERE id = v_source_id;
    END IF;

    -- Renommer si nécessaire
    UPDATE public.specialties SET name = 'Médecin Généraliste' WHERE name = 'Médecin Général';
END $$;

-- 3. Nettoyer les spécialités en doublon (Basé sur le nom)
DELETE FROM public.specialties 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(name) ORDER BY id) as row_num 
        FROM public.specialties
    ) t 
    WHERE row_num > 1
);

-- 4. Nettoyage final des espaces
UPDATE public.specialties SET name = trim(name);

-- 5. Optionnellement : Lister ce qui reste (pour vérification dans la console Supabase)
-- SELECT p.full_name, p.email, s.name as specialty 
-- FROM public.profiles p 
-- JOIN public.doctors d ON d.user_id = p.id 
-- LEFT JOIN public.specialties s ON s.id = d.specialty_id;
