"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Wallet, 
  Copy, 
  Check, 
  Send, 
  Loader2, 
  Info,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import BottomNav from "@/components/BottomNav";

export default function DepositPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [adminBinanceId, setAdminBinanceId] = useState("");
  const [adminBinanceName, setAdminBinanceName] = useState("");
  const [adminBinanceQr, setAdminBinanceQr] = useState("");
  const [copied, setCopied] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [trxId, setTrxId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    
    const [{ data: profile }, { data: settingsData }] = await Promise.all([
      supabase.from('profiles').select('wallet_balance').eq('id', user.id).single(),
      supabase.from('system_settings').select('key, value').in('key', ['admin_binance_id', 'admin_binance_name', 'admin_binance_qr_url'])
    ]);
      
    if (profile) setBalance(profile.wallet_balance || 0);
    
    if (settingsData) {
      const s = settingsData.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
      setAdminBinanceId(s.admin_binance_id || "");
      setAdminBinanceName(s.admin_binance_name || "");
      setAdminBinanceQr(s.admin_binance_qr_url || "");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adminBinanceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitRequest = async () => {
    if (!amount || !trxId) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('pin_requests').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        trx_id: trxId,
        payment_gateway: 'binance_pay',
        status: 'pending'
      });

      if (error) throw error;

      alert("Deposit request submitted successfully! Admin will verify your TRX ID soon.");
      router.push('/(user)/pins'); // Redirect back to PINs or some history page
    } catch (error: any) {
      alert("Submission Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg-app">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-app pb-32">
      
      {/* 1. APP HEADER */}
      <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-app px-6 pt-12 pb-4">
        <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 bg-bg-app rounded-2xl border border-app text-text-dim">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter text-text-app uppercase leading-none">DEPOSIT FUNDS</h1>
        </div>
      </header>

      <main className="px-6 mt-8 space-y-6">
        
        {/* Wallet Balance Summary */}
        <div className="bg-gray-900 rounded-[35px] p-6 text-white border border-white/5 shadow-2xl">
          <p className="text-[10px] font-black uppercase text-white/40 tracking-widest italic mb-2">My Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black italic tracking-tighter">${balance.toLocaleString()}</span>
            <span className="text-xs font-black text-primary uppercase">USDT</span>
          </div>
        </div>

        {/* ADMIN PAYMENT INFO CARD */}
        <div className="bg-bg-card rounded-[35px] border border-app p-8 shadow-sm">
           <header className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-500/10 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter text-text-app uppercase leading-none">Binance Pay</h3>
              <p className="text-text-dim font-black uppercase text-[8px] tracking-[0.3em] mt-2">Verified Manual Deposit</p>
           </header>

           {/* QR Code Section */}
           {adminBinanceQr && (
             <div className="mb-8 p-4 bg-white rounded-[35px] border-4 border-gray-50 shadow-inner flex flex-col items-center">
                <div className="relative w-48 h-48 bg-gray-50 rounded-[28px] overflow-hidden border border-gray-100 p-2">
                   <img 
                     src={adminBinanceQr} 
                     alt="Binance QR" 
                     className="w-full h-full object-contain rounded-2xl"
                   />
                </div>
                <p className="text-[8px] font-black text-primary uppercase tracking-widest mt-4 animate-pulse">Scan to Pay via App</p>
             </div>
           )}

           <div className="bg-bg-app border border-app p-6 rounded-[32px] relative group overflow-hidden">
               {adminBinanceName && (
                 <div className="mb-4 pb-4 border-b border-app/50 text-center">
                    <p className="text-[8px] font-black uppercase text-text-dim tracking-widest mb-1">Receiver Name</p>
                    <span className="text-sm font-black italic text-text-app uppercase">{adminBinanceName}</span>
                 </div>
               )}
               <p className="text-[8px] font-black uppercase text-text-dim tracking-widest mb-2 text-center">Binance Pay ID</p>
               <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-black italic tracking-tight text-text-app">{adminBinanceId}</span>
                  <button 
                    onClick={handleCopy}
                    className={`p-3.5 rounded-2xl transition-all ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-bg-card text-text-dim border border-app active:scale-95 hover:bg-bg-app'}`}
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
               </div>
           </div>
        </div>

        {/* DEPOSIT FORM */}
        <div className="space-y-4">
          <div className="bg-bg-card p-5 rounded-[32px] border border-app shadow-sm">
              <label className="text-[10px] font-black uppercase text-text-dim tracking-widest block mb-2 px-2">Deposit Amount ($)</label>
              <div className="bg-bg-app rounded-2xl p-4 flex items-center gap-3 border border-app">
                  <Wallet size={20} className="text-primary" />
                  <input 
                    type="number" 
                    placeholder="Enter amount in USDT"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent font-black italic text-lg outline-none text-text-app placeholder:text-text-dim/30"
                  />
              </div>
          </div>

          <div className="bg-bg-card p-5 rounded-[32px] border border-app shadow-sm">
              <label className="text-[10px] font-black uppercase text-text-dim tracking-widest block mb-2 px-2">Transaction ID (TRX ID)</label>
              <div className="bg-bg-app rounded-2xl p-4 flex items-center gap-3 border border-app">
                  <Zap size={20} className="text-orange-500" />
                  <input 
                    type="text" 
                    placeholder="Paste your 9-digit TRX ID"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="flex-1 bg-transparent font-black italic text-lg outline-none text-text-app placeholder:text-text-dim/30"
                  />
              </div>
          </div>

          <button 
            onClick={handleSubmitRequest}
            disabled={submitting || !amount || !trxId}
            className="w-full py-6 bg-primary text-white rounded-[32px] font-black italic text-xs uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <>Submitting Proof <Send size={16} /></>}
          </button>
        </div>

        <div className="p-4 bg-primary/5 rounded-3xl border border-primary/20">
           <p className="text-[9px] font-black uppercase text-text-dim italic leading-tight text-center">
             Note: Transfer takes 5-30 minutes for manual verification.<br/>Make sure to enter the correct TRX ID.
           </p>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
