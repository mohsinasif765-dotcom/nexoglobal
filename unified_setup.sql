-- ==============================================================================
-- 1. TABLES CREATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS commissions (
    id bigint PRIMARY KEY,
    user_id uuid,
    amount numeric,
    type text,
    description text,
    created_at timestamp with time zone,
    status text,
    paid_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS pin_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    trx_id text UNIQUE, -- Internal ID or Hash
    amount numeric,
    package_tier text,
    payment_gateway text DEFAULT 'manual', -- 'oxapay', 'web3', 'manual'
    tx_hash text, -- Blockchain Transaction Hash
    payment_url text, -- For OxApay Invoice
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_code text UNIQUE,
    created_for uuid,
    package_tier text, -- 'starter', 'plus', 'pro', 'elite'
    status text,
    used_by uuid,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tree_positions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    package_tier text, -- 'starter', 'plus', 'pro', 'elite'
    parent_id uuid REFERENCES profiles(id),
    sponsor_id uuid REFERENCES profiles(id),
    placement text, -- 'left' or 'right'
    left_count integer DEFAULT 0,
    right_count integer DEFAULT 0,
    total_pairs_matched integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, package_tier) -- A user can only have one position per tree
);

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY,
    full_name text,
    phone text UNIQUE,
    referral_code text UNIQUE,
    status text,
    wallet_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    trx_id text,
    total_earned numeric DEFAULT 0,
    role text DEFAULT 'user',
    account_type text,
    account_number text
);

CREATE TABLE IF NOT EXISTS support_messages (
    id uuid PRIMARY KEY,
    user_id uuid,
    subject text,
    message text,
    status text,
    created_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS system_settings (
    key text PRIMARY KEY,
    value text
);

-- Seed Initial Prices
INSERT INTO system_settings (key, value) VALUES 
('package_starter_price', '2'),
('package_plus_price', '5'),
('package_pro_price', '10'),
('package_elite_price', '20'),
('min_deposit', '2'),
('min_withdraw', '10')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Withdrawal Requests (USDT BEP20)
CREATE TABLE IF NOT EXISTS withdraw_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    amount numeric NOT NULL,
    method text DEFAULT 'USDT-BEP20',
    wallet_address text,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Financial Transactions Log
CREATE TABLE IF NOT EXISTS transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id),
    amount numeric NOT NULL,
    type text NOT NULL, -- 'deposit', 'withdraw', 'pin_purchase', 'commission'
    description text,
    status text DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    created_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- 2. ADDING FOREIGN KEYS 
-- ==============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_commissions_user_id') THEN
        ALTER TABLE commissions ADD CONSTRAINT fk_commissions_user_id FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pr_user_id') THEN
        ALTER TABLE pin_requests ADD CONSTRAINT fk_pr_user_id FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pins_created_for') THEN
        ALTER TABLE pins ADD CONSTRAINT fk_pins_created_for FOREIGN KEY (created_for) REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pins_used_by') THEN
        ALTER TABLE pins ADD CONSTRAINT fk_pins_used_by FOREIGN KEY (used_by) REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_sm_user_id') THEN
        ALTER TABLE support_messages ADD CONSTRAINT fk_sm_user_id FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_wr_user_id') THEN
        ALTER TABLE withdraw_requests ADD CONSTRAINT fk_wr_user_id FOREIGN KEY (user_id) REFERENCES profiles(id);
    END IF;
END $$;

-- ==============================================================================
-- 3. UTILITY FUNCTIONS (Needed for RLS Policies)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_is_admin()
 RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE v_role text;
BEGIN
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    RETURN COALESCE(v_role = 'admin', false);
END; $function$;

-- ==============================================================================
-- 4. ENABLE RLS & POLICIES
-- ==============================================================================

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;

-- Cleanup existing policies to avoid conflicts
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- (Policies list - Simplified for space but matching original logic)
CREATE POLICY "Users view own commissions" ON commissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin commissions" ON commissions FOR ALL TO authenticated USING (check_is_admin());

CREATE POLICY "Users manage own pin requests" ON pin_requests FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin manage requests" ON pin_requests FOR ALL TO authenticated USING (check_is_admin());

CREATE POLICY "Public check pins" ON pins FOR SELECT TO authenticated, anon USING (status = 'unused');
CREATE POLICY "User view own pins" ON pins FOR SELECT TO authenticated USING (auth.uid() = created_for);
CREATE POLICY "Admin all pins" ON pins FOR ALL TO authenticated USING (check_is_admin());

CREATE POLICY "Public signup profiles" ON profiles FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Member own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin all profiles" ON profiles FOR ALL TO authenticated USING (check_is_admin());
CREATE POLICY "Public tree info" ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view settings" ON system_settings FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users view own withdrawals" ON withdraw_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own withdrawals" ON withdraw_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin all withdrawals" ON withdraw_requests FOR ALL TO authenticated USING (check_is_admin());


-- ==============================================================================
-- 5. RPC FUNCTIONS
-- ==============================================================================

-- Drop old 2-argument version of find_automatic_parent
DROP FUNCTION IF EXISTS public.find_automatic_parent(uuid, text);

CREATE OR REPLACE FUNCTION public.generate_unique_referral_code() RETURNS text LANGUAGE plpgsql AS $function$
DECLARE new_code text; code_exists boolean;
BEGIN LOOP
    new_code := 'NEXO-' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
END LOOP; RETURN new_code; END; $function$;

-- New: Returns profile + tree stats for all tiers
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id uuid)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE
    v_profile record;
    v_tree_stats json;
    v_recent_tx json;
BEGIN
    SELECT full_name, status, referral_code, wallet_balance, total_earned INTO v_profile FROM profiles WHERE id = p_user_id;
    
    SELECT json_agg(t) INTO v_tree_stats FROM (
        SELECT package_tier, left_count, right_count, total_pairs_matched 
        FROM tree_positions WHERE user_id = p_user_id
    ) t;

    SELECT json_agg(tx) INTO v_recent_tx FROM (
        SELECT id, amount, type, description, status, created_at
        FROM transactions WHERE user_id = p_user_id
        ORDER BY created_at DESC LIMIT 10
    ) tx;

    RETURN json_build_object(
        'full_name', v_profile.full_name,
        'status', v_profile.status,
        'referral_code', v_profile.referral_code,
        'wallet_balance', v_profile.wallet_balance,
        'total_earned', v_profile.total_earned,
        'tree_stats', COALESCE(v_tree_stats, '[]'::json),
        'recent_transactions', COALESCE(v_recent_tx, '[]'::json)
    );
END; $function$;

-- Updated: Searches for parent in a SPECIFIC package tier tree
CREATE OR REPLACE FUNCTION public.find_automatic_parent(p_sponsor_id uuid, p_placement text, p_tier text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE current_node uuid := p_sponsor_id; next_node uuid;
BEGIN LOOP
    -- Check if the desired placement (left or right) is empty for THIS TIER
    SELECT user_id INTO next_node FROM tree_positions WHERE parent_id = current_node AND placement = p_placement AND package_tier = p_tier LIMIT 1;
    IF next_node IS NULL THEN RETURN current_node; ELSE current_node := next_node; END IF;
END LOOP; END; $function$;

-- Updated: Registration now handles tree placement per tier
CREATE OR REPLACE FUNCTION public.complete_user_registration(
    p_user_id uuid, p_full_name text, p_email text, p_sponsor_id uuid, 
    p_parent_id uuid, p_placement text, p_account_type text, 
    p_account_number text, p_pin_code text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE 
    v_pin_id uuid; 
    v_ref_code text; 
    v_tier text;
    v_price numeric;
BEGIN
    -- 1. Validate Pin and Get Tier
    SELECT id, package_tier INTO v_pin_id, v_tier FROM pins WHERE pin_code = p_pin_code AND status = 'unused' FOR UPDATE;
    IF v_pin_id IS NULL THEN RAISE EXCEPTION 'Invalid or Used PIN.'; END IF;

    -- 2. Check if Profile already exists (Create if not)
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
        v_ref_code := public.generate_unique_referral_code();
        INSERT INTO profiles (id, full_name, phone, referral_code, status, role, account_type, account_number)
        VALUES (p_user_id, p_full_name, p_email, v_ref_code, 'active', 'user', p_account_type, p_account_number);
    END IF;

    -- 3. Mark Pin as Used (Now profile exists, so FK constraint is satisfied)
    UPDATE pins SET status = 'used', used_by = p_user_id WHERE id = v_pin_id;

    -- 4. Insert into Tree Position for THIS tier
    INSERT INTO tree_positions (user_id, package_tier, parent_id, sponsor_id, placement)
    VALUES (p_user_id, v_tier, p_parent_id, p_sponsor_id, p_placement);
END; $function$;

-- New: Recursive tree retrieval for a specific tier
CREATE OR REPLACE FUNCTION public.get_binary_tree_pro(root_id uuid, p_tier text)
 RETURNS TABLE(id uuid, parent_id uuid, placement text, full_name text, referral_code text, status text, left_count integer, right_count integer, total_pairs_matched integer)
 LANGUAGE plpgsql SECURITY DEFINER AS $function$
BEGIN
    RETURN QUERY
    WITH RECURSIVE tree_nodes AS (
        SELECT tp.user_id, tp.parent_id, tp.placement, pr.full_name, pr.referral_code, pr.status, tp.left_count, tp.right_count, tp.total_pairs_matched, 1 as depth
        FROM tree_positions tp
        JOIN profiles pr ON tp.user_id = pr.id
        WHERE tp.user_id = root_id AND tp.package_tier = p_tier
        UNION ALL
        SELECT tp.user_id, tp.parent_id, tp.placement, pr.full_name, pr.referral_code, pr.status, tp.left_count, tp.right_count, tp.total_pairs_matched, tn.depth + 1
        FROM tree_positions tp
        JOIN profiles pr ON tp.user_id = pr.id
        JOIN tree_nodes tn ON tp.parent_id = tn.user_id
        WHERE tp.package_tier = p_tier AND tn.depth < 5
    )
    SELECT tn.user_id as id, tn.parent_id, tn.placement, tn.full_name, tn.referral_code, tn.status, tn.left_count, tn.right_count, tn.total_pairs_matched FROM tree_nodes tn;
END; $function$;

-- 6. TRIGGERS

-- Updated: Sync commission to wallet
CREATE OR REPLACE FUNCTION public.sync_commission_to_profile() RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN 
    IF NEW.status = 'approved' THEN 
        UPDATE profiles SET wallet_balance = COALESCE(wallet_balance, 0) + NEW.amount, total_earned = COALESCE(total_earned, 0) + NEW.amount WHERE id = NEW.user_id; 
    END IF; 
    RETURN NEW; 
END; $function$;

-- Updated: Increment counts in the correct tier tree
CREATE OR REPLACE FUNCTION public.handle_new_tree_registration() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE 
    current_parent uuid := NEW.parent_id; 
    current_placement text := NEW.placement;
    v_tier text := NEW.package_tier;
BEGIN 
    WHILE current_parent IS NOT NULL LOOP
        IF current_placement = 'left' THEN 
            UPDATE tree_positions SET left_count = COALESCE(left_count, 0) + 1 WHERE user_id = current_parent AND package_tier = v_tier;
        ELSIF current_placement = 'right' THEN 
            UPDATE tree_positions SET right_count = COALESCE(right_count, 0) + 1 WHERE user_id = current_parent AND package_tier = v_tier; 
        END IF;

        -- Move up the specific tier tree
        SELECT parent_id, placement INTO current_parent, current_placement FROM tree_positions WHERE user_id = current_parent AND package_tier = v_tier;
    END LOOP; 
    RETURN NEW; 
END; $function$;

-- Updated: Pair matching logic per tier
CREATE OR REPLACE FUNCTION public.process_binary_pair_matching() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
    v_pairs_to_add integer;
    v_tier_price numeric;
BEGIN
    v_pairs_to_add := LEAST(NEW.left_count, NEW.right_count) - OLD.total_pairs_matched;
    IF v_pairs_to_add > 0 THEN
        NEW.total_pairs_matched := OLD.total_pairs_matched + v_pairs_to_add;
        
        -- Get tier price for bonus calculation (e.g., 5% per pair)
        SELECT value::numeric INTO v_tier_price FROM system_settings WHERE key = 'package_' || NEW.package_tier || '_price';
        
        INSERT INTO commissions (id, user_id, amount, type, description, created_at, status)
        VALUES (floor(extract(epoch from now()))::bigint + random()::int, NEW.user_id, (v_pairs_to_add * v_tier_price * 0.05), 'binary_pair', 'Binary Bonus (' || NEW.package_tier || ')', now(), 'approved');
    END IF;
    RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS sync_commission_to_profile ON commissions;
CREATE TRIGGER sync_commission_to_profile AFTER INSERT ON commissions FOR EACH ROW EXECUTE FUNCTION public.sync_commission_to_profile();

-- Trigger for new user profile creation (Generic for consistency)
CREATE OR REPLACE FUNCTION public.handle_new_user_registration() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, status, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'active', 'user');
  RETURN new;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Note: This requires superuser or specific permissions, typically run in Dash
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

DROP TRIGGER IF EXISTS handle_new_tree_registration ON tree_positions;
CREATE TRIGGER handle_new_tree_registration AFTER INSERT ON tree_positions FOR EACH ROW EXECUTE FUNCTION public.handle_new_tree_registration();

DROP TRIGGER IF EXISTS process_binary_pair_matching ON tree_positions;
CREATE TRIGGER process_binary_pair_matching BEFORE UPDATE ON tree_positions FOR EACH ROW EXECUTE FUNCTION public.process_binary_pair_matching();

-- Securely buy a PIN using wallet balance
CREATE OR REPLACE FUNCTION public.buy_pin_with_balance(p_tier text)
 RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_price numeric;
    v_balance numeric;
    v_pin_code text;
BEGIN
    -- 1. Get Price from settings
    SELECT value::numeric INTO v_price FROM system_settings WHERE key = 'package_' || p_tier || '_price';
    IF v_price IS NULL THEN RAISE EXCEPTION 'Invalid tier price.'; END IF;

    -- 1.5. Check Tier Access (Only Admin or Active users in that tier can buy)
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user_id AND role = 'admin') 
       AND NOT EXISTS (SELECT 1 FROM tree_positions WHERE user_id = v_user_id AND package_tier = p_tier) THEN
        RAISE EXCEPTION 'You must join the % tier before buying its PINs.', p_tier;
    END IF;

    -- 2. Check User Balance
    SELECT wallet_balance INTO v_balance FROM profiles WHERE id = v_user_id FOR UPDATE;
    IF v_balance < v_price THEN RAISE EXCEPTION 'Insufficient balance. You need $ %', v_price; END IF;

    -- 3. Deduct Balance
    UPDATE profiles SET wallet_balance = wallet_balance - v_price WHERE id = v_user_id;

    -- 4. Generate PIN
    v_pin_code := 'PIN-' || upper(substring(md5(random()::text) from 1 for 8));
    
    INSERT INTO pins (pin_code, created_for, package_tier, status)
    VALUES (v_pin_code, v_user_id, p_tier, 'unused');

    -- 5. Log Transaction
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (v_user_id, v_price, 'pin_purchase', 'Bought ' || p_tier || ' PIN', 'completed');

    RETURN json_build_object(
        'status', 'success',
        'pin_code', v_pin_code,
        'new_balance', v_balance - v_price
    );
END; $$;

-- Table to track independent level completions
CREATE TABLE IF NOT EXISTS public.user_levels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id),
    package_tier text,
    level integer, -- Specific level number completed
    completed_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, package_tier, level)
);

-- Refactored: Independent Level Milestone Logic
CREATE OR REPLACE FUNCTION public.update_tree_counts()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_id uuid;
    v_original_placement text;
    v_package_tier text;
    v_depth integer := 1;
    v_required_nodes integer;
    v_left_at_depth integer;
    v_right_at_depth integer;
    v_reward_per_level numeric;
    v_comm_amount numeric;
BEGIN
    v_parent_id := NEW.parent_id;
    v_original_placement := NEW.placement;
    v_package_tier := NEW.package_tier;

    -- Fetch percentage (e.g. 50 for 50%)
    SELECT COALESCE(value::numeric, 0.0) INTO v_reward_percent 
    FROM public.system_settings 
    WHERE key = 'package_' || v_package_tier || '_level_reward';

    -- Fetch Tier Price to calculate volume
    SELECT COALESCE(value::numeric, 2.0) INTO v_tier_price 
    FROM public.system_settings 
    WHERE key = 'package_' || v_package_tier || '_price';

    WHILE v_parent_id IS NOT NULL LOOP
        -- Increment depth-specific count
        INSERT INTO public.tree_level_nodes (user_id, package_tier, depth, placement, node_count)
        VALUES (v_parent_id, v_package_tier, v_depth, v_original_placement, 1)
        ON CONFLICT (user_id, package_tier, depth, placement) 
        DO UPDATE SET node_count = public.tree_level_nodes.node_count + 1;

        -- Update overall counts
        IF v_original_placement = 'left' THEN
            UPDATE public.tree_positions SET left_count = left_count + 1 WHERE user_id = v_parent_id AND package_tier = v_package_tier;
        ELSE
            UPDATE public.tree_positions SET right_count = right_count + 1 WHERE user_id = v_parent_id AND package_tier = v_package_tier;
        END IF;

        -- Check if SPECIFIC level depth is full
        v_required_nodes := power(2, v_depth - 1)::integer;
        
        SELECT node_count INTO v_left_at_depth FROM public.tree_level_nodes 
        WHERE user_id = v_parent_id AND package_tier = v_package_tier AND depth = v_depth AND placement = 'left';
        
        SELECT node_count INTO v_right_at_depth FROM public.tree_level_nodes 
        WHERE user_id = v_parent_id AND package_tier = v_package_tier AND depth = v_depth AND placement = 'right';

        IF COALESCE(v_left_at_depth, 0) >= v_required_nodes AND COALESCE(v_right_at_depth, 0) >= v_required_nodes THEN
            -- Check if THIS specific level was already rewarded
            IF NOT EXISTS (SELECT 1 FROM public.user_levels WHERE user_id = v_parent_id AND package_tier = v_package_tier AND level = v_depth) THEN
                -- REWARD CALCULATION: Fixed Binary Match per Level (User Request)
                v_comm_amount := v_reward_percent; -- Fixed $ amount
                
                IF v_comm_amount > 0 THEN
                    INSERT INTO public.commissions (id, user_id, amount, type, description, status)
                    VALUES (
                        (extract(epoch from now()) * 1000)::bigint + floor(random() * 1000)::int, 
                        v_parent_id, v_comm_amount, 'binary_reward', 
                        'Binary match reward for Level ' || v_depth || ' in ' || v_package_tier || ' tier.', 'approved'
                    );
                    
                    UPDATE public.profiles SET wallet_balance = wallet_balance + v_comm_amount, total_earned = total_earned + v_comm_amount WHERE id = v_parent_id;
                END IF;
                
                -- Record THIS specific level completion
                INSERT INTO public.user_levels (user_id, package_tier, level)
                VALUES (v_parent_id, v_package_tier, v_depth)
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;

        SELECT parent_id, placement INTO v_parent_id, v_original_placement 
        FROM public.tree_positions 
        WHERE user_id = v_parent_id AND package_tier = v_package_tier;
        
        v_depth := v_depth + 1;
    END LOOP;

    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_update_tree_counts ON public.tree_positions;
CREATE TRIGGER trg_update_tree_counts AFTER INSERT ON public.tree_positions FOR EACH ROW EXECUTE FUNCTION public.update_tree_counts();

-- Automated Wallet Credit on Payment Approval
CREATE OR REPLACE FUNCTION public.handle_pin_approval() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- 1. Increase Wallet Balance
        UPDATE public.profiles 
        SET wallet_balance = COALESCE(wallet_balance, 0) + NEW.amount 
        WHERE id = NEW.user_id;

        -- 2. Log Transaction History
        INSERT INTO public.transactions (user_id, amount, type, description, status)
        VALUES (
            NEW.user_id, 
            NEW.amount, 
            'deposit', 
            'Wallet Deposit (' || COALESCE(NEW.payment_gateway, 'automated') || ')', 
            'completed'
        );
    END IF;
    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_pin_approval ON pin_requests;
CREATE TRIGGER trg_pin_approval BEFORE UPDATE ON pin_requests FOR EACH ROW EXECUTE FUNCTION public.handle_pin_approval();
-- ==============================================================================
-- 6. INITIAL SEEDING (ADMIN ROOT)
-- ==============================================================================
-- Run this once with your Admin User ID to establish the root nodes for all tiers.
-- INSERT INTO tree_positions (user_id, package_tier, parent_id, sponsor_id, placement) VALUES 
-- ('YOUR_ADMIN_UUID', 'starter', NULL, NULL, NULL),
-- ('YOUR_ADMIN_UUID', 'plus', NULL, NULL, NULL),
-- ('YOUR_ADMIN_UUID', 'pro', NULL, NULL, NULL),
-- ('YOUR_ADMIN_UUID', 'elite', NULL, NULL, NULL);

-- Admin Dashboard Statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_total_users integer;
    v_new_users_today integer;
    v_total_volume numeric;
    v_pending_payouts numeric;
BEGIN
    -- Only Admin can call this
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    -- 1. Total Users
    SELECT count(*) INTO v_total_users FROM profiles WHERE role = 'user';

    -- 2. New Users Today
    SELECT count(*) INTO v_new_users_today FROM profiles WHERE role = 'user' AND created_at >= CURRENT_DATE;

    -- 3. Total Volume (Approved Deposits)
    SELECT COALESCE(sum(amount), 0) INTO v_total_volume FROM pin_requests WHERE status = 'approved';

    -- 4. Pending Payouts (Withdraw requests)
    SELECT COALESCE(sum(amount), 0) INTO v_pending_payouts FROM withdraw_requests WHERE status = 'pending';

    RETURN json_build_object(
        'totalUsers', v_total_users,
        'newUsersToday', v_new_users_today,
        'totalVolume', v_total_volume,
        'pendingPayouts', v_pending_payouts
    );
END; $$;

-- Paginated User Fetch for Admin (Enhanced with Metrics)
CREATE OR REPLACE FUNCTION public.get_users_paginated_v2(
    search_query text,
    page_limit integer,
    page_offset integer,
    status_filter text
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_users jsonb;
    v_has_more boolean;
BEGIN
    -- Only Admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    -- Fetch users with 1 extra to check hasMore
    WITH user_list AS (
        SELECT 
            p.id, 
            p.full_name, 
            p.phone, 
            p.referral_code, 
            p.status,
            p.wallet_balance,
            COALESCE((SELECT SUM(total_pairs_matched) FROM tree_positions WHERE user_id = p.id), 0) as total_pairs,
            COALESCE((SELECT SUM(amount) FROM withdraw_requests WHERE user_id = p.id AND status = 'approved'), 0) as total_withdrawn
        FROM profiles p
        WHERE role = 'user'
        AND (CASE 
                WHEN status_filter = 'active' THEN status = 'active'
                WHEN status_filter = 'pending' THEN status = 'pending'
                WHEN status_filter = 'blocked' THEN status = 'blocked'
                ELSE true 
             END)
        AND (
            full_name ILIKE '%' || search_query || '%' OR
            phone ILIKE '%' || search_query || '%' OR
            referral_code ILIKE '%' || search_query || '%'
        )
        ORDER BY created_at DESC
        LIMIT (page_limit + 1)
        OFFSET page_offset
    )
    SELECT 
        COALESCE(jsonb_agg(sub.u) FILTER (WHERE sub.rn <= page_limit), '[]'::jsonb),
        COUNT(*) > page_limit
    INTO v_users, v_has_more
    FROM (
        SELECT row_to_json(user_list)::jsonb as u, row_number() OVER () as rn
        FROM user_list
    ) sub;

    RETURN json_build_object(
        'users', v_users,
        'hasMore', COALESCE(v_has_more, false)
    );
END; $$;

-- Get Level Stats for User (Independent Levels Version)
CREATE OR REPLACE FUNCTION public.get_user_level_stats(p_user_id uuid, p_tier text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_levels json;
    v_max_active_depth integer;
BEGIN
    -- Get max depth where user has any node
    SELECT COALESCE(MAX(depth), 0) INTO v_max_active_depth
    FROM public.tree_level_nodes 
    WHERE user_id = p_user_id AND package_tier = p_tier;

    -- Show levels up to (max active depth + 1)
    WITH level_gen AS (
        SELECT generate_series(1, GREATEST(v_max_active_depth, 0) + 1) as lv
    )
    SELECT json_agg(row_to_json(l)) INTO v_levels FROM (
        SELECT 
            lv as level,
            (power(2, lv - 1)::integer) as required,
            COALESCE((SELECT node_count FROM public.tree_level_nodes WHERE user_id = p_user_id AND package_tier = p_tier AND depth = lv AND placement = 'left'), 0) as current_left,
            COALESCE((SELECT node_count FROM public.tree_level_nodes WHERE user_id = p_user_id AND package_tier = p_tier AND depth = lv AND placement = 'right'), 0) as current_right,
            EXISTS (SELECT 1 FROM public.user_levels WHERE user_id = p_user_id AND package_tier = p_tier AND level = lv) as is_completed
        FROM level_gen
    ) l;

    RETURN COALESCE(v_levels, '[]'::json);
END; $$;

-- 1. Create Withdrawal Request (User)
CREATE OR REPLACE FUNCTION public.process_withdrawal(
    p_user_id uuid,
    p_amount numeric,
    p_method text,
    p_acc_number text,
    p_acc_title text DEFAULT 'Wallet'
)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_balance numeric;
    v_min_withdraw numeric;
BEGIN
    -- Security Check
    IF v_user_id IS NULL OR v_user_id != p_user_id THEN 
        RAISE EXCEPTION 'Unauthorized.'; 
    END IF;

    -- Get Min Withdraw
    SELECT COALESCE(value::numeric, 5.0) INTO v_min_withdraw 
    FROM public.system_settings WHERE key = 'min_withdraw';
    
    IF p_amount < v_min_withdraw THEN
        RETURN json_build_object('success', false, 'message', 'Minimum withdrawal is ' || v_min_withdraw);
    END IF;

    -- Lock and Check Balance
    SELECT wallet_balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
    IF v_balance < p_amount THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient balance. Current: ' || v_balance);
    END IF;

    -- 1. Deduct Balance
    UPDATE public.profiles SET wallet_balance = wallet_balance - p_amount WHERE id = v_user_id;

    -- 2. Create Withdrawal Request
    INSERT INTO public.withdraw_requests (user_id, amount, method, wallet_address, status)
    VALUES (v_user_id, p_amount, p_method, p_acc_number, 'pending');

    -- 3. Log Transaction
    INSERT INTO public.transactions (user_id, amount, type, description, status)
    VALUES (v_user_id, p_amount, 'withdraw', 'Withdrawal Request (' || p_method || ')', 'pending');

    RETURN json_build_object('success', true, 'message', 'Withdrawal request submitted.');
END; $$;

-- 2. Get Pending Withdrawals (Admin)
CREATE OR REPLACE FUNCTION public.get_admin_withdrawals(p_status text)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    amount numeric,
    method text,
    wallet_address text,
    status text,
    created_at timestamp with time zone,
    full_name text,
    phone text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
#variable_conflict use_column
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    RETURN QUERY
    SELECT 
        wr.id, 
        wr.user_id, 
        wr.amount, 
        wr.method, 
        wr.wallet_address, 
        wr.status, 
        wr.created_at, 
        pr.full_name, 
        pr.phone
    FROM public.withdraw_requests wr
    JOIN public.profiles pr ON wr.user_id = pr.id
    WHERE wr.status = p_status
    ORDER BY wr.created_at DESC;
END; $$;

-- 3. Update Withdrawal Status (Admin)
CREATE OR REPLACE FUNCTION public.handle_withdrawal_admin(p_request_id uuid, p_new_status text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid;
    v_amount numeric;
    v_current_status text;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Access denied.';
    END IF;

    SELECT user_id, amount, status INTO v_user_id, v_amount, v_current_status 
    FROM withdraw_requests WHERE id = p_request_id FOR UPDATE;

    IF v_current_status != 'pending' THEN
        RAISE EXCEPTION 'Request already processed.';
    END IF;

    UPDATE withdraw_requests SET status = p_new_status, updated_at = now() WHERE id = p_request_id;

    -- If rejected, refund balance
    IF p_new_status = 'rejected' THEN
        UPDATE profiles SET wallet_balance = wallet_balance + v_amount WHERE id = v_user_id;
        
        -- Update transaction status
        UPDATE transactions SET status = 'failed', description = description || ' (Rejected)'
        WHERE user_id = v_user_id AND amount = v_amount AND type = 'withdraw' AND status = 'pending';
    ELSE
        -- Update transaction status to completed
        UPDATE transactions SET status = 'completed'
        WHERE user_id = v_user_id AND amount = v_amount AND type = 'withdraw' AND status = 'pending';
    END IF;

    RETURN json_build_object('success', true);
END; $$;

-- 4. Get Team Nodes at Level (For Team Builder)
CREATE OR REPLACE FUNCTION public.get_team_nodes_at_level(
    p_root_id uuid,
    p_tier text,
    p_target_depth integer
)
RETURNS TABLE (
    user_id uuid,
    full_name text,
    referral_code text,
    has_empty_left boolean,
    has_empty_right boolean,
    placement_path text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE downline AS (
        -- Base: Immediate children of the root (Depth 1)
        SELECT 
            tp.user_id, 
            tp.parent_id, 
            tp.placement, 
            1 as current_depth,
            tp.placement as path
        FROM public.tree_positions tp
        WHERE tp.parent_id = p_root_id AND tp.package_tier = p_tier

        UNION ALL

        -- Recursive step: Go deeper
        SELECT 
            tp.user_id, 
            tp.parent_id, 
            tp.placement, 
            d.current_depth + 1,
            d.path || ' -> ' || tp.placement
        FROM public.tree_positions tp
        JOIN downline d ON tp.parent_id = d.user_id
        WHERE tp.package_tier = p_tier AND d.current_depth < p_target_depth
    )
    SELECT 
        d.user_id,
        p.full_name,
        p.referral_code,
        NOT EXISTS (SELECT 1 FROM public.tree_positions WHERE parent_id = d.user_id AND placement = 'left' AND package_tier = p_tier) as has_empty_left,
        NOT EXISTS (SELECT 1 FROM public.tree_positions WHERE parent_id = d.user_id AND placement = 'right' AND package_tier = p_tier) as has_empty_right,
        d.path as placement_path
    FROM downline d
    JOIN public.profiles p ON d.user_id = p.id
    WHERE d.current_depth = p_target_depth
    ORDER BY d.path;
END; $$;
