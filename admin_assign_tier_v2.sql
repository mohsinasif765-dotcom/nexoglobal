-- RPC: admin_assign_tier_v2
-- Allows Admin to manually place a user in a specific tier tree.
-- Automatically finds a parent using the sponsor's existing tree or root.

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
    v_placement text := 'left'; -- Default to left, find_automatic_parent will handle it
    v_existing_pos uuid;
BEGIN
    -- 1. Security Check: Only Admin can call this
    SELECT id INTO v_admin_id FROM profiles WHERE id = auth.uid() AND role = 'admin';
    IF v_admin_id IS NULL THEN 
        RETURN json_build_object('success', false, 'message', 'Unauthorized. Only admins can assign tiers.');
    END IF;

    -- 2. Check if user already has a position in this tier
    SELECT id INTO v_existing_pos FROM tree_positions WHERE user_id = p_user_id AND package_tier = p_tier;
    IF v_existing_pos IS NOT NULL THEN
        RETURN json_build_object('success', false, 'message', 'User already assigned to ' || p_tier || ' tier.');
    END IF;

    -- 3. Determine Sponsor
    -- If no sponsor provided, find the root admin for that tier
    IF p_sponsor_id IS NULL THEN
        SELECT user_id INTO v_actual_sponsor_id FROM tree_positions WHERE parent_id IS NULL AND package_tier = p_tier LIMIT 1;
    ELSE
        v_actual_sponsor_id := p_sponsor_id;
    END IF;

    IF v_actual_sponsor_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Root sponsor not found for ' || p_tier || '. Setup tier root first.');
    END IF;

    -- 4. Find Automatic Parent in the Sponsor's Tree
    -- We try Left first, then Right if needed
    v_parent_id := public.find_automatic_parent(v_actual_sponsor_id, 'left', p_tier);
    IF v_parent_id IS NULL THEN
         v_parent_id := public.find_automatic_parent(v_actual_sponsor_id, 'right', p_tier);
         v_placement := 'right';
    END IF;

    -- 5. Insert Position
    INSERT INTO tree_positions (user_id, package_tier, parent_id, sponsor_id, placement)
    VALUES (p_user_id, p_tier, v_parent_id, v_actual_sponsor_id, v_placement);

    -- 6. Log Transaction
    INSERT INTO transactions (user_id, amount, type, description, status)
    VALUES (p_user_id, 0, 'admin_activation', 'Manual Activation: ' || p_tier, 'completed');

    RETURN json_build_object(
        'success', true, 
        'message', 'User successfully assigned to ' || p_tier,
        'parent_id', v_parent_id,
        'placement', v_placement
    );
END; $$;
