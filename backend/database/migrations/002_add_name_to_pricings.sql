-- Migration: Ajouter le champ name à la table pricings
-- Date: 2024
-- Description: Ajoute un champ name pour le nom du forfait (ex: "1 HEURE", "24H", etc.)

-- Ajouter la colonne name si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pricings' 
        AND column_name = 'name'
    ) THEN
        -- Ajouter la colonne d'abord comme nullable
        ALTER TABLE pricings 
        ADD COLUMN name VARCHAR(255);
        
        -- Mettre à jour les enregistrements existants avec un nom par défaut basé sur la durée ou le montant
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
        WHERE name IS NULL;
        
        -- Maintenant rendre la colonne NOT NULL
        ALTER TABLE pricings 
        ALTER COLUMN name SET NOT NULL;
        
        RAISE NOTICE 'Colonne name ajoutée à la table pricings et enregistrements existants mis à jour';
    ELSE
        -- Si la colonne existe déjà, mettre à jour les enregistrements NULL
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
        
        RAISE NOTICE 'Colonne name existe déjà, enregistrements NULL mis à jour';
    END IF;
END $$;

