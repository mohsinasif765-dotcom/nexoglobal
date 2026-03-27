"use client";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, History, ArrowDownLeft, ArrowUpRight, 
  Zap, Loader2, Search, Filter, Calendar
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (e) {
      console.error("Fetch History Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
     tx.type.toLowerCase().includes(search.toLowerCase()) || 
     (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-bg-app pb-20 transition-colors duration-300">
      {/* Sticky Native Header */}
      <header className="sticky top-0 z-40 bg-bg-card/70 backdrop-blur-xl border-b border-app pt-10 pb-4 px-5">
        <div className="flex items-center gap-4">
             <button 
                onClick={() => router.back()}
                className="w-9 h-9 bg-bg-app rounded-xl flex items-center justify-center text-text-dim hover:text-primary active:scale-95 transition-all border border-app"
             >
                <ArrowLeft size={18} />
             </button>
             <div>
                <h1 className="text-lg font-black italic tracking-tighter text-text-app leading-none uppercase">Full History</h1>
                <p className="text-[7px] font-black text-text-dim uppercase tracking-widest mt-0.5">Complete Ledger</p>
             </div>
        </div>

        {/* Compact Search Bar */}
        <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
            <input 
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-app border border-app rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-text-app outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-[8px] font-black text-text-dim uppercase tracking-widest italic">Syncing Ledger...</p>
        </div>
      ) : (
        <div className="px-5 mt-6">
           <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, idx) => (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    key={tx.id}
                    className="p-4 bg-bg-card border border-app rounded-[25px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
                  >
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                             tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' :
                             tx.type === 'withdraw' ? 'bg-rose-500/10 text-rose-500' : 
                             tx.type === 'commission' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
                        }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> :
                             tx.type === 'withdraw' ? <ArrowUpRight size={16} /> : 
                             tx.type === 'commission' ? <TrophyIcon size={16} /> : <Zap size={16} />}
                        </div>
                        <div>
                           <p className="font-black italic uppercase text-[9px] text-text-app leading-none mb-1">{tx.type} USDT</p>
                           <p className="text-[7px] font-black uppercase tracking-widest text-text-dim leading-none">
                              {new Date(tx.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`font-black italic text-xs ${
                           tx.type === 'deposit' || tx.type === 'commission' ? 'text-emerald-500' : 'text-text-app'
                        }`}>
                           {tx.type === 'deposit' || tx.type === 'commission' ? '+' : '-'}${tx.amount}
                        </p>
                        <p className="text-[6px] font-black uppercase text-text-dim tracking-tighter mt-0.5 italic">{tx.status}</p>
                     </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center">
                    <History size={48} className="text-text-dim opacity-20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase text-text-dim tracking-[0.2em] italic">No Match Found</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-12 px-10 text-center opacity-30">
          <p className="text-[6px] font-black uppercase tracking-[0.5em] italic">End of History Stream</p>
      </footer>
    </main>
  );
}

function TrophyIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    )
}
