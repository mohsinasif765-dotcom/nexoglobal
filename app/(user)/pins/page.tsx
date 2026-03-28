"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Clock, CheckCircle2, 
  Ticket, Send, ArrowRight, ShieldCheck,
  Copy, Check, Wallet, Zap, Lock, 
  CircleEllipsis, History,
  TrendingUp, Loader2, Info
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function PinManagement() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available"); // available | history
  const [purchasing, setPurchasing] = useState(false);
  const [showBuySheet, setShowBuySheet] = useState(false);
  const [stats, setStats] = useState({ total_spent: 0, active_pins: 0 });
  const [balance, setBalance] = useState(0);
  const [myPins, setMyPins] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [selectedTier, setSelectedTier] = useState("starter");
  const [settings, setSettings] = useState<any>({});
  const [activeTiers, setActiveTiers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("user");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPinData();
  }, []);

  const fetchPinData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: profile }, { data: treeData }, { data: pins }, { data: settingsData }, { data: historyData }] = await Promise.all([
        supabase.from('profiles').select('referral_code, wallet_balance, role').eq('id', user.id).maybeSingle(),
        supabase.from('tree_positions').select('package_tier').eq('user_id', user.id),
        supabase.from('pins').select('*').eq('created_for', user.id).eq('status', 'unused').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('key, value'),
        supabase.from('transactions').select('*').eq('user_id', user.id).eq('type', 'pin_purchase').order('created_at', { ascending: false })
      ]);

      if (profile) {
        setReferralCode(profile.referral_code);
        setBalance(profile.wallet_balance || 0);
        setUserRole(profile.role || "user");
      }
      if (treeData) {
        const owned = treeData.map(t => t.package_tier);
        setActiveTiers(owned);
        if (owned.length > 0) {
          setSelectedTier(owned[0]);
        }
      }
      if (pins) setMyPins(pins);
      if (historyData) setHistory(historyData);
      
      const settingsObj = settingsData?.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setSettings(settingsObj || {});

      setStats({
        total_spent: historyData?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
        active_pins: pins?.length || 0,
      });

    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPin = async () => {
    const price = parseFloat(settings[`package_${selectedTier}_price`] || "5"); 
    if (balance < price) {
      alert(`Insufficient Balance. Need ${price} USDT.`);
      return;
    }

    setPurchasing(true);
    try {
      const { data, error } = await supabase.rpc('buy_pin_with_balance', { p_tier: selectedTier });
      if (error) throw error;
      setShowBuySheet(false);
      fetchPinData(); 
    } catch (e: any) {
      alert(e.message || "Purchase failed.");
    } finally {
      setPurchasing(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUsePin = (tier: string) => {
    router.push(`/levels?tier=${tier}`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app">
      <Loader2 className="animate-spin text-primary mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-text-dim italic">Syncing Vouchers...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-bg-app pb-32 transition-colors duration-300">
      {/* Native App Header */}
      <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-app px-6 pt-12 pb-4 transition-colors duration-300">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-text-app leading-none uppercase">PIN CENTER</h1>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <p className="text-[8px] font-black text-text-dim uppercase tracking-widest italic">Global P2P Network Active</p>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowBuySheet(true)}
              className="w-11 h-11 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 border border-white/10 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </motion.button>
        </div>
      </header>

      <div className="px-6 mt-8 space-y-8">
        
        {/* Compact Wallet Card */}
        <div className="relative group">
           <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full scale-90 -z-10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
           <div className="bg-gray-900 rounded-[35px] p-6 text-white overflow-hidden relative border border-white/5 shadow-2xl shadow-indigo-500/10">
              <div className="flex justify-between items-start">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2 opacity-40">
                        <Wallet size={12} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Available Funds</span>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black italic tracking-tighter">${balance.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-primary/60 uppercase italic">USDT</span>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-400/10 rounded-lg">Verified Account</span>
                     <TrendingUp size={14} className="text-emerald-400 mt-2" />
                  </div>
              </div>
           </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex bg-bg-app p-1 rounded-2xl border border-app">
            <button 
              onClick={() => setActiveTab("available")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black italic text-[10px] uppercase tracking-widest transition-all ${activeTab === 'available' ? 'bg-bg-card shadow-sm text-text-app border border-app' : 'text-text-dim'}`}
            >
              <Ticket size={14} /> Available ({myPins.length})
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black italic text-[10px] uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-bg-card shadow-sm text-text-app border border-app' : 'text-text-dim'}`}
            >
              <History size={14} /> History
            </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'available' ? (
            <motion.div 
              key="available"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
               {myPins.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-16 h-16 bg-bg-app rounded-full flex items-center justify-center mb-4 text-text-app border border-app">
                       <CircleEllipsis size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed text-text-app">Your voucher vault is empty.<br/>Generate a new PIN to get started.</p>
                 </div>
               ) : (
                 myPins.map((pin) => (
                   <div key={pin.id} className="relative bg-bg-card rounded-[32px] border border-app p-5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      {/* Voucher Notch Design */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-bg-card border-l border-app rounded-l-full -mr-2" />
                      
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                               <Zap size={20} />
                            </div>
                            <div>
                               <h4 className="text-xs font-black italic uppercase text-text-app tracking-tight leading-none">{pin.package_tier} Voucher</h4>
                               <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">Value: ${settings[`package_${pin.package_tier}_price`] || "5"} USDT</p>
                            </div>
                         </div>
                          <button 
                            onClick={() => handleCopy(pin.pin_code, pin.id)}
                            className={`p-2.5 rounded-xl transition-all ${copiedId === pin.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-app text-text-dim hover:text-text-app border border-app shadow-sm'}`}
                          >
                            {copiedId === pin.id ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                      </div>

                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-bg-app border border-app py-3.5 rounded-2xl flex items-center justify-center font-mono font-black text-base tracking-widest text-text-app">
                            {pin.pin_code}
                         </div>
                         <button 
                            onClick={() => handleUsePin(pin.package_tier)}
                            className="bg-primary text-white p-3.5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all border border-primary"
                         >
                            <ArrowRight size={20} />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="bg-bg-card rounded-[35px] border border-app overflow-hidden shadow-sm"
            >
               {history.length === 0 ? (
                 <p className="p-12 text-center text-[10px] font-black uppercase text-text-dim tracking-widest italic opacity-40">No history entries</p>
               ) : (
                 history.slice(0, 15).map((item, idx) => (
                    <div key={item.id} className={`p-5 flex items-center justify-between bg-bg-card ${idx !== history.length - 1 ? 'border-b border-app' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-bg-app rounded-xl text-text-dim border border-app"><History size={14} /></div>
                          <div>
                             <p className="text-[10px] font-black text-text-app uppercase italic leading-none mb-1">Generated PIN</p>
                             <p className="text-[8px] font-black text-text-dim uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <p className="font-black italic text-xs text-primary">-${item.amount}</p>
                    </div>
                 ))
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Row */}
        <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20 flex items-start gap-3">
           <Info className="text-primary shrink-0" size={16}/>
           <p className="text-[9px] font-black text-text-dim dark:text-text-app uppercase tracking-tight leading-relaxed italic">
             Share your PIN Code with new members to activate their accounts instantly.
           </p>
        </div>

      </div>

      {/* Buy PIN Bottom Sheet */}
      <AnimatePresence>
        {showBuySheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBuySheet(false)} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-bg-card border-t border-app rounded-t-[45px] p-8 pb-12 shadow-3xl"
            >
               {/* Handle icon */}
               <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-8" />
               
               <header className="text-center mb-8">
                  <h3 className="text-3xl font-black italic tracking-tighter text-text-app uppercase italic leading-none">GENERATE <span className="text-primary">PIN</span></h3>
                  <p className="text-text-dim font-black italic uppercase text-[9px] tracking-widest mt-2">Select Tier Value</p>
               </header>

               <div className="grid grid-cols-2 gap-3 mb-8">
                  {['starter', 'plus', 'pro', 'elite'].map(t => {
                     const isLocked = userRole !== 'admin' && !activeTiers.includes(t);
                     return (
                        <button 
                           key={t} onClick={() => !isLocked && setSelectedTier(t)}
                           className={`p-5 rounded-3xl border-2 flex flex-col items-center gap-1 transition-all relative overflow-hidden active:scale-95 ${selectedTier === t ? 'border-primary bg-primary/5 text-primary' : 'border-app bg-bg-app text-text-dim'} ${isLocked ? 'opacity-40 grayscale' : 'hover:border-primary/50'}`}
                           disabled={isLocked}
                        >
                           {isLocked && <Lock size={12} className="absolute top-2 right-2 opacity-50" />}
                           <span className="font-black italic uppercase text-[8px] tracking-widest leading-none">{t}</span>
                           <span className="text-base font-black italic tracking-tighter leading-tight mt-1">${settings[`package_${t}_price`] || "5"}</span>
                        </button>
                     );
                  })}
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                     <p className="text-[10px] font-black uppercase text-text-dim tracking-widest">Selected Tier Value</p>
                     <p className="text-xl font-black italic text-text-app leading-none">${settings[`package_${selectedTier}_price`] || "5"} USDT</p>
                  </div>

                   <button 
                      onClick={handleBuyPin}
                      disabled={purchasing}
                      className="w-full bg-primary text-white py-6 rounded-[28px] font-black italic text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                   >
                      {purchasing ? <Loader2 className="animate-spin" size={20} /> : <>Generate PIN Now <ArrowRight size={16} /></>}
                   </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}