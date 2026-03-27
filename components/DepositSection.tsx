"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowDownCircle, Cpu, Zap, Globe, Lock } from "lucide-react";

export default function DepositSection() {
  const steps = [
    {
      icon: <Globe size={24} className="text-primary" />,
      title: "Choose Method",
      desc: "Select between Direct Web3 Transfer or Exchange (Binance/OKX) Invoice."
    },
    {
      icon: <Zap size={24} className="text-amber-500" />,
      title: "Instant Pay",
      desc: "Scan the QR code or connect your Trust Wallet for a 1-second transfer."
    },
    {
      icon: <Cpu size={24} className="text-emerald-500" />,
      title: "Smart Activation",
      desc: "Our AI engine verifies the blockchain hash and activates your tier instantly."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-40 bg-app-bg relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
            <ShieldCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black text-app-text uppercase tracking-[0.3em]">Institutional Grade Security</span>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase mb-8 text-app-text">
            Global <span className="text-primary">Payment</span><br/>Infrastructure
          </h2>
          <p className="text-lg md:text-xl font-bold text-app-dim italic max-w-2xl mx-auto">
            Experience the future of MLM with our multi-chain automated gateway. No manual approvals, no delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-app-card p-12 rounded-[50px] border border-app-border group hover:border-primary/50 transition-all duration-500 shadow-xl shadow-primary/5"
            >
              <div className="w-20 h-20 bg-app-bg rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-primary transition-colors border border-app-border">
                <div className="group-hover:text-white transition-colors">{step.icon}</div>
              </div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-app-text tracking-widest">{step.title}</h4>
              <p className="text-sm font-bold text-app-dim italic leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Security Badge */}
        <div className="mt-24 p-12 bg-app-card rounded-[60px] border border-app-border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center border border-primary/10">
              <Lock size={40} className="text-primary" />
            </div>
            <div>
              <h3 className="text-3xl font-black italic text-app-text uppercase tracking-tighter mb-2 leading-none">Trust-Less Ecosystem</h3>
              <p className="text-sm font-extrabold text-app-dim italic uppercase tracking-widest">Powered by Binance Smart Chain & Polygon</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-8 py-4 bg-app-bg rounded-3xl border border-app-border border-white/5">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-black text-app-text italic">OPERATIONAL</p>
            </div>
            <div className="px-8 py-4 bg-app-bg rounded-3xl border border-app-border border-white/5">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">API Key</p>
              <p className="text-lg font-black text-app-text italic tracking-widest leading-none">ENCRYPTED</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}