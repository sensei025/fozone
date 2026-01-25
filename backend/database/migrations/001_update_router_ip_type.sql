-- Migration: Changer le type de router_ip de INET à VARCHAR
-- Date: 2024
-- Description: Permet d'accepter des adresses IP, DNS ou VPN dans router_ip

-- Si la colonne existe déjà avec le type INET, on la modifie
DO $$ 
BEGIN
    -- Vérifier si la colonne existe et est de type INET
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wifi_zones' 
        AND column_name = 'router_ip' 
        AND data_type = 'inet'
    ) THEN
        -- Convertir INET en VARCHAR
        ALTER TABLE wifi_zones 
        ALTER COLUMN router_ip TYPE VARCHAR(255) USING router_ip::text;
        
        RAISE NOTICE 'Colonne router_ip mise à jour de INET à VARCHAR(255)';
    ELSE
        RAISE NOTICE 'Colonne router_ip n''existe pas ou n''est pas de type INET, aucune modification nécessaire';
    END IF;
END $$;

