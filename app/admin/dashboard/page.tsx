"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Ticket, 
  Banknote, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LogOut,
  LayoutDashboard 
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import AdminNav from "@/components/AdminNav";

export default function AdminStats() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    totalVolume: 0,
    pendingPayouts: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    console.log("🚀 Initializing Admin Dashboard...");
    try {
      setIsVerifying(true);
      
      // 1. Session Check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log("❌ No User Found:", authError);
        window.location.href = "/login";
        return;
      }
      console.log("👤 User verified:", user.email);

      // 2. Role Check
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        console.log("🚫 Role check failed:", profileError || "Not an admin");
        window.location.href = "/dashboard";
        return;
      }
      console.log("🔑 Admin Role Confirmed");

      // 3. Stats Fetch
      await fetchStats();

    } catch (err) {
      console.error("🔥 Global Error in AdminStats:", err);
    } finally {
      // Circle ko lazmi hatana hai
      setIsVerifying(false);
      console.log("🏁 Verification finished, showing UI");
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (error) throw error;
      if (data) setStats(data);
      console.log("📊 Stats updated successfully");
    } catch (e) {
      console.error("❌ RPC Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Secure Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light pb-24 text-gray-900">
      <header className="p-6 bg-white border-b border-gray-200 sticky top-0 z-20 backdrop-blur-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">ADMIN CONTROL</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Network Analytics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.href = '/dashboard'}
            title="Go to User Dashboard"
            className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
          >
            <LayoutDashboard size={20} />
          </button>

          <button 
            onClick={handleLogout}
            title="Logout"
            className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-100 transition-all"
          >
            <LogOut size={20} />
          </button>

          <button 
            onClick={fetchStats}
            title="Refresh Stats"
            className="bg-primary-light p-2.5 rounded-xl border border-primary/20 text-primary active:rotate-180 transition-all duration-500"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <main className="p-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Total Network" 
            value={stats.totalUsers} 
            icon={<Users size={20} />} 
            trend={`+${stats.newUsersToday} Today`}
            trendUp={true}
          />
          <StatCard 
            label="Business Volume" 
            value={`Rs ${stats.totalVolume.toLocaleString()}`} 
            icon={<TrendingUp size={20} />} 
            trend="Total Sales"
            trendUp={true}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 ml-1">
            <div className="w-1 h-4 bg-accent rounded-full" />
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Critical Actions</h3>
          </div>
            

          <motion.div whileTap={{ scale: 0.98 }} className="bg-white border border-gray-100 p-5 rounded-[32px] flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                <Banknote size={24} />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-800">Rs {stats.pendingPayouts.toLocaleString()}</h4>
                <p className="text-xs text-gray-400 font-medium">Unpaid Commissions</p>
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded-full text-gray-400 border border-gray-100">
              <ArrowUpRight size={20} />
            </div>
          </motion.div>
        </div>

        <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-800">
            <AlertCircle size={18} className="text-primary" /> System Health
          </h3>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
             <span className="text-xs font-bold text-gray-500 uppercase">Database Status</span>
             <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">OPERATIONAL</span>
          </div>
        </div>
      </main>

      <AdminNav />
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white border border-gray-100 p-5 rounded-[32px] space-y-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-primary-light text-primary rounded-xl border border-primary/5">
          {icon}
        </div>
        {trendUp ? <ArrowUpRight className="text-emerald-500" size={16} /> : <ArrowDownRight className="text-red-500" size={16} />}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <h2 className="text-xl font-black mt-1 tracking-tight text-gray-900">{value}</h2>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1 h-1 rounded-full bg-emerald-500" />
        <p className={`text-[9px] font-black uppercase text-emerald-600/80`}>{trend}</p>
      </div>
    </div>
  );
}