"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, FileText, Scale, Lock, Gavel } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Account Activation",
      icon: <ShieldCheck className="text-primary" size={20} />,
      content: "Account ko active karne ke liye aapko aik martaba package fee jama karani hogi. Fee jama hone aur Admin se approve hone ke baad hi aapka binary tree aur referral system active hoga."
    },
    {
      title: "2. Withdrawal Rules",
      icon: <Scale className="text-orange-500" size={20} />,
      content: "Kam az kam withdrawal limit 2$ hai. Withdrawal ki requests 24 se 48 ghanton mein process ki jati hain. Har withdrawal par 5% se 10% tak service charges apply ho sakte hain."
    },
    {
      title: "3. Service Usage",
      icon: <Lock className="text-emerald-500" size={20} />,
      content: "Nexo Global platform ka koi bhi galat istemal (misuse) ya cheating karne par aapka account baghair kisi notice ke permanent block kiya ja sakta hai."
    },
    {
      title: "4. Binary Network Structure",
      icon: <FileText className="text-purple-500" size={20} />,
      content: "Nexo Global operates on a decentralized binary networking system. Your earnings are based on direct and indirect referrals. Any form of misrepresentation may result in account suspension."
    }
  ];

  return (
    <div className="min-h-screen bg-bg-app pb-20 transition-colors duration-300">
      <header className="bg-bg-card/80 backdrop-blur-xl p-5 sticky top-0 z-40 border-b border-app flex items-center gap-4 transition-colors duration-300">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 bg-bg-app border border-app rounded-2xl flex items-center justify-center text-text-dim hover:text-primary transition-all active:scale-95 shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-text-app italic uppercase tracking-tighter leading-none">Terms of Service</h1>
          <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">Binary Protocol Regulations</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Intro Section */}
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner">
            <Gavel size={36} />
          </div>
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-text-app italic uppercase tracking-tighter leading-none">LEGAL <span className="text-primary">FRAMEWORK</span></h2>
             <p className="text-[10px] text-text-dim font-black uppercase tracking-[0.2em] italic">Updated: March 2026</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="bg-bg-card p-6 rounded-[35px] border border-app shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-bg-app rounded-xl flex items-center justify-center border border-app shadow-inner">
                  {section.icon}
                </div>
                <h3 className="font-black text-text-app italic uppercase tracking-tighter text-sm">{section.title}</h3>
              </div>
              <p className="text-[11px] text-text-dim font-medium leading-relaxed uppercase tracking-tight italic">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="bg-primary/5 p-6 rounded-[30px] border border-primary/10 text-center">
          <p className="text-[9px] font-black text-text-dim leading-relaxed uppercase tracking-widest italic opacity-60">
            Nexo Global Binary Protocol ka istemal karte hue aap in tamam qawaneen ki pabandi ka halaf uthate hain. 🛡️
          </p>
        </div>
      </main>
    </div>
  );
}
