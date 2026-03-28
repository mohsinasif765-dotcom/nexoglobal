"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Youtube, 
  Facebook, 
  Mail, 
  LogIn, 
  ArrowUp,
  ShieldCheck,
  Video // TikTok ke liye alternative icon ya MessageCircle use kar saktay hain
} from "lucide-react";

// TikTok icon Lucide mein nahi hota, is liye hum ek custom SVG ya Simple Icon use karein ge
const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.32-2.34-.14-3.32.44-.73.41-1.32 1.09-1.55 1.9-.22.65-.21 1.36-.02 2.03.2 1.01.87 1.88 1.75 2.41.6.38 1.3.57 2 .58 1.45.03 2.81-.82 3.44-2.12.23-.44.35-.93.38-1.42.02-3.52.02-7.04.02-10.56z"/>
  </svg>
);

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-app-card text-app-text pt-16 pb-8 relative overflow-hidden transition-colors duration-300 border-t border-app-border">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start space-y-6">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 overflow-hidden bg-white p-0.5 group-hover:border-primary transition-all shadow-2xl">
                <img 
                  src="/nexo-logo.png" 
                  alt="NEXO Global Logo" 
                  className="w-full h-full object-contain rounded-full scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black italic tracking-tighter text-app-text uppercase leading-none group-hover:text-primary transition-colors">
                  Nexo Global
                </span>
                <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mt-1">
                  World-Class Networking
                </span>
              </div>
            </Link>
            
            <p className="text-app-dim text-sm font-bold leading-relaxed max-w-sm italic">
              Empowering global entrepreneurs through decentralized digital networking. Join our world-class ecosystem and build your legacy.
            </p>

            {/* Social Icons Updated */}
            <div className="flex gap-3 pt-2">
              {[
                { 
                  icon: <Youtube size={20} />, 
                  color: "hover:bg-red-600 hover:text-white", 
                  link: "#" 
                },
                { 
                  icon: <TikTokIcon size={20} />, 
                  color: "hover:bg-primary hover:text-white", 
                  link: "#" 
                },
                { 
                  icon: <Facebook size={20} />, 
                  color: "hover:bg-blue-600 hover:text-white", 
                  link: "#"
                }
              ].map((social, i) => (
                <a 
                  key={i} href={social.link} target="_blank" rel="noopener noreferrer"
                  className={`w-11 h-11 bg-app-bg rounded-2xl flex items-center justify-center transition-all duration-300 ${social.color} hover:scale-110 border border-app-border shadow-sm`}
                >
                  <span className="text-app-dim transition-colors transition-all">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Explore</h4>
            <ul className="space-y-4">
              {["Home", "Rules", "Pricing", "Product", "About Us"].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === "Rules" ? "/rules" : `#${item.toLowerCase().replace(' ', '')}`} 
                    className="text-sm font-bold text-app-dim hover:text-primary transition-colors italic uppercase tracking-wider"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Join Team</h4>
            <div className="space-y-5">
              <Link 
                href="/login" 
                className="bg-primary text-white w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all italic"
              >
                <LogIn size={16} /> Member Login
              </Link>
              <div className="flex items-center justify-center md:justify-start gap-3 text-app-dim">
                <Mail size={16} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest italic leading-none">support@nexoglobal.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-500/80">
                <ShieldCheck size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Global Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-app-border pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[9px] font-black text-app-dim uppercase tracking-[0.2em]">
              © 2026 Nexo Global Digital Networking.
            </p>
            <p className="text-[8px] text-app-dim/50 font-bold uppercase">Empowering Entrepreneurs Globally</p>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full border border-app-border flex items-center justify-center group-hover:border-primary transition-colors">
              <ArrowUp size={16} className="text-app-dim group-hover:text-primary group-hover:-translate-y-1 transition-all" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-app-dim">Top</span>
          </button>
        </div>
      </div>
    </footer>

  );
}