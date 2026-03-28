"use client";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-app-bg transition-colors duration-300">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center space-y-10">
          
          {/* Top Global Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/5 border border-primary/10 px-6 py-2.5 rounded-full flex items-center gap-2 shadow-sm"
          >
            <Zap size={14} className="text-primary fill-primary" />
            <span className="text-xs md:text-sm font-black text-app-text italic tracking-tighter uppercase">
              Welcome to Nexo Global
            </span>
          </motion.div>

          {/* VIP Hero Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative group perspective-1000"
          >
            {/* Multi-layered Glow */}
            <div className="absolute -inset-4 bg-primary/20 blur-[80px] rounded-full animate-pulse group-hover:bg-primary/30 transition-all" />
            <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-all" />
            
            <div className="relative overflow-hidden rounded-[50px] border-[1px] border-white/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] bg-app-card">
              {/* Premium Gradient Border Overlay */}
              <div className="absolute inset-0 p-[2px] rounded-[50px] bg-gradient-to-br from-primary via-blue-400 to-amber-400 opacity-50" />
              
              <div className="relative rounded-[48px] overflow-hidden bg-app-bg">
                <img 
                  src="/images/binary-tree-guide.png" 
                  alt="Nexo Global VIP Networking" 
                  className="w-full max-w-[650px] h-auto object-cover hover:scale-110 transition-transform duration-1000 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-10" />
              </div>

              {/* VIP Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-6 right-6 bg-white/5 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl shadow-2xl z-20"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] shadow-amber-900/50">VIP Access</span>
                  </div>
                  <span className="text-2xl font-black text-white italic tracking-tighter">+450% ROI</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl text-center space-y-4"
          >
            <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter text-app-text uppercase">
              Your Gateway to <span className="text-primary">Digital Wealth</span>
            </h1>
            <p className="text-app-dim font-bold text-lg md:text-xl leading-relaxed italic">
              Connect with the world's most powerful digital networking platform. 
              Built on USDT, designed for global entrepreneurs.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 italic"
            >
              Start Earning Now <ArrowRight size={18} />
            </Link>
            <Link 
              href="#pricing" 
              className="w-full sm:w-auto bg-app-card border border-app-border text-app-text px-10 py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-sm hover:scale-105 transition-all flex items-center justify-center gap-2 italic"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-app-border w-full max-w-4xl"
          >
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="text-primary mb-1" size={24} />
              <span className="text-lg font-black text-app-text italic">Global Secure</span>
              <span className="text-[10px] font-bold text-app-dim uppercase tracking-widest">USDT Verified</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Users className="text-primary mb-1" size={24} />
              <span className="text-lg font-black text-app-text italic">25k+ Members</span>
              <span className="text-[10px] font-bold text-app-dim uppercase tracking-widest">Global Community</span>
            </div>
            <div className="hidden md:flex flex-col items-center gap-1">
              <Zap className="text-primary mb-1" size={24} />
              <span className="text-lg font-black text-app-text italic">Instant Payouts</span>
              <span className="text-[10px] font-bold text-app-dim uppercase tracking-widest">Crypto Automated</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}