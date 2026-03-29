-- 1. Create a public bucket for Binance assets (QR Codes)
-- Note: This requires the storage schema and permissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('binance-assets', 'binance-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add New System Settings for Binance QR & Name
INSERT INTO public.system_settings (key, value) VALUES 
('admin_binance_name', 'Admin Account Name'),
('admin_binance_qr_url', '') -- Placeholder for Image URL
ON CONFLICT (key) DO NOTHING;

-- 3. Set Bucket Policies (Allow public read, admin write)
-- Policy: Allow anyone to view files in the binance-assets bucket
DROP POLICY IF EXISTS "Public Access for Binance Assets" ON storage.objects;
CREATE POLICY "Public Access for Binance Assets" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'binance-assets' );
