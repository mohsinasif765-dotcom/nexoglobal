"use client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BusinessPlan from "@/components/BusinessPlan";
import Product from "@/components/Product";
import DepositSection from "@/components/DepositSection";
import AboutUs from "@/components/AboutUs";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {

  return (
    <main className="min-h-screen bg-bg-app relative transition-colors duration-300">
      <Navbar />
      <Hero />
      
      <BusinessPlan />

      {/* Product Section with Scroll Margin Fix */}
      <section id="prizes" className="scroll-mt-24 max-w-3xl mx-auto px-6 py-10">
         <Product />
      </section>

      <DepositSection />
      <AboutUs />
      <Footer />

      {/* FLOATING MESSENGER ICON with LABEL */}
      <div className="fixed bottom-24 right-6 z-[9999] flex items-center gap-4">
        {/* Animated Text Label */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: [0.8, 1, 0.8],
            x: [0, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex bg-app-card/90 backdrop-blur-md border border-app-border px-4 py-2 rounded-2xl shadow-xl items-center gap-2 group"
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] md:text-[11px] font-extrabold text-app-text uppercase tracking-widest italic whitespace-nowrap">
            Join Team • <span className="text-primary">Contact Us</span>
          </span>
        </motion.div>

        {/* Messenger Button */}
        <motion.a
          href="https://m.me/1092623327260419"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 1 }}
          animate={{ 
            scale: [1, 1.08, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          whileHover={{ scale: 1.15 }}
          className="bg-gradient-to-br from-[#00B2FF] to-[#006AFF] text-white p-4 rounded-full shadow-[0_15px_35px_rgba(0,106,255,0.4)] flex items-center justify-center border-2 border-white/30 backdrop-blur-sm"
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.497 1.743 6.617 4.457 8.571V24l4.136-2.266a12.82 12.82 0 003.407.452c6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.314 14.894l-3.048-3.253-5.943 3.253 6.538-6.945 3.118 3.253 5.873-3.253-6.538 6.945z"/>
          </svg>
        </motion.a>
      </div>
    </main>
  );
}