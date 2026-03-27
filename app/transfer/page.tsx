"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Search, 
  UserCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TransferPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=Search, 2=Amount, 3=Success
  const [loading, setLoading] = useState(false);

  // Form Data
  const [receiverCode, setReceiverCode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [amount, setAmount] = useState("");
  
  // Step 1: Find User Logic
  const handleSearchUser = async () => {
    if (!receiverCode) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('referral_code', receiverCode)
        .single();

      if (error || !data) {
        alert("Ye ID majood nahi hai.");
      } else {
        setReceiverName(data.full_name);
        setStep(2); // Go to next step
      }
    } catch (e) {
      alert("Error searching user");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Transfer Money Logic
  const handleTransfer = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      alert("Kam az kam 100 Rs transfer karein.");
      return;
    }
    
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // SQL Function (RPC) ko call karna
      const { data, error } = await supabase.rpc('transfer_balance', {
        sender_id: session.user.id,
        receiver_code: receiverCode,
        amount: numAmount
      });

      if (error) throw error;

      if (data.success) {
        setStep(3); // Success screen dikhao
      } else {
        alert(data.message); // Maslan: "Balance kam hai"
      }

    } catch (e: any) {
      alert("Transfer Fail: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER */}
      <header className="bg-white p-5 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">P2P Transfer</h1>
      </header>

      <main className="p-6">
        
        {/* PROGRESS BAR */}
        <div className="flex justify-between mb-8 px-4">
            {[1, 2, 3].map((s) => (
                <div key={s} className={`h-2 w-full rounded-full mx-1 transition-all duration-500 
                    ${step >= s ? 'bg-primary' : 'bg-gray-200'}`} 
                />
            ))}
        </div>

        <AnimatePresence mode="wait">
            
            {/* STEP 1: SEARCH RECEIVER */}
            {step === 1 && (
                <motion.div 
                    key="step1"
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Receiver dhoondein</h2>
                        <p className="text-gray-500 text-sm">Jis member ko paise bhejne hain uska ID likhein.</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase">Member ID / Referral Code</label>
                        <input 
                            type="text" 
                            placeholder="LDP-XXXX"
                            value={receiverCode}
                            onChange={(e) => setReceiverCode(e.target.value.toUpperCase())}
                            className="w-full mt-2 p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold text-lg transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleSearchUser}
                        disabled={loading || !receiverCode}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Next <ArrowRight size={20} /></>}
                    </button>
                </motion.div>
            )}

            {/* STEP 2: ENTER AMOUNT & CONFIRM */}
            {step === 2 && (
                <motion.div 
                    key="step2"
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                    className="space-y-6"
                >
                    {/* User Found Card */}
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-green-600 font-bold uppercase">Sending To</p>
                            <h3 className="text-lg font-bold text-gray-800">{receiverName}</h3>
                            <p className="text-xs text-gray-500">{receiverCode}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase">Amount to Transfer</label>
                        <div className="flex items-center mt-2 border-b-2 border-gray-100 pb-2">
                            <span className="text-2xl font-bold text-gray-400 mr-2">Rs</span>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full text-4xl font-bold outline-none text-gray-800"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start">
                        <ShieldCheck className="text-yellow-600 shrink-0" size={20} />
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            Transfer karne ke baad wapis nahi ho saken ge. Baraye meherbani naam tasalli se check karein.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setStep(1)} className="py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">
                            Cancel
                        </button>
                        <button 
                            onClick={handleTransfer}
                            disabled={loading || !amount}
                            className="py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Confirm & Send"}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* STEP 3: SUCCESS RECEIPT */}
            {step === 3 && (
                <motion.div 
                    key="step3"
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center space-y-6 mt-10"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 size={48} className="text-green-600" />
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Transfer Successful!</h2>
                        <p className="text-gray-500">Amount has been sent instantly.</p>
                    </div>

                    {/* Receipt Ticket */}
                    <div className="bg-white p-6 w-full rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-green-400"></div>
                        
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-400 text-sm">Sent To</span>
                            <span className="font-bold text-gray-800">{receiverName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-400 text-sm">Amount</span>
                            <span className="font-bold text-green-600">Rs {parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-400 text-sm">Date</span>
                            <span className="font-medium text-gray-600 text-xs">{new Date().toLocaleString()}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-lg"
                    >
                        Go to Dashboard
                    </button>
                </motion.div>
            )}

        </AnimatePresence>

      </main>

      <BottomNav />
    </div>
  );
}