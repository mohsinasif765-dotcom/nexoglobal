"use client";
import { motion } from "framer-motion";
import { ChevronLeft, Zap, Target, Globe, Users, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  const milestones = [
    {
      label: "Mission",
      title: "Global Financial Freedom",
      icon: <Target size={20} />,
      content: "Hamara maqsad aik aisi digital economy tayyar karna hai jahan har aam aadmi apne ghar bethay aik mazboot binary network ke zariye maali taur par azadi hasil kar sakay."
    },
    {
      label: "Vision",
      title: "The Binary Standard",
      icon: <Globe size={20} />,
      content: "Nexo Global ko dunya ka sab se bara decentralized binary networking platform banana hamara vision hai taake transparency aur barabari har satah par mumkin ho."
    },
    {
      label: "Value",
      title: "Community Trust",
      icon: <Users size={20} />,
      content: "Humaray system mein members ka bharosa hi hamari asli kamiyabi hai. Hum hamesha security aur naye tools faraham karte rahen ge taake aapka safar behtar se behtar ho."
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
          <h1 className="text-lg font-black text-text-app italic uppercase tracking-tighter leading-none">About Us</h1>
          <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mt-1">Nexo Global Protocol</p>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Branding Section */}
        <div className="text-center space-y-6 pt-10 pb-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[80px] opacity-30" />
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-indigo-600 rounded-[35px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-primary/40 relative z-10 rotate-3 transform transition-transform hover:rotate-0 duration-500">
            <Zap size={48} />
          </div>
          <div className="space-y-2 relative z-10 font-black">
             <h2 className="text-4xl font-black text-text-app italic uppercase tracking-tighter leading-none tracking-[-0.05em]">NEXO <span className="text-primary underline decoration-indigo-500/30">GLOBAL</span></h2>
             <p className="text-[11px] text-text-dim font-black uppercase tracking-[0.4em] italic leading-none opacity-60">Future of Network Nodes</p>
          </div>
        </div>

        {/* Milestones Sections */}
        <div className="space-y-4">
          {milestones.map((item, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              key={index} 
              className="bg-bg-card p-8 rounded-[40px] border border-app shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Trophy size={64} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                  {item.icon}
                </div>
                <div>
                   <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{item.label}</p>
                   <h3 className="font-black text-text-app italic uppercase tracking-tight text-md">{item.title}</h3>
                </div>
              </div>
              <p className="text-[12px] text-text-dim font-black leading-relaxed uppercase tracking-tight italic">
                {item.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Vision Badge */}
        <div className="mt-8 p-10 bg-slate-900 rounded-[50px] border border-white/5 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] opacity-20" />
           <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] italic mb-4">Established 2026</p>
           <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none decoration-emerald-500 underline underline-offset-8">THE 100K <span className="text-primary">ACTIVE</span> NODES GOAL</h4>
           <p className="text-[10px] font-black text-text-dim uppercase tracking-widest italic opacity-40">Connecting the world through secure binary rewards.</p>
        </div>
      </main>
    </div>
  );
}
