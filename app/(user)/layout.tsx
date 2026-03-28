"use client";
import BottomNav from "@/components/BottomNav";
import { ReactNode, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Clock, LogOut, ShieldCheck, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string>("active");
  const [userRole, setUserRole] = useState<string>("user");
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    checkGlobalRestrictions();
  }, []);

  const checkGlobalRestrictions = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return; // Middleware handles redirection

      // 1. Fetch User Status & Role
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', authUser.id)
        .single();

      if (profile) {
        setUserStatus(profile.status);
        setUserRole(profile.role);
      }

      // 2. Fetch Maintenance Mode
      const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (setting && setting.value === 'true') {
        setIsMaintenance(true);
      }

    } catch (err) {
      console.error("Restriction check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-app">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Blocking logic priority: Admin bypasses maintenance
  const showMaintenance = isMaintenance && userRole !== 'admin';
  const showBlocked = userStatus === 'blocked';

  return (
    <div className="relative min-h-screen">
      {/* Page Content */}
      <div className="pb-32">
        {children}
      </div>

      {/* Global Navigation */}
      <BottomNav />

      {/* Floating Support Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.open('https://t.me/nexoglobal_support')}
        className="fixed bottom-28 right-6 z-[50] p-4 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group overflow-hidden"
      >
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white rounded-full translate-z-0"
        />
        <MessageCircle size={24} className="relative z-10" />
      </motion.button>

      {/* RESTRICTION OVERLAYS */}
      <AnimatePresence>
        {/* Blocked User Overlay */}
        {showBlocked && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl transition-all duration-500"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="w-full max-w-sm bg-bg-card border border-rose-500/20 rounded-[45px] p-10 text-center shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
                
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/20 text-rose-500 relative">
                   <ShieldAlert size={48} className="relative z-10" />
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-rose-500 rounded-full"
                   />
                </div>

                <h2 className="text-2xl font-black text-text-app uppercase italic tracking-tighter leading-tight mb-4">Account Restricted</h2>
                
                <p className="text-xs text-text-dim font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-80">
                  Your global node access has been restricted by the administration. Please reach out to our verification team to restore access.
                </p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => window.open('https://t.me/nexoglobal_support')}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                     <ShieldCheck size={16} /> Contact Support
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-bg-app border border-app text-text-dim rounded-2xl font-black text-[10px] uppercase italic tracking-widest transition-all hover:text-rose-500 active:scale-95 flex items-center justify-center gap-2"
                  >
                     <LogOut size={16} /> Logout Securely
                  </button>
                </div>
                <p className="mt-8 text-[8px] font-black text-text-dim/30 uppercase tracking-[0.3em] italic">Nexo Global • Protocol Security</p>
             </motion.div>
          </motion.div>
        )}

        {/* Maintenance Mode Overlay */}
        {showMaintenance && !showBlocked && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl transition-all duration-500"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               className="w-full max-w-sm bg-bg-card border border-primary/20 rounded-[45px] p-10 text-center shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20 text-primary relative">
                   <Clock size={48} className="relative z-10" />
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-2 border-2 border-dashed border-primary/20 rounded-full"
                   />
                </div>

                <h2 className="text-2xl font-black text-text-app uppercase italic tracking-tighter leading-tight mb-4">Protocol Upgrading</h2>
                
                <p className="text-xs text-text-dim font-bold uppercase tracking-widest leading-relaxed mb-10 opacity-80">
                  Scheduled maintenance in progress. We are optimizing the protocol for a better experience. We'll be back shortly!
                </p>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => window.open('https://t.me/nexoglobal_announcements')}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                     <ShieldCheck size={16} /> Check Announcements
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-bg-app border border-app text-text-dim rounded-2xl font-black text-[10px] uppercase italic tracking-widest transition-all hover:text-primary active:scale-95 flex items-center justify-center gap-2"
                  >
                     <LogOut size={16} /> Logout Securely
                  </button>
                </div>
                <p className="mt-8 text-[8px] font-black text-text-dim/30 uppercase tracking-[0.3em] italic">Nexo Global • Engineering</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
