"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LogIn } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "#pricing" },
    { name: "Global Tree", href: "/tree" },
    { name: "Wallet", href: "/wallet" },
    { name: "About", href: "#about" },
  ];
  
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-app-card/80 backdrop-blur-xl border-b border-app-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-full border-2 border-primary/20 overflow-hidden bg-white group-hover:border-primary transition-all shadow-xl p-0.5">
                <img 
                  src="/nexo-logo.png" 
                  alt="NEXO Global Logo" 
                  className="w-full h-full object-contain rounded-full scale-110"
                />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black italic tracking-tighter text-app-text leading-none uppercase group-hover:text-primary transition-colors">
                NEXO GLOBAL
              </span>
              <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mt-1">
                World-Class Networking
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-8 mr-4 border-r border-app-border pr-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className="text-[10px] font-black text-app-dim hover:text-primary transition-colors uppercase tracking-[0.2em] italic"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href={isLoggedIn ? "/dashboard" : "/login"} 
                className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 italic"
              >
                <LogIn size={16} /> {isLoggedIn ? "Dashboard" : "Login"}
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button 
              className="p-2.5 text-app-text bg-app-card rounded-xl border border-app-border shadow-sm active:scale-95 transition-all"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[60]"
            />

            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-app-bg z-[70] shadow-2xl p-8 flex flex-col border-l border-app-border"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden">
                    <img src="/user-logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black italic text-sm text-primary uppercase">Menu</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-app-card rounded-xl text-app-dim border border-app-border"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8">
                <Link 
                  href="/login" onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-center flex items-center justify-center gap-2 shadow-xl shadow-primary/20 uppercase text-[11px] tracking-widest italic"
                >
                  <LogIn size={18} /> Member Login
                </Link>
              </div>

              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} href={link.href} onClick={() => setIsOpen(false)}
                    className="flex justify-between items-center group"
                  >
                    <span className="text-lg font-black text-app-text group-hover:text-primary transition-colors italic uppercase">
                      {link.name}
                    </span>
                    <ChevronRight size={18} className="text-app-dim group-hover:text-primary" />
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <p className="text-[9px] text-center text-gray-300 dark:text-gray-600 font-bold uppercase tracking-widest italic leading-relaxed">
                  Connect. Earn. Thrive. <br />
                  NEXO GLOBAL v1.1
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}