-- ============================================
-- Schéma de base de données pour Starlink Tickets
-- PostgreSQL (Supabase)
-- ============================================

-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'revendeur', 'client')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: wifi_zones
-- ============================================
CREATE TABLE IF NOT EXISTS wifi_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    router_ip VARCHAR(255) NOT NULL, -- Changé de INET à VARCHAR pour accepter IP, DNS ou VPN
    manager_phone VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wifi_zones_owner ON wifi_zones(owner_id);

-- ============================================
-- Table: pricings
-- ============================================
CREATE TABLE IF NOT EXISTS pricings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wifi_zone_id UUID NOT NULL REFERENCES wifi_zones(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    duration_hours INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricings_zone ON pricings(wifi_zone_id);
CREATE INDEX idx_pricings_active ON pricings(is_active) WHERE is_active = true;

-- ============================================
-- Table: tickets
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wifi_zone_id UUID NOT NULL REFERENCES wifi_zones(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile VARCHAR(255),
    status VARCHAR(50) DEFAULT 'free' CHECK (status IN ('free', 'reserved', 'sold', 'expired')),
    payment_id UUID,
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wifi_zone_id, username) -- Un username unique par zone
);

CREATE INDEX idx_tickets_zone ON tickets(wifi_zone_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_free ON tickets(wifi_zone_id, status) WHERE status = 'free';

-- ============================================
-- Table: payments
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moneroo_payment_id VARCHAR(255) UNIQUE NOT NULL,
    wifi_zone_id UUID NOT NULL REFERENCES wifi_zones(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pricing_id UUID REFERENCES pricings(id),
    currency VARCHAR(3) DEFAULT 'XOF',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    transaction_id VARCHAR(255),
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_zone ON payments(wifi_zone_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_moneroo ON payments(moneroo_payment_id);

-- ============================================
-- Table: payment_idempotency
-- ============================================
CREATE TABLE IF NOT EXISTS payment_idempotency (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_idempotency_key ON payment_idempotency(idempotency_key);

-- ============================================
-- Fonction SQL: assign_ticket_atomic
-- Attribue un ticket de manière atomique
-- ============================================
CREATE OR REPLACE FUNCTION assign_ticket_atomic(
    p_wifi_zone_id UUID,
    p_payment_id UUID
)
RETURNS TABLE(ticket_id UUID) AS $$
DECLARE
    v_ticket_id UUID;
BEGIN
    -- Sélectionner et verrouiller un ticket libre
    SELECT id INTO v_ticket_id
    FROM tickets
    WHERE wifi_zone_id = p_wifi_zone_id
      AND status = 'free'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED; -- Évite les blocages

    -- Si un ticket est trouvé, le marquer comme vendu
    IF v_ticket_id IS NOT NULL THEN
        UPDATE tickets
        SET status = 'sold',
            payment_id = p_payment_id,
            sold_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_ticket_id;

        RETURN QUERY SELECT v_ticket_id;
    ELSE
        -- Aucun ticket disponible
        RETURN;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers pour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wifi_zones_updated_at BEFORE UPDATE ON wifi_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricings_updated_at BEFORE UPDATE ON pricings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Vues utiles
-- ============================================

-- Vue pour les statistiques de zones
CREATE OR REPLACE VIEW zone_stats AS
SELECT 
    wz.id,
    wz.name,
    wz.owner_id,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'free') as free_tickets,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'sold') as sold_tickets,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') as completed_payments,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_revenue
FROM wifi_zones wz
LEFT JOIN tickets t ON t.wifi_zone_id = wz.id
LEFT JOIN payments p ON p.wifi_zone_id = wz.id
GROUP BY wz.id, wz.name, wz.owner_id;

