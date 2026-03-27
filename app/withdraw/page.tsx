"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Wallet, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  
  // Form State
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("usdt");
  const [accNumber, setAccNumber] = useState("");
  const [accTitle, setAccTitle] = useState("");

  // Fetch Balance
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      
      const { data } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', session.user.id)
        .single();
        
      if (data) setBalance(data.wallet_balance);
      setLoading(false);
    };
    fetchBalance();
  }, [router]);

  // Validation Logic
  const numAmount = parseFloat(amount) || 0;
  const isOverBalance = numAmount > balance;
  const isValid = numAmount >= 5 && !isOverBalance && accNumber.length > 20 && accTitle.length > 2;

  const handleWithdraw = async () => {
    if (!isValid) return;
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.rpc('process_withdrawal', {
        p_user_id: session.user.id,
        p_amount: numAmount,
        p_method: method,
        p_acc_number: accNumber,
        p_acc_title: accTitle
      });

      if (error) throw error;

      if (data.success) {
        alert("Success! Your withdrawal request has been submitted.");
        router.push('/wallet');
      } else {
        alert(data.message); 
      }

    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* 1. HEADER WITH BALANCE (Gradient) */}
      <div className="bg-primary text-white p-6 rounded-b-[40px] shadow-xl relative overflow-hidden text-gray-900">
        <div className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <button onClick={() => router.back()} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
            <ChevronLeft size={24} />
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-white opacity-80 text-sm font-medium tracking-wide uppercase">Available Balance</p>
            <h1 className="text-4xl font-bold mt-2 text-white">${balance.toLocaleString()} <span className="text-sm">USDT</span></h1>
          </div>
        </div>
      </div>

      <main className="p-6 -mt-8 space-y-6 relative z-10 text-gray-900">
        
        {/* 2. AMOUNT INPUT CARD */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100"
        >
          <label className="text-xs font-bold text-gray-400 uppercase">Withdraw Amount</label>
          <div className="flex items-center mt-2 border-b-2 border-gray-100 pb-2 focus-within:border-primary transition-colors">
            <span className="text-2xl font-bold text-gray-400 mr-2">$</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full text-3xl font-bold outline-none bg-transparent ${isOverBalance ? 'text-red-500' : 'text-gray-800'}`}
              placeholder="0"
            />
          </div>
          
          {/* Error Message */}
          {isOverBalance && (
            <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
              <AlertCircle size={12} /> Insufficient balance
            </p>
          )}

          {/* Quick Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {[5, 10, 20, balance].map((val) => (
              <button 
                key={val}
                onClick={() => setAmount(val.toString())}
                className="px-4 py-2 bg-gray-50 rounded-full text-xs font-bold text-gray-600 border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-all whitespace-nowrap"
              >
                {val === balance ? 'Max' : `+$${val}`}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3. METHOD SELECTION */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">Select Method</h3>
          <div className="grid grid-cols-1 gap-3">
            <MethodCard 
              name="USDT Wallet (TRC20)" 
              icon={<Wallet className="text-emerald-500" />} 
              selected={method === 'usdt'} 
              onClick={() => setMethod('usdt')}
            />
          </div>
        </div>

        {/* 4. ACCOUNT DETAILS */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
               <CreditCard size={20} />
             </div>
             <div className="flex-1">
               <label className="text-[10px] font-bold text-gray-400 uppercase">Wallet Address</label>
               <input 
                 type="text" 
                 placeholder="Enter TRC20 Address"
                 value={accNumber}
                 onChange={(e) => setAccNumber(e.target.value)}
                 className="w-full font-semibold text-gray-700 outline-none bg-transparent"
               />
             </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
               <CheckCircle2 size={20} />
             </div>
             <div className="flex-1">
               <label className="text-[10px] font-bold text-gray-400 uppercase">Wallet Label</label>
               <input 
                 type="text" 
                 placeholder="e.g. My Savings Wallet"
                 value={accTitle}
                 onChange={(e) => setAccTitle(e.target.value)}
                 className="w-full font-semibold text-gray-700 outline-none bg-transparent"
               />
             </div>
          </div>
        </div>

        {/* 5. CONFIRM BUTTON */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          disabled={!isValid || submitting}
          onClick={handleWithdraw}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-2 transition-all mt-4
            ${!isValid || submitting ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-black hover:bg-gray-900'}
          `}
        >
          {submitting ? <Loader2 className="animate-spin" /> : "Confirm Withdrawal"}
        </motion.button>

      </main>

      <BottomNav />
    </div>
  );
}

function MethodCard({ name, icon, selected, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-4 transition-all duration-300
        ${selected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:border-gray-200'}
      `}
    >
      <div className={`p-2 rounded-xl ${selected ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${selected ? 'text-primary' : 'text-gray-600'}`}>
        {name}
      </span>
    </div>
  )
}