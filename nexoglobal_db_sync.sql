-- ==============================================================================
-- NEXO GLOBAL - DATABASE UPDATE SYNC (BINANCE PAY & ADMIN ENHANCEMENTS)
-- ==============================================================================
-- This script contains all recent database changes including:
-- 1. Binance Pay Configuration (System Settings)
-- 2. Storage Bucket for QR Codes (binance-assets)
-- 3. Deposit Approval & Rejection Logic (RPCs)
-- 4. Admin Manual Plan Assignment (RPCs)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SYSTEM SETTINGS (BINANCE CONFIG)
-- ------------------------------------------------------------------------------
INSERT INTO system_settings (key, value) VALUES 
('admin_binance_name', 'Nexo Admin'),
('admin_binance_id', '123456789'),
('admin_binance_qr_url', '')
ON CONFLICT (key) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. STORAGE BUCKET (BINANCE ASSETS)
-- ------------------------------------------------------------------------------
-- Create bucket if not exists via SQL (if supported by your Supabase version)
-- OR simply use these policies if the bucket "binance-assets" is created manually.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('binance-assets', 'binance-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'binance-assets');

-- Policies for Admin Upload/Update
DROP POLICY IF EXISTS "Admin CRUD" ON storage.objects;
CREATE POLICY "Admin CRUD" ON storage.objects FOR ALL TO authenticated 
USING (bucket_id = 'binance-assets' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');


-- ------------------------------------------------------------------------------
-- 3. DEPOSIT / PIN REQUEST MANAGEMENT (RPCs)
-- ------------------------------------------------------------------------------

-- RPC: Fetch requests by status (Admin Dashboard)
CREATE OR REPLACE FUNCTION public.get_pin_requests_by_status(p_status text)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    amount numeric,
    payment_gateway text,
    trx_id text,
    tx_hash text,
    created_at timestamp with time zone,
    full_name text,
    phone text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Unauthorized.';
    END IF;

    RETURN QUERY
    SELECT 
        pr.id, pr.user_id, pr.amount, pr.payment_gateway, pr.trx_id, pr.tx_hash, pr.created_at,
        p.full_name, p.phone
    FROM pin_requests pr
    JOIN profiles p ON pr.user_id = p.id
    WHERE pr.status = p_status
    ORDER BY pr.created_at DESC;
END; $$;

-- RPC: Approve Request (Credits Wallet via trg_pin_approval trigger)
CREATE OR REPLACE FUNCTION public.approve_pin_request_bulk(p_request_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    UPDATE pin_requests SET status = 'approved', updated_at = now() WHERE id = p_request_id;
    RETURN json_build_object('success', true);
END; $$;

-- RPC: Reject Request
CREATE OR REPLACE FUNCTION public.reject_pin_request(p_request_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    UPDATE pin_requests SET status = 'rejected', updated_at = now() WHERE id = p_request_id;
    RETURN json_build_object('success', true);
END; $$;


-- ------------------------------------------------------------------------------
-- 4. ADMIN MANUAL PLAN ASSIGNMENT (RPC)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_assign_tier_v2(
    p_user_id uuid,
    p_tier text,
    p_sponsor_id uuid DEFAULT NULL
) 
RETURNS json 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
DECLARE
    v_admin_id uuid;
    v_actual_sponsor_id uuid;
    v_parent_id uuid;
    v_placement text := 'left';
    v_existing_pos uuid;
BEGIN
    -- 1. Security Check
    SELECT id INTO v_admin_id FROM profiles WHERE id = auth.uid() AND role = 'admin';
    IF v_admin_id IS NULL THEN 
        RETURN json_build_object('success', false, 'message', 'Unauthorized.');
    END IF;

    -- 2. Check overlap
    SELECT id INTO v_existing_pos FROM tree_positions WHERE user_id = p_user_id AND package_tier = p_tier;
    IF v_existing_pos IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'User already assigned to ' || p_tier);
    END IF;

    -- 3. Determine Sponsor
    IF p_sponsor_id IS NULL THEN
        SELECT user_id INTO v_actual_sponsor_id FROM tree_positions WHERE parent_id IS NULL AND package_tier = p_tier LIMIT 1;
    ELSE
        v_actual_sponsor_id := p_sponsor_id;
    END IF;

    -- 4. Automated Placement
    v_parent_id := public.find_automatic_parent(v_actual_sponsor_id, 'left', p_tier);
    IF v_parent_id IS NULL THEN
         v_parent_id := public.find_automatic_parent(v_actual_sponsor_id, 'right', p_tier);
         v_placement := 'right';
    END IF;

    -- 5. Insert Position
    INSERT INTO tree_positions (user_id, package_tier, parent_id, sponsor_id, placement)
    VALUES (p_user_id, p_tier, v_parent_id, v_actual_sponsor_id, v_placement);

    -- 6. Log
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (p_user_id, 0, 'admin_activation', 'Manual Activation: ' || p_tier, 'completed');

    RETURN json_build_object('success', true, 'message', 'Tier assigned to ' || p_tier);
END; $$;
