-- ==========================================
-- AJOUT DE LA COLONNE IS_ACTIVE
-- ==========================================
-- Ajout sécurisé : IF NOT EXISTS évite les erreurs si déjà présent
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Mise à jour pour s'assurer que personne n'est NULL
UPDATE profiles SET is_active = true WHERE is_active IS NULL;

-- Commentaire pour la documentation Supabase
COMMENT ON COLUMN profiles.is_active IS 'Indique si le compte utilisateur est actif ou suspendu par l administrateur.';
