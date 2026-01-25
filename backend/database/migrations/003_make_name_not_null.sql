-- Migration: Rendre la colonne name NOT NULL
-- Date: 2024
-- Description: S'assure que la colonne name est NOT NULL après avoir mis à jour tous les enregistrements

-- Mettre à jour les enregistrements NULL ou vides d'abord
UPDATE pricings 
SET name = CASE
    WHEN duration_hours IS NOT NULL THEN 
        CASE 
            WHEN duration_hours = 1 THEN '1 HEURE'
            WHEN duration_hours = 6 THEN '6 HEURES'
            WHEN duration_hours = 24 THEN '24 HEURES'
            WHEN duration_hours = 72 THEN '3 JOURS'
            WHEN duration_hours = 168 THEN '7 JOURS'
            WHEN duration_hours = 720 THEN '30 JOURS'
            ELSE duration_hours::text || ' HEURES'
        END
    ELSE 'FORFAIT ' || amount::text || ' FCFA'
END
WHERE name IS NULL OR name = '';

-- Maintenant rendre la colonne NOT NULL
DO $$ 
BEGIN
    -- Vérifier si la colonne est déjà NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pricings' 
        AND column_name = 'name'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE pricings 
        ALTER COLUMN name SET NOT NULL;
        
        RAISE NOTICE 'Colonne name rendue NOT NULL';
    ELSE
        RAISE NOTICE 'Colonne name est déjà NOT NULL';
    END IF;
END $$;

