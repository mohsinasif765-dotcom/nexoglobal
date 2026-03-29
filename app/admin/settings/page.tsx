"use client";
import { useState, useEffect } from "react";
import { 
  Settings, Save, Zap, TrendingUp, ShieldCheck, 
  Trophy, Globe, Lock, DollarSign, Percent,
  Layers, Wallet, ArrowLeft, Loader2, CheckCircle2,
  Clock, ShieldAlert, Upload, Image, Trash2, X
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<any>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('system_settings').select('*');
      if (error) throw error;
      
      const settingsMap = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value?.toString() || ""
      }));

      const { error } = await supabase.from('system_settings').upsert(updates);
      if (error) throw error;
      alert("Settings updated successfully!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr-code-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('binance-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('binance-assets')
        .getPublicUrl(filePath);

      handleUpdate('admin_binance_qr_url', publicUrl);
      alert("QR Code uploaded! Don't forget to save settings.");
    } catch (error: any) {
      alert("Upload error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQr = async () => {
    if (!confirm("Are you sure you want to remove the QR Code?")) return;
    handleUpdate('admin_binance_qr_url', '');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg transition-colors duration-300">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  const toggleMaintenance = () => {
    const isNow = settings.maintenance_mode === 'true' ? 'false' : 'true';
    handleUpdate('maintenance_mode', isNow);
  };

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto bg-app-bg min-h-screen transition-colors duration-300">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-app-text uppercase">System Config</h1>
          <p className="text-[10px] font-bold text-app-dim uppercase tracking-widest mt-1">Platform Parameters</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span className="text-[10px] font-black uppercase tracking-widest">Save All</span>
        </button>
      </header>

      <div className="space-y-10">
        {/* MAINTENANCE MODE SECTION */}
        <section className="space-y-4">
           <div className="flex items-center gap-3 ml-2">
              <Clock size={18} className="text-secondary" />
              <h3 className="text-xs font-black text-app-dim uppercase tracking-[0.2em]">Protocol Security</h3>
           </div>
           <div className="bg-app-card border border-app-border p-6 rounded-[35px] shadow-sm flex items-center justify-between transition-all">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-2xl ${settings.maintenance_mode === 'true' ? 'bg-amber-500/10 text-amber-500' : 'bg-app-bg text-app-dim'} border border-app-border`}>
                    <ShieldAlert size={20} />
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-app-text italic">Maintenance Mode</h3>
                    <p className="text-[9px] text-app-dim font-bold uppercase tracking-widest mt-0.5">Global restrict access for upgrades</p>
                 </div>
              </div>
              <button 
                onClick={toggleMaintenance}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1.5 ${settings.maintenance_mode === 'true' ? 'bg-amber-500 justify-end' : 'bg-app-bg border border-app-border justify-start'}`}
              >
                 <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-lg" />
              </button>
           </div>
           {settings.maintenance_mode === 'true' && (
              <p className="text-center text-[8px] font-black text-amber-500 uppercase tracking-widest italic animate-pulse">
                System is currently locked for non-admin users
              </p>
           )}
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-3 ml-2">
              <Layers size={18} className="text-primary" />
              <h3 className="text-xs font-black text-app-dim uppercase tracking-[0.2em]">Package Pricing (USDT)</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <SettingInput 
                label="Starter Tier" value={settings.package_starter_price} 
                onChange={(v: string) => handleUpdate('package_starter_price', v)}
                icon={<Zap size={16} />}
              />
              <SettingInput 
                label="Plus Tier" value={settings.package_plus_price} 
                onChange={(v: string) => handleUpdate('package_plus_price', v)}
                icon={<TrendingUp size={16} />}
              />
              <SettingInput 
                label="Pro Tier" value={settings.package_pro_price} 
                onChange={(v: string) => handleUpdate('package_pro_price', v)}
                icon={<ShieldCheck size={16} />}
              />
              <SettingInput 
                label="Elite Tier" value={settings.package_elite_price} 
                onChange={(v: string) => handleUpdate('package_elite_price', v)}
                icon={<TrendingUp size={16} />}
              />
           </div>
        </section>

         <section className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
               <TrendingUp size={18} className="text-primary" />
               <h3 className="text-xs font-black text-app-dim uppercase tracking-[0.2em]">Binary Matching Rewards (Fixed USDT)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <SettingInput 
                 label="Starter Match ($)" value={settings.package_starter_level_reward} 
                 onChange={(v: string) => handleUpdate('package_starter_level_reward', v)}
                 icon={<Zap size={16} />}
               />
               <SettingInput 
                 label="Plus Match ($)" value={settings.package_plus_level_reward} 
                 onChange={(v: string) => handleUpdate('package_plus_level_reward', v)}
                 icon={<TrendingUp size={16} />}
               />
               <SettingInput 
                 label="Pro Match ($)" value={settings.package_pro_level_reward} 
                 onChange={(v: string) => handleUpdate('package_pro_level_reward', v)}
                 icon={<ShieldCheck size={16} />}
               />
               <SettingInput 
                 label="Elite Match ($)" value={settings.package_elite_level_reward} 
                 onChange={(v: string) => handleUpdate('package_elite_level_reward', v)}
                 icon={<TrendingUp size={16} />}
               />
            </div>
         </section>

         <section className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
               <Globe size={18} className="text-primary" />
               <h3 className="text-xs font-black text-app-dim uppercase tracking-[0.2em]">Global Metrics</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
               <SettingInput 
                 label="Minimum Withdrawal (USDT)" value={settings.min_withdraw} 
                 onChange={(v: string) => handleUpdate('min_withdraw', v)}
                 icon={<Wallet size={16} />}
               />
            </div>
         </section>

         {/* BINANCE CONFIGURATION SECTION */}
         <section className="space-y-4">
            <div className="flex items-center gap-3 ml-2">
               <ShieldCheck size={18} className="text-purple-600" />
               <h3 className="text-xs font-black text-app-dim uppercase tracking-[0.2em]">Binance Pay Assets</h3>
            </div>
            <div className="bg-app-card border border-app-border p-6 rounded-[35px] shadow-sm space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <SettingInput 
                    label="Binance Pay ID" value={settings.admin_binance_id} 
                    onChange={(v: string) => handleUpdate('admin_binance_id', v)}
                    icon={<Lock size={16} />}
                    isText
                  />
                  <SettingInput 
                    label="Receiver Name" value={settings.admin_binance_name} 
                    onChange={(v: string) => handleUpdate('admin_binance_name', v)}
                    icon={<Settings size={16} />}
                    isText
                  />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black italic text-app-dim uppercase tracking-widest pl-2">Binance QR Code</label>
                  <div className="flex items-center gap-4 p-4 bg-app-bg rounded-2xl border border-app-border">
                     {settings.admin_binance_qr_url ? (
                        <div className="relative group">
                           <img 
                              src={settings.admin_binance_qr_url} 
                              alt="QR Preview" 
                              className="w-16 h-16 object-cover rounded-xl border border-app-border"
                           />
                           <button 
                              onClick={handleDeleteQr}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     ) : (
                        <div className="w-16 h-16 bg-white/5 rounded-xl border border-dashed border-app-border flex items-center justify-center text-app-dim/50">
                           <Image size={24} />
                        </div>
                     )}
                     
                     <div className="flex-1">
                        <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-app-text px-4 py-3 rounded-xl border border-app-border flex items-center justify-center gap-2 transition-all">
                           {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                           <span className="text-[10px] font-black uppercase tracking-widest">
                              {settings.admin_binance_qr_url ? 'Replace QR Code' : 'Upload QR Code'}
                           </span>
                           <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleQrUpload}
                              className="hidden"
                           />
                        </label>
                     </div>
                  </div>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
}

function SettingInput({ label, value, onChange, icon, percentage, isText }: any) {
  return (
    <div className="bg-app-card border border-app-border p-5 rounded-[30px] shadow-sm transition-all active:scale-95 group">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-app-bg rounded-xl text-primary group-hover:scale-110 transition-transform">{icon}</div>
        <label className="text-[9px] font-black italic text-app-dim uppercase tracking-widest leading-none">{label}</label>
      </div>
      <div className="relative">
        <input 
          type={isText ? "text" : "number"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-app-bg border border-app-border p-3.5 rounded-2xl text-sm font-black italic outline-none focus:ring-2 focus:ring-primary transition-all pr-12 text-app-text placeholder:text-app-dim/30"
          placeholder={isText ? "Enter value..." : "0.00"}
        />
        {!isText && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-app-dim/50">
             {percentage ? '%' : 'USDT'}
          </div>
        )}
      </div>
    </div>
  );
}
