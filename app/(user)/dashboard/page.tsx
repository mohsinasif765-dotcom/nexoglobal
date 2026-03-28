"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Copy, 
  CheckCircle, 
  Clock, 
  LogOut,
  Loader2,
  TrendingUp,
  Zap,
  Target,
  UserPlus,
  Key,
  ShieldCheck,
  Ticket,
  Layers,
  MessageCircle,
  Lock,
  User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; 
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState("starter");
  
  const [userData, setUserData] = useState<any>({
    name: "",
    status: "pending",
    referralCode: "...",
    walletBalance: 0,
    totalEarned: 0,
    treeStats: []
  });

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        window.location.href = "/login";
        return;
      }

      const { data: stats, error } = await supabase.rpc('get_user_dashboard_stats', {
        p_user_id: authUser.id
      });
      if (error) throw error;

      if (stats) {
        setUserData({
          name: stats.full_name,
          status: stats.status,
          referralCode: stats.referral_code,
          walletBalance: stats.wallet_balance,
          totalEarned: stats.total_earned,
          treeStats: stats.tree_stats || []
        });
        
        if (stats.tree_stats?.length > 0 && !selectedTier) {
          setSelectedTier(stats.tree_stats[0].package_tier);
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentTree = userData.treeStats.find((t: any) => t.package_tier === selectedTier) || {
    left_count: 0,
    right_count: 0,
    total_pairs_matched: 0
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; 
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(userData.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app text-primary transition-colors duration-300">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-text-dim italic">Syncing Global Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-app pb-24 transition-colors duration-300">
      <header className="bg-bg-card/80 backdrop-blur-xl p-5 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b border-app transition-colors duration-300">
        <div>
          <p className="text-[10px] text-text-dim font-black uppercase tracking-[0.2em] leading-none mb-1 italic">Welcome Back,</p>
          <h1 className="text-xl font-black text-text-app flex items-center gap-2 italic">
            {userData.name}
            <span className={`text-[8px] px-2.5 py-1.5 rounded-full font-black uppercase flex items-center gap-1.5 border transition-all ${userData.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
              {userData.status === 'active' ? <ShieldCheck size={10} /> : <Clock size={10} />} {userData.status}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="w-[1px] h-6 bg-app mx-1 hidden sm:block" />
          <button onClick={() => router.push("/profile")} className="p-2.5 bg-bg-card rounded-xl text-text-dim border border-app hover:text-primary transition-all active:scale-90 shadow-sm"><User size={20} /></button>
        </div>
      </header>

      <main className="p-5 space-y-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          onClick={() => router.push('/wallet')}
          className="relative w-full bg-gray-900 rounded-[40px] shadow-2xl p-8 text-white overflow-hidden border border-white/5 cursor-pointer group hover:bg-black transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-10 -mt-10 blur-3xl opacity-50 group-hover:bg-primary/40" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">Available Balance</p>
              <h2 className="text-4xl font-black mt-2 tracking-tighter italic">{(userData.walletBalance || 0).toLocaleString()} <span className="text-sm">USDT</span></h2>
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mt-2 tracking-[0.2em]">Total Earned: {(userData.totalEarned || 0).toLocaleString()} USDT</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary transition-colors"><Wallet size={24} className="text-primary group-hover:text-white" /></div>
              <span className="text-[8px] font-black text-primary uppercase">Manage</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/pins')}
            className="p-6 bg-bg-card rounded-[32px] border border-app shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-active:bg-primary group-active:text-white transition-all">
              <Ticket size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-app italic">Buy PINs</span>
          </button>
          
          <button 
            onClick={() => router.push('/levels')}
            className="p-6 bg-bg-card rounded-[32px] border border-app shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-active:bg-primary group-active:text-white transition-all">
              <Layers size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-app italic">My Levels</span>
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-text-dim uppercase tracking-widest ml-2">Network Tiers</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {["starter", "plus", "pro", "elite"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic transition-all border-2 shrink-0 ${selectedTier === tier ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-bg-card border-app text-text-dim active:scale-95'}`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {userData.treeStats.some((t: any) => t.package_tier === selectedTier) ? (
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Left Team" value={currentTree.left_count} icon={<Target size={16}/>} color="bg-bg-card text-primary border-primary/20" />
            <StatCard title="Right Team" value={currentTree.right_count} icon={<Target size={16}/>} color="bg-bg-card text-primary border-primary/20" />
            <StatCard title="Matched Pairs" value={currentTree.total_pairs_matched} icon={<Zap size={16}/>} color="bg-bg-card text-primary border-primary/20" />
            <StatCard title="Tier Status" value="Active" icon={<ShieldCheck size={16}/>} color="bg-bg-card text-primary border-primary/20" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card border-2 border-dashed border-app p-8 rounded-[40px] text-center space-y-4"
          >
            <div className="w-16 h-16 bg-app-bg rounded-full flex items-center justify-center mx-auto text-text-dim border border-app">
              <Lock size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-app italic uppercase tracking-tighter">Tier Locked</h3>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mt-1">You are not yet a participant in the {selectedTier} protocol</p>
            </div>
            <button 
              onClick={() => window.open('https://t.me/nexoglobal_support')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle size={16} /> Contact Admin to Upgrade
            </button>
          </motion.div>
        )}

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-bg-card p-6 rounded-[35px] border border-app shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-text-app italic uppercase tracking-tighter flex items-center gap-2">Referral Code</h3>
          </div>
          <div className="flex gap-2">
            <div className="bg-bg-app flex-1 p-4 rounded-2xl border border-app text-text-app font-mono font-black text-sm flex items-center tracking-widest uppercase">{userData.referralCode}</div>
            <button onClick={copyToClipboard} className={`px-5 rounded-2xl transition-all shadow-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-primary/20'}`}>
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-5 rounded-[32px] ${color} flex flex-col gap-2 border shadow-sm transition-all active:scale-95`}>
      <div className="flex items-center gap-1.5 opacity-60">{icon}<p className="text-[9px] font-black uppercase tracking-widest">{title}</p></div>
      <h3 className="text-xl font-black tracking-tighter leading-none italic">{value}</h3>
    </motion.div>
  );
}