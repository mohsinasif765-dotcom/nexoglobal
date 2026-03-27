"use client";
import { useState, useEffect } from "react";
import { 
  Trophy, Star, Lock, ChevronRight, Zap, TrendingUp, 
  Layers, Wallet, ArrowLeft, Loader2, CheckCircle2,
  Users, MapPin
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LevelsPage() {
  const router = useRouter();
  const [activeTier, setActiveTier] = useState('starter');
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<any[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchLevelStats();
  }, [activeTier]);

  const fetchLevelStats = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_user_level_stats', { 
        p_user_id: user.id,
        p_tier: activeTier
      });
      if (error) throw error;
      setLevels(data || []);
    } catch (e) {
      console.error("Fetch Levels Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const TIERS = [
    { id: 'starter', name: 'Starter', icon: Zap, color: 'text-orange-500' },
    { id: 'plus', name: 'Plus', icon: TrendingUp, color: 'text-blue-500' },
    { id: 'pro', name: 'Pro', icon: Layers, color: 'text-purple-500' },
    { id: 'elite', name: 'Elite', icon: Trophy, color: 'text-emerald-500' },
  ];

  return (
    <main className="min-h-screen bg-bg-app pb-32 transition-colors duration-300">
      {/* Native Sticky Header */}
      <header className="bg-bg-card/80 backdrop-blur-xl sticky top-0 z-40 border-b border-app pt-10 pb-4 px-5 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
            <button 
                onClick={() => router.back()}
                className="w-8 h-8 bg-bg-app border border-app rounded-xl flex items-center justify-center text-text-dim active:scale-95 transition-all"
            >
                <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-black italic tracking-tighter text-text-app leading-none uppercase">Binary Path</h1>
        </div>

        {/* Compact Tier Tabs */}
        <div className="flex bg-bg-app p-1 rounded-xl border border-app">
            {TIERS.map((t) => (
              <button 
                key={t.id}
                onClick={() => setActiveTier(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-black italic text-[8px] uppercase tracking-widest transition-all ${activeTier === t.id ? 'bg-bg-card shadow-sm text-text-app border border-app' : 'text-text-dim'}`}
              >
                <t.icon size={10} className={activeTier === t.id ? t.color : ''} />
                {t.name}
              </button>
            ))}
        </div>
      </header>

      {/* Top Instructions (Compact & Simple) */}
      <div className="px-5 mt-4">
          <div className="p-4 bg-slate-900 dark:bg-white/5 rounded-[25px] border border-white/5 dark:border-white/5 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary p-1.5 rounded-lg text-white">
                      <Zap size={14} />
                  </div>
                  <h4 className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">Binary Reward Guide</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex gap-3">
                      <div className="w-4 h-4 bg-white/10 text-white rounded flex items-center justify-center text-[8px] font-black shrink-0 italic">01</div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight leading-none pt-1">
                          Left & Right <span className="text-white">Balancing</span> pe reward mile ga.
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <div className="w-4 h-4 bg-white/10 text-white rounded flex items-center justify-center text-[8px] font-black shrink-0 italic">02</div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight leading-none pt-1">
                          Har level ki <span className="text-emerald-400">Fixed USDT</span> amount hai.
                      </p>
                  </div>
                  <div className="flex gap-3">
                      <div className="w-4 h-4 bg-primary text-white rounded flex items-center justify-center text-[8px] font-black shrink-0 italic">TIP</div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight leading-none pt-1">
                          Team work se rewards fast hon ge. <span className="text-primary">Apni team ki help</span> karein! 🚀
                      </p>
                  </div>
              </div>
          </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Loading Path...</p>
        </div>
      ) : (
        <div className="px-5 mt-6">
           <div className="relative space-y-4">
              {/* Thinner vertical line */}
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-app -z-10 opacity-50" />

              {levels.map((lv, index) => {
                const status = lv.is_completed ? 'completed' : 'in-progress';
                const leftProgress = Math.min((lv.current_left / lv.required) * 100, 100);
                const rightProgress = Math.min((lv.current_right / lv.required) * 100, 100);

                return (
                  <motion.div 
                    key={lv.level}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative flex gap-4"
                  >
                     {/* Smaller Node */}
                     <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 border-bg-app shadow-md transition-all ${
                        status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-gray-950'
                     }`}>
                        {status === 'completed' ? <Star size={16} /> : <span className="font-black italic text-[10px]">{lv.level}</span>}
                     </div>

                     {/* Compact Card */}
                     <div className={`flex-1 p-4 rounded-[25px] border transition-all ${
                        status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-bg-card border-app shadow-sm'
                     }`}>
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-black italic text-xs tracking-tighter text-text-app uppercase">Level {lv.level}</h3>
                                {status === 'completed' && <CheckCircle2 size={10} className="text-emerald-500" />}
                              </div>
                              <p className="text-[7px] font-black text-text-dim uppercase tracking-widest mt-0.5 italic">Need {lv.required}:{lv.required}</p>
                           </div>
                        </div>

                        {/* Dense Progress Section */}
                        <div className="flex items-center gap-4 bg-bg-app p-2 rounded-xl mb-3 border border-app/50">
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[6px] font-black uppercase text-text-dim">
                                 <span>L</span>
                                 <span>{lv.current_left}</span>
                              </div>
                              <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${leftProgress}%` }} className={`h-full ${status === 'completed' ? 'bg-emerald-400' : 'bg-primary'}`} />
                              </div>
                           </div>
                           <div className="w-[1px] h-4 bg-app shrink-0" />
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between text-[6px] font-black uppercase text-text-dim">
                                 <span>R</span>
                                 <span>{lv.current_right}</span>
                                 </div>
                              <div className="h-1 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${rightProgress}%` }} className={`h-full ${status === 'completed' ? 'bg-emerald-400' : 'bg-primary'}`} />
                              </div>
                           </div>
                        </div>

                        {/* Build Team Button (Only when needed) */}
                        {(status === 'in-progress' || (status === 'completed' && index < levels.length - 1 && !levels[index + 1].is_completed)) && (
                           <Link 
                             href={`/team-builder?tier=${activeTier}&level=${lv.level}`}
                             className="w-full bg-slate-900 dark:bg-white text-white dark:text-gray-950 h-10 rounded-xl flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all border border-white/5"
                           >
                             <Users size={12} />
                             {status === 'completed' ? 'Grow Next' : 'Build Now'}
                           </Link>
                        )}
                     </div>
                  </motion.div>
                );
             })}
           </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="mt-12 text-center pb-20">
          <p className="text-[6px] font-black text-gray-300 uppercase tracking-[0.4em] italic">
              Binary Milestone Protection Active 🛡️
          </p>
      </footer>
    </main>
  );
}
