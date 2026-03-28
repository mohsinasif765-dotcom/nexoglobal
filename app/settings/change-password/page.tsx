"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Key, Loader2, ChevronLeft, ShieldCheck, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-app p-6 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[120px] -mr-32 -mt-32 opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[120px] -ml-32 -mb-32 opacity-50" />

      <header className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
         <button 
           onClick={() => router.back()} 
           className="w-10 h-10 bg-bg-card border border-app rounded-2xl flex items-center justify-center text-text-dim hover:text-primary transition-all active:scale-95 shadow-sm"
         >
           <ChevronLeft size={20} />
         </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-bg-card p-10 rounded-[50px] border border-app shadow-2xl relative z-0"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto mb-8 text-primary border border-primary/20 shadow-inner">
          <Lock size={36} />
        </div>
        
        <div className="text-center space-y-2 mb-10">
           <h2 className="text-3xl font-black text-text-app italic uppercase tracking-tighter leading-none">SECURITY <span className="text-primary">CORE</span></h2>
           <p className="text-[10px] text-text-dim font-black uppercase tracking-[0.2em] italic">System Key Protocol Update</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-4">New Secret Password</label>
             <div className="relative group">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-all" size={20} />
                <input
                  type="password"
                  placeholder="Minimum 6 characters..."
                  required
                  className="w-full p-5 pl-14 bg-bg-app border border-app rounded-3xl outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all font-mono text-text-app placeholder:text-text-dim/40 text-lg tracking-widest"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
             </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
               <>
                 Confirm Update <CheckCircle2 size={18} />
               </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className={`mt-8 p-4 rounded-2xl flex items-center justify-center gap-2 border ${message.includes("Error") ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"}`}
            >
               {message.includes("Error") ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
               <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                 {message}
               </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Micro Badge */}
        <div className="mt-10 flex flex-col items-center gap-2 opacity-30 select-none">
           <div className="h-[1px] w-12 bg-app" />
           <p className="text-[7px] font-black uppercase tracking-[0.5em]">End-to-End Encryption</p>
        </div>
      </motion.div>
    </div>
  );
}