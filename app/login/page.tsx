"use client";
import { useState } from "react";
import { motion } from "framer-motion";
// 1. SSR wali library se browser client import karen
import { createBrowserClient } from "@supabase/ssr"; 
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  // 2. Client ko component ke andar initialize karen
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // 3. Email trim aur login call
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 4. Profile check
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) throw new Error("Database connectivity masla hai.");
        if (!profile) throw new Error("Account database mein nahi mila.");

        // 5. SAB SE AHAM: window.location.href use karen taake page refresh ho 
        // aur middleware nayi cookies pakar sakay.
        const targetPath = profile.role === "admin" ? "/admin/dashboard" : "/dashboard";
        window.location.href = targetPath;
      }
    } catch (err: any) {
      alert(err.message || "Login fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <section className="w-full flex items-center justify-center p-4 min-h-screen bg-gray-50">
      <motion.div 
        initial="initial" 
        animate="animate" 
        variants={fadeInUp}
        className="w-full max-w-[400px] bg-white rounded-[40px] shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden"
      >
        <div className="bg-primary p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white">NEXO GLOBAL</h2>
          <p className="opacity-80 text-xs font-bold uppercase tracking-widest mt-2 text-white">Member Login</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-300" size={18} />
              <input 
                type="email" 
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-gray-700 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 text-gray-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-gray-700"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-300 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            type="submit"
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all mt-4
              ${loading ? "bg-gray-300 shadow-none" : "bg-primary shadow-primary/30 active:scale-95"}
            `}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                LOGIN TO ACCOUNT <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <div className="p-6 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter">
              Secured by Nexo Global Network
            </p>
        </div>
      </motion.div>
    </section>
  );
}