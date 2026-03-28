"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, Lock, EyeOff, Server, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Data Collection",
      icon: <Terminal className="text-primary" size={20} />,
      content: "Aapka personal data jese Phone Number aur email address sirf verification ke liye istemal hota hai. Hum aapka data kisi teesri party (third party) ko farokht nahi karte."
    },
    {
      title: "2. Encrypted Storage",
      icon: <Server className="text-indigo-500" size={20} />,
      content: "Nexo Global binary protocol mein aapki tamam transactions aur credentials encrypted server par save hote hain taake koi gair-mutaliqa shakhs in tak pohanch na sake."
    },
    {
      title: "3. Cookie Protocol",
      icon: <EyeOff className="text-orange-500" size={20} />,
      content: "Hum minimal cookies istemal karte hain sirf is liye taake aapka session active rahe aur aapko bar bar login na karna paray. Hum aapki browsing history track nahi karte."
    },
    {
      title: "4. Security Commitment",
      icon: <ShieldCheck className="text-emerald-500" size={20} />,
      content: "Hamara mission decentralised security faraham karna hai. Hum apne system ko musalsal update karte rehte hain taake aapka sarmaya aur data mehfooz rahe."
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
          <h1 className="text-lg font-black text-text-app italic uppercase tracking-tighter leading-none">Privacy Policy</h1>
          <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">Data Encryption Protocol</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Intro Section */}
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner">
            <Lock size={36} />
          </div>
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-text-app italic uppercase tracking-tighter leading-none">DATA <span className="text-primary">SAFETY</span></h2>
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

        {/* Security Micro Badge */}
        <div className="bg-bg-card p-6 rounded-[30px] border border-app flex items-center gap-4 group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
             <ShieldCheck size={24} />
          </div>
          <p className="text-[8px] font-black text-text-dim leading-relaxed uppercase tracking-widest italic flex-1">
             Hamaray security protocol ko musalsal monitor kiya jata ha taake apka balance 100% mehfooz rahay. 🛡️
          </p>
        </div>
      </main>
    </div>
  );
}
