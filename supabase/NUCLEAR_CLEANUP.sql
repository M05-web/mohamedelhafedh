-- ================================================================
-- NETTOYAGE NUCLÉAIRE DES DONNÉES DE DÉMO
-- ================================================================

-- 1. Suppimer les rendez-vous et dossiers associés aux comptes de démo
DELETE FROM public.appointments 
WHERE doctor_id IN (SELECT id FROM public.doctors WHERE user_id IN (SELECT id FROM public.profiles WHERE full_name ILIKE '%Moussa%' OR full_name ILIKE '%Ndiaye%' OR full_name ILIKE '%Aminata%' OR full_name ILIKE '%Sow%'));

DELETE FROM public.medical_records 
WHERE doctor_id IN (SELECT id FROM public.doctors WHERE user_id IN (SELECT id FROM public.profiles WHERE full_name ILIKE '%Moussa%' OR full_name ILIKE '%Ndiaye%' OR full_name ILIKE '%Aminata%' OR full_name ILIKE '%Sow%'));

-- 2. Supprimer les docteurs par noms de démo (Nettoyage direct des tables de l'application)
DELETE FROM public.doctors 
WHERE user_id IN (
    SELECT id FROM public.profiles 
    WHERE full_name ILIKE '%Moussa Ndiaye%'
       OR full_name ILIKE '%Aminata Sow%'
       OR full_name ILIKE '%Cheikh Tidiane%'
       OR full_name ILIKE '%Fatou Diallo%'
       OR full_name ILIKE '%Dr Moussa%'
       OR full_name ILIKE '%Dr Ndiaye%'
);

-- 3. Supprimer de profiles également (pour éviter les résidus)
DELETE FROM public.profiles 
WHERE full_name ILIKE '%Moussa Ndiaye%'
   OR full_name ILIKE '%Aminata Sow%'
   OR full_name ILIKE '%Cheikh Tidiane%'
   OR full_name ILIKE '%Fatou Diallo%'
   OR full_name ILIKE '%Dr Moussa%'
   OR full_name ILIKE '%Dr Ndiaye%';

-- 4. Nettoyage de sécurité : Supprimer de auth.users tout ce qui n'a plus de profil
-- (Attention : Cela supprimera les comptes auth si le profil a été supprimé ci-dessus)
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 5. Unifier les spécialités (Dernière vérification)
UPDATE public.doctors 
SET specialty_id = (SELECT id FROM public.specialties WHERE name = 'Médecin Généraliste' LIMIT 1)
WHERE specialty_id IN (SELECT id FROM public.specialties WHERE name = 'Médecin Général');

DELETE FROM public.specialties WHERE name = 'Médecin Général';

-- 6. Re-sécuriser la table spécialités
DELETE FROM public.specialties 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(name) ORDER BY id) as row_num 
        FROM public.specialties
    ) t 
    WHERE row_num > 1
);
