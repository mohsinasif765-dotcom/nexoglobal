"use client";
import { Trophy, Gift, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function Product() {
  const rewards = [
    { icon: <Trophy className="text-amber-500" />, label: "Luxury Travel" },
    { icon: <Gift className="text-blue-500" />, label: "Tech Gear" },
    { icon: <Globe className="text-emerald-500" />, label: "Global Events" },
    { icon: <Star className="text-purple-500" />, label: "Elite Status" }
  ];

  return (
    <div id="product" className="mb-10 relative w-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-app-border bg-app-card p-8 md:p-12 transition-colors duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -ml-24 -mb-24" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left space-y-4 max-w-md">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-app-text uppercase leading-none">
            Exclusive <span className="text-primary">Global Rewards</span>
          </h2>
          <p className="text-app-dim font-bold text-sm italic">
            Unlock premium perks and international recognition as you grow your network with Nexo Global.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-app-bg border border-app-border p-6 rounded-3xl flex flex-col items-center text-center gap-3 backdrop-blur-sm hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {reward.icon}
              </div>
              <span className="text-[10px] font-black text-app-text uppercase tracking-widest leading-none">
                {reward.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}