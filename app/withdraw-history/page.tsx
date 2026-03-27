"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Banknote
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WithdrawRequest {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
  account_number: string;
}

export default function WithdrawHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<WithdrawRequest[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('withdraw_requests')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle2 size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <header className="bg-white p-5 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Withdrawal History</h1>
      </header>

      <main className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={30} />
            <p className="text-gray-400 text-xs mt-3">Loading History...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Koi history nahi mili.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
              >
                {/* Side Status Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 
                  ${item.status === 'approved' ? 'bg-green-500' : item.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} 
                />

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amount Requested</p>
                      <h3 className="text-xl font-bold text-gray-800">Rs {item.amount.toLocaleString()}</h3>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Method</p>
                    <p className="text-sm font-semibold text-gray-700 capitalize">{item.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Date</p>
                    <p className="text-[11px] font-medium text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account</p>
                    <p className="text-xs font-mono text-gray-600">{item.account_number}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}