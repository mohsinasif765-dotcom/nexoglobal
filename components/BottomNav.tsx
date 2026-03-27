"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Ticket, Wallet, Layers } from "lucide-react"; 
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Home },
    { name: "Levels", path: "/levels", icon: Layers },
    { name: "Wallet", path: "/wallet", icon: Wallet, isFab: true },
    { name: "PINs", path: "/pins", icon: Ticket },
    { name: "Tree", path: "/tree", icon: Users },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto flex items-center justify-between gap-1 px-2 py-2 bg-black/90 backdrop-blur-2xl rounded-[35px] border border-white/10 shadow-3xl shadow-black/40 w-full max-w-md"
      >
        {navItems.map((item) => {
          const active = pathname === item.path;

          if (item.isFab) {
            return (
              <Link key={item.path} href={item.path} className="relative -mt-12 flex flex-col items-center">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                    active ? 'bg-primary text-black' : 'bg-white text-black hover:bg-primary'
                  }`}
                >
                  <item.icon size={28} strokeWidth={2.5} />
                </motion.div>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-2 transition-all ${
                  active ? 'text-primary' : 'text-white/40'
                }`}>
                  {item.name}
                </span>
                {active && (
                   <motion.div layoutId="activeDot" className="w-1 h-1 bg-primary rounded-full mt-1" />
                )}
              </Link>
            );
          }

          return (
            <Link key={item.path} href={item.path} className="relative flex-1 py-1.5 rounded-full flex flex-col items-center group transition-all">
              {active && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute inset-x-1 inset-y-0 bg-primary/10 rounded-[20px] border border-primary/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <item.icon 
                  size={18} 
                  className={`transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-white/30 group-hover:text-white/60'}`} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={`text-[7px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${active ? 'text-primary' : 'text-white/10'}`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}