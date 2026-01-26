-- Migration: Ajouter la colonne phone à la table users
-- Date: 2026-01-26

-- Ajouter la colonne phone si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN phone VARCHAR(20);
        
        -- Créer un index pour les recherches rapides
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    END IF;
END $$;

