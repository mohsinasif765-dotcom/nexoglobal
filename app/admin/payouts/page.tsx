"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// SSR Client import kiya
import { createBrowserClient } from "@supabase/ssr"; 
import { Check, X, Calendar, Users, Loader2, ArrowRight, CreditCard } from "lucide-react";

export default function AdminPayouts() {
  // Browser client initialize kiya
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<{id: string, type: 'approved' | 'rejected'} | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [activeTab]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_admin_withdrawals', {
        p_status: activeTab
      });
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, status: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    try {
      const { error } = await supabase.rpc('handle_withdrawal_admin', {
        p_request_id: requestId,
        p_new_status: status
      });

      if (error) throw error;
      
      setWithdrawals(prev => prev.filter(w => w.id !== requestId));
      setConfirmId(null);
      alert(`Withdrawal ${status} successfully!`);
      
    } catch (e: any) {
      alert("Action failed: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">Payouts</h1>
      </header>
      {/* TABS SYSTEM */}
      <div className="flex bg-gray-100 p-1.5 rounded-[22px] mb-8">
        {(['pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-primary shadow-sm scale-105' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold italic">No {activeTab} withdrawals found.</p>
          </div>
        ) : (
          <AnimatePresence>
            {withdrawals.map((req) => (
                <motion.div 
                  layout key={req.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 p-6 rounded-[35px] shadow-sm relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Users size={24} /></div>
                      <div>
                        <h4 className="font-black text-lg leading-tight text-gray-800">{req.full_name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{req.phone}</p>
                      </div>
                    </div>
                    <div className="bg-bg-light px-3 py-1.5 rounded-xl border border-gray-100 flex items-center gap-2">
                       <Calendar size={12} className="text-primary" />
                       <span className="text-[10px] font-black text-gray-500">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* ADDRESS BOX */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-3xl mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                            <CreditCard size={18} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{req.method}</p>
                            <p className="text-xs font-black text-emerald-900 tracking-wider truncate max-w-[150px]">{req.wallet_address}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(req.wallet_address);
                            alert("Address copied!");
                        }}
                        className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg active:scale-90 transition-all shrink-0"
                    >
                        Copy
                    </button>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                    <p className="text-[9px] text-primary font-black uppercase mb-1">Requested Amount</p>
                    <p className="text-2xl font-black text-primary tracking-tighter italic">${req.amount.toLocaleString()}</p>
                  </div>

                  {activeTab === 'pending' && (
                    <div className="relative min-h-[56px]">
                       <AnimatePresence mode="wait">
                          {confirmId && confirmId.id === req.id ? (
                            <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 h-full">
                               <button 
                                  disabled={processingId === req.id}
                                  onClick={() => handleAction(req.id, confirmId.type)}
                                  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase text-white shadow-lg flex items-center justify-center gap-2 ${
                                    confirmId.type === 'approved' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-red-500 shadow-red-200'
                                  }`}
                               >
                                  {processingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                                  Confirm {confirmId.type}
                                </button>
                                <button onClick={() => setConfirmId(null)} className="px-6 bg-gray-100 text-gray-400 rounded-2xl">
                                   <X size={20} />
                                </button>
                             </motion.div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                               <button 
                                  onClick={() => setConfirmId({id: req.id, type: 'approved'})}
                                  className="bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-xs uppercase border border-emerald-100 flex justify-center items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all"
                               >
                                  <Check size={18} /> Approve
                               </button>
                               <button 
                                  onClick={() => setConfirmId({id: req.id, type: 'rejected'})}
                                  className="bg-red-50 text-red-400 py-4 rounded-2xl font-black text-xs uppercase border border-red-100 flex justify-center items-center gap-2 hover:bg-red-500 hover:text-white transition-all"
                               >
                                  <X size={18} /> Reject
                                </button>
                            </div>
                          )}
                       </AnimatePresence>
                    </div>
                  )}
                </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}