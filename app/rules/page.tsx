"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Zap, Target, ArrowRight, ShieldCheck, 
  ChevronRight, Rocket, Star, Globe, TrendingUp 
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RulesPage() {
  const steps = [
    {
      id: "01",
      title: "The Duo Foundation",
      urdu: "Sirf 2 members add karein.",
      description: "Start by adding just 2 active members (Left & Right). This is your foundation for binary rewards.",
      icon: <Users className="text-blue-500" size={32} />,
      color: "from-blue-500/20 to-transparent"
    },
    {
      id: "02",
      title: "Team Power",
      urdu: "Team ki expansion se earning.",
      description: "When your 2 members add their own 2, your network grows automatically. Team work makes the dream work!",
      icon: <TrendingUp className="text-purple-500" size={32} />,
      color: "from-purple-500/20 to-transparent"
    },
    {
      id: "03",
      title: "Binary Rewards",
      urdu: "Level complete reward.",
      description: "As soon as both sides of a level are full in your tree, the system credits your wallet instantly.",
      icon: <Zap className="text-amber-500" size={32} />,
      color: "from-amber-500/20 to-transparent"
    },
    {
      id: "04",
      title: "Spillover Support",
      urdu: "Help dain aur support payein.",
      description: "You or your team can help by placing extra members in empty spots below. We grow together!",
      icon: <Globe className="text-emerald-500" size={32} />,
      color: "from-emerald-500/20 to-transparent"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-app transition-colors duration-300">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-6 py-2 rounded-full mb-4"
          >
            <ShieldCheck className="text-primary" size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Nexo Global Protocol</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-text-app uppercase leading-none">
            Binary <span className="text-primary underline decoration-primary/20">Power</span> Rules
          </h1>
          <p className="text-lg md:text-xl font-bold text-text-dim italic max-w-2xl mx-auto">
             Teamwork se kamiyabi ka asaan rasta. Samjhein k binary system kese kaam karta hai.
          </p>
        </section>

        {/* Visual Binary Path */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 font-black">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-bg-card border-2 border-app rounded-[40px] p-10 relative overflow-hidden group hover:border-primary/50 transition-all duration-500 shadow-xl"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-30 -mr-16 -mt-16 rounded-full blur-[40px] group-hover:opacity-60 transition-opacity`} />
              
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-bg-app rounded-3xl flex items-center justify-center shadow-inner border border-app">
                  {step.icon}
                </div>
                <span className="text-5xl font-black italic text-primary/10 group-hover:text-primary/20 transition-colors uppercase tracking-widest">{step.id}</span>
              </div>

              <div className="space-y-4 relative z-10">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">{step.urdu}</h3>
                <h2 className="text-2xl italic tracking-tighter text-text-app uppercase tracking-[-0.05em]">{step.title}</h2>
                <p className="text-[13px] text-text-dim leading-relaxed font-bold italic opacity-60">
                   {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Binary Map Visualization Simulation */}
        <section className="bg-slate-900 border border-white/5 rounded-[50px] p-8 md:p-16 text-center space-y-10 relative overflow-hidden mb-20 shadow-2xl">
           <div className="absolute inset-0 bg-primary/5 opacity-10 pointer-events-none blur-3xl" />
           
           <div className="relative z-10 space-y-6">
              <div className="space-y-4">
                 <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase tracking-[-0.05em]">SYSTEM <span className="text-primary">VISUALIZER</span></h2>
                 <p className="text-[10px] md:text-[12px] font-black text-white/40 uppercase tracking-[0.4em] italic leading-none max-w-lg mx-auto">2 Levels of Binary Mastery & Unlimited Depth</p>
              </div>

              {/* Premium 3D Image Replacement */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative max-w-4xl mx-auto rounded-[40px] overflow-hidden border-4 border-white/5 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
              >
                 <img 
                    src="/images/binary-tree-guide.png" 
                    alt="Binary Tree Growth Guide" 
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                 />
              </motion.div>

              {/* Description Text Below Image */}
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl mt-4 text-left">
                 <p className="text-[11px] md:text-[14px] font-black text-white italic uppercase tracking-tight leading-relaxed">
                    Level 1 (2 Nodes) & Level 2 (4 Nodes) complete honay par aapka <span className="text-primary underline">Binary Match</span> tayyar hota hai. 
                    <br /> Isi tarah ye system <span className="text-emerald-500">Unlimited Depth</span> tak automatic balance karta rehta hai!
                 </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                 <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic leading-none">Automatic Matching</span>
                 </div>
                 <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic leading-none">Instant Reward</span>
                 </div>
                 <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic leading-none">Unlimited Levels</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Withdrawal & Policies */}
        <section className="bg-bg-card border-2 border-app rounded-[45px] p-12 text-center space-y-8 relative shadow-xl overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full" />
           <Rocket className="mx-auto text-primary" size={48} />
           <h2 className="text-3xl font-black italic tracking-tighter text-text-app uppercase">Payout <span className="text-primary">Policy</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="p-6 bg-bg-app border border-app rounded-3xl text-left">
                 <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1 italic">Withdrawal Fee</p>
                 <h4 className="text-xl font-black text-rose-500 italic uppercase">10% Service Tax</h4>
                 <p className="text-[10px] font-bold text-text-dim mt-2 opacity-60 uppercase italic">Every withdrawal is processed with a 10% maintenance fee.</p>
              </div>
              <div className="p-6 bg-bg-app border border-app rounded-3xl text-left">
                 <p className="text-[8px] font-black text-text-dim uppercase tracking-widest mb-1 italic">Minimum Payout</p>
                 <h4 className="text-xl font-black text-emerald-500 italic uppercase">$10.00 Limit</h4>
                 <p className="text-[10px] font-bold text-text-dim mt-2 opacity-60 uppercase italic">You can request a payout as soon as your wallet hits $10.</p>
              </div>
           </div>
           <div className="pt-6">
              <a 
                href="/registration" 
                className="inline-flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all italic"
              >
                Join Your Team Now <ArrowRight size={18} />
              </a>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
