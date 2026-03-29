-- Add Admin Binance ID to system settings
INSERT INTO public.system_settings (key, value) 
VALUES ('admin_binance_id', '998877665')
ON CONFLICT (key) DO NOTHING;
