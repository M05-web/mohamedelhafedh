-- ==========================================
-- PROMOTE_TO_ADMIN.SQL
-- COMMENT DEVENIR ADMINISTRATEUR DU SYSTÈME
-- ==========================================

-- REMPLACER 'votre_email@exemple.com' PAR VOTRE ADRESSE EMAIL RÉELLE
-- PUIS EXÉCUTER CE SCRIPT DANS LE SQL EDITOR SUPABASE.

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'infocs221@gmail.com';

-- VÉRIFICATION
SELECT id, full_name, email, role 
FROM public.profiles 
WHERE role = 'admin';
