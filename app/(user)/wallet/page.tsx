"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Wallet, ArrowUpRight, ArrowDownLeft,
   History, ShieldCheck, Loader2, Send,
   ChevronRight, Copy, Check, Globe, Cpu,
   CreditCard, Zap, QrCode, Info, AlertCircle,
   ArrowLeft, MoreVertical, DollarSign, Plus
} from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
   useAccount, useWriteContract, useWaitForTransactionReceipt,
   useChainId, useSwitchChain
} from 'wagmi';
import { useModal } from "connectkit";
import { parseUnits, getAddress } from 'viem';
import { bsc, polygon } from 'wagmi/chains';

const ERC20_ABI = [
   {
      "constant": false,
      "inputs": [
         { "name": "_to", "type": "address" },
         { "name": "_value", "type": "uint256" }
      ],
      "name": "transfer",
      "outputs": [{ "name": "", "type": "bool" }],
      "type": "function"
   }
];

const USDT_ADDRESSES: Record<number, string> = {
   [bsc.id]: "0x55d398326f99059fF775485246999027B3197955",
   [polygon.id]: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
};

const USDT_DECIMALS: Record<number, number> = {
   [bsc.id]: 18,
   [polygon.id]: 6
};

export default function WalletPage() {
   const router = useRouter();
   const [user, setUser] = useState<any>(null);
   const [stats, setStats] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [modal, setModal] = useState<"deposit" | "manual-deposit" | "withdraw" | "buy-pin" | null>(null);
   const [amount, setAmount] = useState("");
   const [depositAmount, setDepositAmount] = useState("");
   const [txHash, setTxHash] = useState("");
   const [withdrawAddress, setWithdrawAddress] = useState("");
   const [withdrawMethod, setWithdrawMethod] = useState("binance_pay");
   const [accTitle, setAccTitle] = useState("");
   const [tier, setTier] = useState("starter");
   const [settings, setSettings] = useState<any>({});
   const [copied, setCopied] = useState(false);
   const [mounted, setMounted] = useState(false);
   const [isOxApayLoading, setIsOxApayLoading] = useState(false);

   // Web3 Hooks
   const { address: walletAddress, isConnected } = useAccount();
   const chainId = useChainId();
   const { switchChain } = useSwitchChain();
   const { setOpen: setWalletModalOpen } = useModal();
   const { writeContract, data: hash, isPending: isTxPending } = useWriteContract();

   const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );

   const ADMIN_ADDRESS = "0xc1689381d73D3778C872401F7Cf402408f60Dd50";

   useEffect(() => {
      setMounted(true);
      fetchData(true);
   }, []);

   const fetchData = async (isInitial = false) => {
      try {
         if (isInitial) setLoading(true);
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            setUser(user);

            // Fetch Stats
            const { data: statsData } = await supabase.rpc('get_user_dashboard_stats', { p_user_id: user.id });
            setStats(statsData);

            // Fetch Settings
            const { data: settingsData } = await supabase.from('system_settings').select('key, value');
            const settingsObj = settingsData?.reduce((acc: any, curr: any) => {
               acc[curr.key] = curr.value;
               return acc;
            }, {});
            setSettings(settingsObj || {});
         }
      } catch (e) {
         console.error("Fetch Data Error:", e);
      } finally {
         setLoading(false);
      }
   };

   const handleCopy = () => {
      navigator.clipboard.writeText(ADMIN_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleManualDeposit = async () => {
      if (!txHash || txHash.length < 10) return alert("Please enter a valid Transaction Hash (TXID)");
      const amountVal = parseFloat(depositAmount);
      if (isNaN(amountVal) || amountVal < parseFloat(settings.min_deposit || "2")) {
         return alert(`Minimum deposit is $${settings.min_deposit || "2"}`);
      }

      try {
         const { error } = await supabase.from('pin_requests').insert({
            user_id: user.id,
            trx_id: `MAN-${Math.random().toString(36).substring(7)}`,
            amount: amountVal,
            payment_gateway: 'manual',
            tx_hash: txHash,
            status: 'pending'
         });
         if (error) throw error;
         alert("Deposit request submitted! Admin will verify and approve shortly.");
         setModal(null);
         setTxHash("");
         setDepositAmount("");
      } catch (e: any) {
         alert(e.message || "Submission failed");
      }
   };

   const handleWeb3Deposit = async () => {
      if (!isConnected) {
         return setWalletModalOpen(true);
      }

      if (!( [bsc.id, polygon.id] as number[]).includes(chainId)) {
         alert("Please switch to BNB Chain or Polygon");
         return (switchChain as any)({ chainId: bsc.id });
      }

      const amountVal = parseFloat(depositAmount);
      if (isNaN(amountVal) || amountVal < parseFloat(settings.min_deposit || "2")) {
         return alert(`Minimum deposit is $${settings.min_deposit || "2"}`);
      }

      const usdtAddress = USDT_ADDRESSES[chainId as 56 | 137];
      const decimals = USDT_DECIMALS[chainId as 56 | 137];

      try {
         writeContract({
            address: usdtAddress as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [ADMIN_ADDRESS as `0x${string}`, parseUnits(depositAmount, decimals)],
         });
      } catch (e: any) {
         alert(e.message || "Transaction failed");
      }
   };

   // Track Web3 Transaction Progress
   const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
      hash,
   });

   useEffect(() => {
      if (isTxSuccess && hash) {
         saveWeb3Deposit();
      }
   }, [isTxSuccess, hash]);

   const saveWeb3Deposit = async () => {
      try {
         await supabase.from('pin_requests').insert({
            user_id: user.id,
            trx_id: hash,
            amount: parseFloat(depositAmount),
            payment_gateway: 'web3',
            tx_hash: hash,
            status: 'pending' // Admin still verifies for safety, though it's on-chain
         });
         alert("Web3 Deposit initiated! Once confirmed on-chain, admin will approve.");
         setModal(null);
         setDepositAmount("");
         fetchData();
      } catch (e) {
         console.error("Failed to save web3 deposit", e);
      }
   };

   const handleOxApay = async () => {
      const minDeposit = parseFloat(settings.min_deposit || "2");
      const amountVal = parseFloat(depositAmount);

      if (isNaN(amountVal) || amountVal < minDeposit) {
         return alert(`Minimum deposit is $${minDeposit}`);
      }

      setIsOxApayLoading(true);
      try {
         const { data, error } = await supabase.functions.invoke('oxapay-create', {
            body: { userId: user.id, amount: amountVal }
         });
         if (error) throw error;

         // Track request
         await supabase.from('pin_requests').insert({
            user_id: user.id,
            trx_id: data.orderId,
            amount: amountVal,
            payment_gateway: 'oxapay',
            payment_url: data.payUrl,
            status: 'pending'
         });

         window.location.href = data.payUrl;
      } catch (e: any) {
         alert(e.message || "Payment failed");
      } finally {
         setIsOxApayLoading(false);
      }
   };

   const handleBuyPin = async () => {
      const price = parseFloat(settings[`package_${tier}_price`] || "2");
      if (stats?.wallet_balance < price) {
         return alert(`Insufficient balance. You need $${price}`);
      }

      try {
         const { data, error } = await supabase.rpc('buy_pin_with_balance', { p_tier: tier });
         if (error) throw error;

         alert(`Success! PIN Code: ${data.pin_code}`);
         setModal(null);
         fetchData(); // Refresh balance
      } catch (e: any) {
         alert(e.message || "Purchase failed");
      }
   };

   const handleWithdraw = async () => {
      const minWithdraw = parseFloat(settings.min_withdraw || "10");
      const amountVal = parseFloat(amount);

      if (isNaN(amountVal) || amountVal < minWithdraw) {
         return alert(`Minimum withdrawal is $${minWithdraw}`);
      }
      if (amountVal > stats?.wallet_balance) {
         return alert("Insufficient balance");
      }

      // Binance Pay ID check (8+ chars) or BEP20 check (40+ chars)
      const isMethodValid = withdrawMethod === 'binance_pay' ? withdrawAddress.length >= 8 : withdrawAddress.length >= 40;
      if (!isMethodValid) {
         return alert(withdrawMethod === 'binance_pay' ? "Invalid Binance ID length" : "Invalid BEP20 Address length");
      }
      
      if (withdrawMethod === 'binance_pay' && accTitle.length < 2) {
         return alert("Please enter your Binance Name for verification");
      }

      try {
         const feePercent = withdrawMethod === 'binance_pay' ? 0 : 0.1;
         const fee = amountVal * feePercent;
         const net = amountVal - fee;

         const { data, error } = await supabase.rpc('process_withdrawal', {
            p_user_id: user.id,
            p_amount: amountVal,
            p_method: withdrawMethod,
            p_acc_number: withdrawAddress,
            p_acc_title: withdrawMethod === 'binance_pay' ? accTitle : 'USDT BEP20'
         });

         if (error) throw error;

         alert(`Payout Request for $${net.toFixed(2)} (${withdrawMethod.replace('_', ' ').toUpperCase()}) submitted successfully! ✨\nOur team will review and process your request within 24 hours.`);
         setModal(null);
         fetchData();
      } catch (e: any) {
         alert("Withdraw failed: " + e.message);
      }
   };

   if (!mounted || loading) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app p-6 transition-colors duration-300">
         <Loader2 className="animate-spin text-primary mb-2" size={32} />
         <p className="font-black italic uppercase tracking-widest text-[8px] text-text-dim">Syncing Assets...</p>
      </div>
   );

   return (
      <main className="min-h-screen bg-bg-app pb-24 transition-colors duration-300">
         {/* Native Compact Header */}
         <header className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-app px-5 pt-10 pb-4 transition-colors duration-300">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <button onClick={() => window.history.back()} className="text-text-dim active:scale-90 transition-all p-2.5 bg-bg-card rounded-xl border border-app">
                     <ArrowLeft size={18} />
                  </button>
                  <div>
                     <h1 className="text-lg font-black italic tracking-tighter text-text-app leading-none">WALLET</h1>
                     <p className="text-[7px] font-black text-text-dim uppercase tracking-[0.2em] mt-0.5 italic">Asset Protocol</p>
                  </div>
               </div>
               <button className="p-2.5 bg-bg-card rounded-xl text-text-dim border border-app"><MoreVertical size={16} /></button>
            </div>
         </header>

         <div className="px-5 mt-6 space-y-8">

            {/* Compact Master Card Component */}
            <motion.div
               initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
               className="relative group"
            >
               <div className="absolute inset-x-2 -bottom-2 h-16 bg-primary/15 blur-[40px] rounded-full -z-10" />
               <div className="bg-gray-950 rounded-[35px] p-6 text-white relative overflow-hidden border border-white/5 shadow-xl aspect-[1.8/1] flex flex-col justify-between">
                  {/* Card Decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-10 -mt-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px] -ml-8 -mb-8" />

                  <div className="relative z-10 space-y-1">
                     <div className="flex justify-between items-start">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em] italic">Available Balance</p>
                        <CreditCard size={20} className="text-white/10" />
                     </div>
                     <div className="flex items-end gap-1.5">
                        <span className="text-primary text-xl font-black italic">$</span>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                           {stats?.wallet_balance?.toFixed(2) || "0.00"}
                        </h2>
                     </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-end">
                     <div className="space-y-1">
                        <p className="text-[6px] font-black text-white/20 uppercase tracking-widest leading-none mb-0.5">Global Earnings</p>
                        <p className="text-sm font-black italic tracking-tight text-emerald-400">+${stats?.total_earned?.toFixed(2) || "0.00"}</p>
                     </div>
                     {/* Visa-style circles */}
                     <div className="flex relative">
                        <div className="w-6 h-6 rounded-full bg-primary/80 relative z-10" />
                        <div className="w-6 h-6 rounded-full bg-orange-500/80 -ml-3" />
                     </div>
                  </div>
               </div>
            </motion.div>

            {/* Compact Action Grid (3 Items in One Row) */}
            <div className="grid grid-cols-3 gap-3 auto-rows-fr">
               <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setModal('deposit')}
                  className="bg-primary text-white p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-lg shadow-primary/20 border border-white/10 active:opacity-90 transition-all"
               >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white">
                     <Plus size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest italic">Add</span>
               </motion.button>

               <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setModal('withdraw')}
                  className="bg-bg-card text-text-app p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 border border-app active:bg-app transition-colors shadow-sm"
               >
                  <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                     <ArrowUpRight size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest italic">Payout</span>
               </motion.button>

               <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => router.push('/pins')}
                  className="bg-slate-900 dark:bg-primary text-white p-4 rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-lg active:opacity-90 transition-all border border-white/5 shadow-primary/10"
               >
                  <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                     <Zap size={16} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest italic">E-PIN</span>
               </motion.button>
            </div>            {/* Wallet Instructions */}
            <div className="bg-bg-card p-6 rounded-[35px] border border-app space-y-4">
               <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary p-1 rounded-lg text-white"><Zap size={14} /></div>
                  <h4 className="text-[10px] font-black italic text-text-app uppercase tracking-widest leading-none">Wallet Protocol</h4>
               </div>

               <div className="space-y-4">
                  <div className="flex gap-4">
                     <div className="w-5 h-5 bg-bg-app shadow-sm text-primary rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border border-app">01</div>
                     <p className="text-[8px] font-bold text-text-dim uppercase tracking-tight leading-relaxed italic">
                        <span className="text-text-app">Deposit</span>: Automated OxApay ya Manual Web3 transfer istemal karein.
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-5 h-5 bg-bg-app shadow-sm text-primary rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border border-app">02</div>
                     <p className="text-[8px] font-bold text-text-dim uppercase tracking-tight leading-relaxed italic">
                        <span className="text-text-app">Withdraw</span>: BEP20 address dein. Har withdrawal par <span className="text-rose-500">10% service fee</span> apply hogi.
                     </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-5 h-5 bg-bg-app shadow-sm text-primary rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border border-app">03</div>
                     <p className="text-[8px] font-bold text-text-dim uppercase tracking-tight leading-relaxed italic">
                        <span className="text-text-app">Activation</span>: Apnay wallet balance se direct <span className="text-primary">PIN purchase</span> karein.
                     </p>
                  </div>
               </div>
            </div>

            {/* Clean Activity Log */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-text-app flex items-center gap-2">
                     <History size={16} className="text-primary" /> Recent History
                  </h3>
                  <Link href="/history" className="text-[8px] font-black text-text-dim underline decoration-app uppercase tracking-widest">View All</Link>
               </div>

               <div className="space-y-2">
                  {stats?.recent_transactions && stats.recent_transactions.length > 0 ? (
                     stats.recent_transactions.slice(0, 5).map((tx: any, idx: number) => (
                        <motion.div
                           initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.03 }}
                           key={tx.id || idx}
                           className="p-4 bg-bg-card border border-app rounded-[24px] flex items-center justify-between shadow-sm"
                        >
                           <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' :
                                 tx.type === 'withdraw' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                                 }`}>
                                 {tx.type === 'deposit' ? <ArrowDownLeft size={16} /> :
                                    tx.type === 'withdraw' ? <ArrowUpRight size={16} /> : <Zap size={16} />}
                              </div>
                              <div>
                                 <p className="font-black italic uppercase text-[9px] text-text-app leading-none mb-1">{tx.type} USDT</p>
                                 <p className="text-[7px] font-black uppercase tracking-widest text-text-dim">
                                    {new Date(tx.created_at).toLocaleDateString()} • {tx.status}
                                 </p>
                              </div>
                           </div>
                           <p className={`font-black italic text-[11px] ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-text-app'
                              }`}>
                               {tx.type === 'deposit' ? '+' : '-'}${tx.amount}
                           </p>
                        </motion.div>
                     ))
                  ) : (
                     <div className="py-12 text-center bg-bg-card rounded-[30px] border border-dashed border-app">
                        <p className="text-[8px] font-black uppercase text-text-dim tracking-[0.2em] italic">No activity yet</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Security Micro Badge */}
            <div className="bg-primary/5 p-4 rounded-[24px] border border-primary/10 flex items-center gap-3">
               <ShieldCheck className="text-primary" size={16} />
               <p className="text-[7px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">
                  Encrypted Ledger Verification Active
               </p>
            </div>
         </div>

         {/* Native Compact Bottom Sheets */}
         <AnimatePresence>
            {/* Deposit Modal */}
            {modal === 'deposit' && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
                  <motion.div
                     initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
                     className="fixed bottom-0 left-0 right-0 z-[51] bg-bg-card rounded-t-[40px] p-6 pb-10 shadow-3xl border-t border-app"
                  >
                     <div className="w-10 h-1 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6" />
                     <h2 className="text-xl font-black italic uppercase tracking-tighter text-text-app mb-6 text-center italic">DEPOSIT <span className="text-primary">USDT</span></h2>

                     <div className="space-y-5">
                        <div className="space-y-1.5 px-2">
                           <label className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em] italic">Amount (Min ${settings.min_deposit || "2"})</label>
                           <div className="relative">
                              <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                               <input
                                  type="number" placeholder="0.00" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                                  className="w-full p-5 pl-10 bg-bg-app border border-app rounded-2xl outline-none font-black text-2xl italic tracking-tighter text-text-app focus:bg-bg-card focus:border-primary transition-all"
                               />
                           </div>
                        </div>

                        <div className="grid gap-3">
                           <button
                              onClick={handleOxApay}
                              disabled={isOxApayLoading}
                              className="w-full bg-slate-900 dark:bg-primary text-white p-5 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all border border-white/10 shadow-lg shadow-primary/5 disabled:opacity-50"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-11 h-11 bg-white/5 dark:bg-white/10 rounded-xl flex items-center justify-center text-primary">
                                    {isOxApayLoading ? <Loader2 size={20} className="animate-spin" /> : <Globe size={20} />}
                                 </div>
                                 <div className="text-left">
                                    <p className="font-black tracking-widest italic uppercase text-[10px]">OxApay Gateway</p>
                                    <p className="text-[7px] font-bold opacity-30 uppercase tracking-[0.2em]">{isOxApayLoading ? "Connecting..." : "Automatic Approval"}</p>
                                 </div>
                              </div>
                              <ChevronRight size={18} className="text-primary" />
                           </button>

                           <button
                              onClick={handleWeb3Deposit}
                              disabled={isTxPending || isWaitingForTx}
                              className="w-full bg-emerald-500 text-white p-5 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all disabled:opacity-50"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                                    {isTxPending || isWaitingForTx ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} />}
                                 </div>
                                 <div className="text-left">
                                    <p className="font-black tracking-widest italic uppercase text-[10px]">Web3 Direct</p>
                                    <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em]">Instant Transfer</p>
                                 </div>
                              </div>
                              <ChevronRight size={18} />
                           </button>

                           <button
                              onClick={() => router.push('/deposit')}
                              className="w-full bg-purple-600 text-white p-5 rounded-[24px] flex items-center justify-between active:scale-[0.98] transition-all border border-white/10 shadow-lg shadow-purple-500/10"
                           >
                              <div className="flex items-center gap-4">
                                 <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center text-white">
                                    <QrCode size={20} />
                                 </div>
                                 <div className="text-left">
                                    <p className="font-black tracking-widest italic uppercase text-[10px]">Manual Binance Pay</p>
                                    <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em]">QR Code & ID Support</p>
                                 </div>
                              </div>
                              <ChevronRight size={18} />
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </>
            )}

            {/* Withdraw Modal */}
            {modal === 'withdraw' && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
                  <motion.div
                     initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
                     className="fixed bottom-0 left-0 right-0 z-[51] bg-bg-card rounded-t-[40px] p-6 pb-10 shadow-3xl border-t border-app"
                  >
                     <div className="w-10 h-1 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6" />
                     <h2 className="text-xl font-black italic uppercase tracking-tighter text-text-app mb-6 text-center italic">QUICK <span className="text-rose-500">PAYOUT</span></h2>

                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em] italic ml-2">Pledge Amount ($)</label>
                           <input
                              type="number" placeholder="Min. $10" value={amount} onChange={(e) => setAmount(e.target.value)}
                              className="w-full px-5 py-4 bg-bg-app border border-app rounded-2xl outline-none font-black text-lg tracking-tighter text-text-app focus:bg-bg-card focus:border-rose-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                        </div>

                        {/* Payout Routes */}
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                              onClick={() => setWithdrawMethod('binance_pay')}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all relative overflow-hidden ${withdrawMethod === 'binance_pay' ? 'border-primary bg-primary/5 text-primary' : 'border-app bg-bg-app text-text-dim'}`}
                           >
                              {withdrawMethod === 'binance_pay' && <div className="absolute top-0 right-0 bg-primary text-white text-[6px] font-black px-1.5 py-0.5 rounded-bl-lg">0% FEE</div>}
                              <ShieldCheck size={16} />
                              <span className="text-[7px] font-black uppercase tracking-widest">Binance Pay</span>
                           </button>
                           <button 
                              onClick={() => setWithdrawMethod('bnb_20')}
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${withdrawMethod === 'bnb_20' ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-app bg-bg-app text-text-dim'}`}
                           >
                              <Zap size={16} />
                              <span className="text-[7px] font-black uppercase tracking-widest">BNB 20</span>
                           </button>
                        </div>

                        {/* Fees Summary */}
                        {parseFloat(amount) >= 10 && (
                           <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             className={`p-4 rounded-2xl border flex justify-between items-center ${withdrawMethod === 'binance_pay' ? 'bg-primary/5 border-primary/10' : 'bg-rose-500/5 border-rose-500/10'}`}
                           >
                              <div className="space-y-0.5">
                                 <p className="text-[7px] font-black uppercase tracking-widest text-text-dim">Service Fee ({withdrawMethod === 'binance_pay' ? '0%' : '10%'})</p>
                                 <p className="text-xs font-black italic text-text-app uppercase">Net Payout</p>
                              </div>
                              <div className="text-right">
                                 <p className={`text-[10px] font-black ${withdrawMethod === 'binance_pay' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {withdrawMethod === 'binance_pay' ? '$0.00' : `-$${(parseFloat(amount) * 0.1).toFixed(2)}`}
                                 </p>
                                 <p className="text-lg font-black italic tracking-tighter text-text-app">
                                    ${(parseFloat(amount) * (withdrawMethod === 'binance_pay' ? 1 : 0.9)).toFixed(2)}
                                 </p>
                              </div>
                           </motion.div>
                        )}
                        
                        <div className="space-y-4 pt-2">
                           <div className="space-y-1.5">
                              <label className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em] italic ml-2">
                                 {withdrawMethod === 'binance_pay' ? 'Receiving Binance ID' : 'BEP20 Wallet Address'}
                              </label>
                              <input
                                 type="text" 
                                 placeholder={withdrawMethod === 'binance_pay' ? "Enter 9-digit Binance ID" : "0x... (USDT-BEP20)"}
                                 value={withdrawAddress} 
                                 onChange={(e) => setWithdrawAddress(e.target.value)}
                                 className="w-full px-5 py-3.5 bg-bg-app border border-app rounded-2xl outline-none font-mono text-[10px] tracking-widest text-text-app focus:border-primary transition-all font-bold"
                              />
                           </div>

                           {withdrawMethod === 'binance_pay' && (
                              <div className="space-y-1.5">
                                 <label className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em] italic ml-2">Your Binance Name</label>
                                 <input
                                    type="text" 
                                    placeholder="Enter Account Title"
                                    value={accTitle} 
                                    onChange={(e) => setAccTitle(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-bg-app border border-app rounded-2xl outline-none font-black italic text-xs tracking-tight text-text-app focus:border-primary transition-all"
                                 />
                              </div>
                           )}
                        </div>
                     </div>
                     <button
                        onClick={handleWithdraw}
                        className="w-full bg-rose-500 text-white py-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-rose-500/20 active:scale-95 transition-all mt-4"
                     >
                        Confirm Payout Request
                     </button>
                  </motion.div>
               </>
            )}

            {/* Buy PIN Modal */}
            {modal === 'buy-pin' && (
               <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md" />
                  <motion.div
                     initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
                     className="fixed bottom-0 left-0 right-0 z-[51] bg-bg-card rounded-t-[40px] p-6 pb-10 shadow-3xl border-t border-app"
                  >
                     <div className="w-10 h-1 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-6" />
                     <h2 className="text-xl font-black italic uppercase tracking-tighter text-text-app mb-6 text-center italic">PURCHASE <span className="text-primary">E-PIN</span></h2>

                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[8px] font-black text-text-dim uppercase tracking-[0.2em] ml-2 italic">Select Tier</label>
                           <div className="grid grid-cols-2 gap-2">
                              {['starter', 'plus', 'pro', 'elite'].map(t => (
                                 <button
                                    key={t} onClick={() => setTier(t)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center transition-all ${tier === t ? 'border-primary bg-primary/5 text-primary' : 'border-app bg-bg-app text-text-dim'}`}
                                 >
                                    <span className="font-black italic uppercase text-[8px] tracking-widest leading-none mb-1">{t}</span>
                                    <span className={`text-sm font-black tracking-tighter italic leading-none ${tier === t ? 'text-primary' : 'text-text-app'}`}>${settings[`package_${t}_price`] || "2"}</span>
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="p-6 bg-slate-900 dark:bg-white/5 rounded-[28px] border border-white/5 flex justify-between items-center text-white dark:text-gray-100 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 blur-[20px] -mr-8 -mt-8" />
                           <div>
                              <p className="text-[7px] font-black opacity-30 uppercase tracking-widest mb-0.5">Wallet</p>
                              <p className="text-xl font-black italic tracking-tighter leading-none">${stats?.wallet_balance?.toFixed(2)}</p>
                           </div>
                           <ChevronRight className="opacity-10" size={16} />
                           <div className="text-right">
                              <p className="text-[7px] font-black text-primary uppercase tracking-widest mb-0.5">Price</p>
                              <p className="text-xl font-black italic tracking-tighter leading-none text-primary">${settings[`package_${tier}_price`] || "2"}</p>
                           </div>
                        </div>

                        <button
                           onClick={handleBuyPin}
                           className="w-full bg-primary text-white py-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-primary/30 active:scale-95 transition-all"
                        >
                           Process Purchase
                        </button>
                     </div>
                  </motion.div>
               </>
            )}
         </AnimatePresence>
      </main>
   );
}
