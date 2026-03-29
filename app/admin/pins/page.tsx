"use client";
import { useState, useEffect } from "react";
// SSR friendly client import kiya
import { createBrowserClient } from "@supabase/ssr"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, X, Loader2, ShieldCheck, Hash
} from "lucide-react";

export default function AdminPinRequests() {
  // Browser client initialize kiya (SSR compatibility ke liye)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<{id: string, type: 'approve' | 'reject'} | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pin_requests_by_status', { 
        p_status: activeTab 
      });
      if (error) throw error;
      setRequests(data || []);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    setConfirmId(null);
    try {
      const { error } = await supabase.rpc('approve_pin_request_bulk', { 
        p_request_id: requestId 
      });
      if (error) throw error;
      fetchRequests(); 
    } catch (e) {
      alert("Verification Failed: TRX ID invalid or already used.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    setConfirmId(null);
    try {
      const { error } = await supabase.rpc('reject_pin_request', { 
        p_request_id: requestId 
      });
      if (error) throw error;
      await fetchRequests();
    } catch (e: any) {
      alert("Reject Failed: " + (e.message || "Server error"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">Pin Center</h1>
        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Request Management</p>
      </header>

      {/* Tabs System */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-primary shadow-sm scale-[1.02]' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200 shadow-sm">
            <ShieldCheck size={40} className="text-primary/20 mx-auto mb-4" />
            <p className="text-gray-400 font-bold italic text-sm uppercase">No {activeTab} requests</p>
          </div>
        ) : (
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div 
                layout key={req.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border border-gray-100 p-6 rounded-[35px] shadow-sm relative overflow-hidden ${
                  activeTab !== 'pending' ? 'opacity-80' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <span className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-primary text-white'
                    }`}>
                      {req.payment_gateway?.replace('_', ' ')} • {req.status}
                    </span>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight mt-2">{req.full_name}</h3>
                    <p className="text-xs text-gray-400 font-bold">{req.phone}</p>
                  </div>
                  <p className="text-xl font-black text-primary tracking-tighter italic">${req.amount.toLocaleString()} USDT</p>
                </div>

                <div className="bg-bg-light p-4 rounded-2xl mb-6 border border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <Hash size={16} className="text-primary" />
                      <div>
                         <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">TRX ID</p>
                         <p className="font-mono font-black text-gray-700 text-sm uppercase">{req.trx_id}</p>
                      </div>
                   </div>
                </div>

                {activeTab === 'pending' && (
                  <div className="relative min-h-[56px]">
                    <AnimatePresence mode="wait">
                      {confirmId?.id === req.id ? (
                        <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2">
                          <button 
  disabled={processingId === req.id}
  onClick={() => {
    // Ye line TypeScript ka error khatam kar degi
    if (!confirmId) return; 
    
    confirmId.type === 'approve' ? handleApprove(req.id) : handleReject(req.id);
  }}
  className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase text-white shadow-lg flex items-center justify-center gap-2 ${
    confirmId?.type === 'approve' ? 'bg-primary shadow-primary/20' : 'bg-red-500 shadow-red-200'
  }`}
>
  {processingId === req.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
  Confirm {confirmId?.type}
</button>
                          <button onClick={() => setConfirmId(null)} className="p-4 bg-gray-100 rounded-2xl text-gray-400"><X size={20} /></button>
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setConfirmId({id: req.id, type: 'approve'})} className="bg-primary/10 text-primary py-4 rounded-2xl font-black text-xs uppercase border border-primary/20 flex justify-center items-center gap-2">
                            <Check size={18} /> Approve
                          </button>
                          <button onClick={() => setConfirmId({id: req.id, type: 'reject'})} className="bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs uppercase border border-gray-100">
                            Reject
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