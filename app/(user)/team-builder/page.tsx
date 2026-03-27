"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Copy, ArrowLeft, Loader2, 
  MapPin, CheckCircle2, ChevronRight,
  TrendingUp, Zap, Activity, ShieldCheck, Trophy,
  Search, Filter, Info
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const TIERS = [
  { id: 'starter', name: 'Starter', icon: Zap, color: 'text-orange-500' },
  { id: 'plus', name: 'Plus', icon: Activity, color: 'text-blue-500' },
  { id: 'pro', name: 'Pro', icon: ShieldCheck, color: 'text-purple-500' },
  { id: 'elite', name: 'Elite', icon: Trophy, color: 'text-emerald-500' },
];

function TeamBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTier, setActiveTier] = useState(searchParams.get('tier') || 'starter');
  const [activeLevel, setActiveLevel] = useState(parseInt(searchParams.get('level') || '1'));
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<any[]>([]);
  const [availablePins, setAvailablePins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchNodes();
    fetchAvailablePins();
  }, [activeTier, activeLevel]);

  const fetchAvailablePins = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pins')
        .select('*')
        .eq('created_for', user.id)
        .eq('package_tier', activeTier)
        .eq('status', 'unused')
        .limit(10);
      
      setAvailablePins(data || []);
    } catch (e) {
      console.error("Fetch Pins Error:", e);
    }
  };

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.rpc('get_team_nodes_at_level', { 
        p_root_id: user.id,
        p_tier: activeTier,
        p_target_depth: activeLevel
      });
      if (error) throw error;
      setNodes(data || []);
    } catch (e) {
      console.error("Fetch Nodes Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Referral code copied! ✨");
  };

  const filteredNodes = nodes.filter(n => 
    n.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.referral_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-bg-app pb-32 transition-colors duration-300">
      {/* Premium Header */}
      <header className="bg-bg-card/80 backdrop-blur-xl sticky top-0 z-40 border-b border-app pt-12 pb-6 px-6 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={() => router.back()}
                className="w-10 h-10 bg-bg-app border border-app rounded-2xl flex items-center justify-center text-text-dim hover:text-primary transition-all active:scale-95 shadow-sm"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-black italic tracking-tighter text-text-app leading-none">TEAM BUILDER</h1>
                <p className="text-[9px] font-black text-text-dim uppercase tracking-widest mt-1">Strategic Placement Optimizer</p>
            </div>
        </div>

        {/* Tier Selector */}
        <div className="flex bg-bg-app border border-app p-1 rounded-2xl overflow-x-auto scrollbar-hide mb-6">
            {TIERS.map((t) => (
              <button 
                key={t.id}
                onClick={() => setActiveTier(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black italic text-[9px] uppercase tracking-widest transition-all ${activeTier === t.id ? 'bg-bg-card shadow-sm text-text-app scale-105 border border-app' : 'text-text-dim'}`}
              >
                <t.icon size={12} className={activeTier === t.id ? 'text-primary' : ''} />
                {t.name}
              </button>
            ))}
        </div>

        {/* Level Selector - Horizontal Pill Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[1,2,3,4,5,6,7,8,9,10].map(lv => (
                <button 
                    key={lv}
                    onClick={() => setActiveLevel(lv)}
                    className={`shrink-0 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeLevel === lv ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-app text-text-dim border border-app active:scale-95'}`}
                >
                    Level {lv}
                </button>
            ))}
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="px-6 mt-6">
          <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
              <input 
                type="text"
                placeholder="Search member by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-card border border-app py-4 pl-12 pr-4 rounded-[25px] text-sm font-bold text-text-app shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-dim/50"
              />
          </div>
      </div>

      {/* SIMPLE INSTRUCTIONS */}
      <div className="px-6 mt-4">
          <div className="bg-primary/5 border border-primary/10 p-5 rounded-[30px] flex items-start gap-4 shadow-sm">
              <div className="bg-bg-card p-2.5 rounded-2xl text-primary shadow-sm border border-app">
                  <Info size={18} />
              </div>
              <div>
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">How to build?</h4>
                  <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-[8px] font-black text-text-dim uppercase tracking-tighter italic">
                          <CheckCircle2 size={10} className="text-emerald-500" /> 1. Select a Level & Plan
                      </li>
                      <li className="flex items-center gap-2 text-[8px] font-black text-text-dim uppercase tracking-tighter italic">
                          <CheckCircle2 size={10} className="text-emerald-500" /> 2. Find "Empty" spots (Green labels)
                      </li>
                      <li className="flex items-center gap-2 text-[8px] font-black text-text-dim uppercase tracking-tighter italic">
                          <CheckCircle2 size={10} className="text-emerald-500" /> 3. Click "Build Now" to Register fast!
                      </li>
                  </ul>
              </div>
          </div>
      </div>

      <div className="px-6 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] font-black text-text-dim uppercase tracking-widest italic leading-none">Scanning Structure...</p>
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="bg-bg-card rounded-[40px] p-12 text-center border border-dashed border-app">
             <Users className="text-text-dim opacity-20 mx-auto mb-4" size={48} />
             <p className="text-xs font-black italic text-text-dim uppercase tracking-widest leading-relaxed">No members found at this level.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNodes.map((node, idx) => (
                <motion.div 
                    layout
                    key={node.user_id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-bg-card p-6 rounded-[35px] border border-app shadow-sm relative overflow-hidden group"
                >
                    {/* Status Background Accent */}
                    {(node.has_empty_left || node.has_empty_right) && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-xl" />
                    )}

                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black italic shadow-inner">
                                {node.full_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black text-text-app text-lg leading-none italic">{node.full_name}</h4>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <MapPin size={10} className="text-text-dim" />
                                    <p className="text-[8px] font-black text-text-dim uppercase tracking-widest truncate max-w-[120px]">
                                        Path: <span className="text-primary">{node.placement_path}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {node.has_empty_left ? (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[7px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg tracking-widest border border-emerald-500/20">Left Empty 🟢</span>
                                    {availablePins.length > 0 && (
                                        <button 
                                            onClick={() => router.push(`/registration?ref=${node.referral_code}&placement=left&pin=${availablePins[0].pin_code}`)}
                                            className="text-[6px] font-black uppercase bg-primary text-white px-2 py-1 rounded-md shadow-sm active:scale-95 transition-all"
                                        >
                                            Build Now
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[7px] font-black uppercase bg-bg-app text-text-dim px-2 py-1 rounded-lg tracking-widest border border-app">Left Full</span>
                            )}
                            {node.has_empty_right ? (
                                <div className="flex flex-col items-end gap-1 mt-1">
                                    <span className="text-[7px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg tracking-widest border border-emerald-500/20">Right Empty 🟢</span>
                                    {availablePins.length > 0 && (
                                        <button 
                                            onClick={() => router.push(`/registration?ref=${node.referral_code}&placement=right&pin=${availablePins[0].pin_code}`)}
                                            className="text-[6px] font-black uppercase bg-primary text-white px-2 py-1 rounded-md shadow-sm active:scale-95 transition-all"
                                        >
                                            Build Now
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[7px] font-black uppercase bg-bg-app text-text-dim px-2 py-1 rounded-lg tracking-widest border border-app">Right Full</span>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-bg-app p-4 rounded-2xl border border-app flex items-center justify-between group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                        <div className="overflow-hidden">
                            <p className="text-[7px] font-black text-text-dim uppercase tracking-widest mb-1">Sponsor Code</p>
                            <p className="font-black text-text-app tracking-wider font-mono text-sm">{node.referral_code}</p>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(node.referral_code)}
                            className="bg-bg-card p-3 rounded-xl shadow-sm border border-app text-text-dim hover:text-primary active:scale-90 transition-all"
                        >
                            <Copy size={16} />
                        </button>
                    </div>

                    {/* Build Indicator */}
                    {(node.has_empty_left || node.has_empty_right) && (
                        <div className="mt-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Perfect for placement!</p>
                        </div>
                    )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TeamBuilderPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Initializing Optimizer...</p>
        </div>
    }>
        <TeamBuilderContent />
    </Suspense>
  );
}
