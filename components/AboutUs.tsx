"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Zap, MapPin, CheckCircle2, Award } from "lucide-react";

export default function AboutUs() {
  return (
    <section id="about" className="py-20 md:py-32 bg-app-bg overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        {/* Mobile: Stacked (Image top), Desktop: Side-by-Side */}
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
          
          {/* Visual Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            {/* Main Image Frame */}
            <div className="relative z-10 rounded-[48px] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-app-card aspect-[4/5] md:aspect-auto transition-colors duration-300">
               <img 
                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
                 alt="Life Dreams Team" 
                 className="w-full h-full md:h-[550px] object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               
               {/* Location Tag */}
               <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-1.5 opacity-90">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Digital Global Network</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
                    Future of Networking <br/> Since 2024
                  </h3>
               </div>
            </div>
            
            {/* Crypto Badge */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-4 md:-bottom-8 -right-2 md:-right-8 bg-app-card p-4 md:p-6 rounded-[32px] shadow-2xl border border-app-border z-20 flex items-center gap-3 md:gap-4 active:scale-95 transition-all"
            >
               <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  <Zap size={28} className="md:w-10 md:h-10" />
               </div>
               <div>
                  <p className="text-[8px] md:text-[10px] font-black text-app-dim uppercase tracking-widest leading-none mb-1">Powered By</p>
                  <p className="text-sm md:text-xl font-black text-app-text italic tracking-tighter uppercase">Blockchain USDT</p>
               </div>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <div className="w-full lg:w-1/2 space-y-8 md:space-y-12">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="w-8 h-[2px] bg-primary rounded-full" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">WHO WE ARE</span>
               </div>
               <h2 className="text-3xl md:text-6xl font-black italic tracking-tighter text-app-text leading-[0.85] uppercase">
                 Empowering <span className="text-primary">Entrepreneurs</span> <br className="hidden md:block"/> for a Digital Era
               </h2>
            </div>

            {/* English Text with accent border */}
            <div className="relative pl-6 py-2 border-l-4 border-primary/30">
               <div className="flex items-center gap-2 mb-3 text-primary">
                  <Target size={18} />
                  <h4 className="text-xs font-black uppercase tracking-widest italic">The Vision</h4>
               </div>
               <p className="text-app-dim text-sm md:text-base font-bold leading-relaxed italic">
                 Nexo Global is a decentralized, digital-first networking platform. Our mission is to provide every individual with the tools and network to build their own global business. We leverage the power of blockchain and USDT to ensure transparent, instant, and borderless wealth creation for everyone, everywhere.
               </p>
            </div>

            {/* Status Icons - Balanced for Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 pt-4">
               <div className="flex items-center gap-3 p-4 bg-app-card rounded-2xl border border-app-border shadow-sm group hover:border-primary transition-colors">
                  <Award size={20} className="text-primary" />
                  <span className="text-[9px] md:text-[11px] font-black text-app-text uppercase italic tracking-tighter leading-tight">
                    Transparent <br/> System
                  </span>
               </div>
               <div className="flex items-center gap-3 p-4 bg-app-card rounded-2xl border border-app-border shadow-sm group hover:border-primary transition-colors">
                  <ShieldCheck size={20} className="text-primary" />
                  <span className="text-[9px] md:text-[11px] font-black text-app-text uppercase italic tracking-tighter leading-tight">
                    Secure <br/> Cloud
                  </span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}