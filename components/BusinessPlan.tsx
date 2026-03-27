"use client";
import { Check, Zap, Rocket, Star, Crown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Pricing() {
  const [prices, setPrices] = useState<Record<string, string>>({
    starter: "2",
    plus: "5",
    pro: "10",
    elite: "20"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("key, value")
          .filter("key", "ilike", "package_%_price");

        if (error) throw error;

        if (data) {
          const newPrices: Record<string, string> = {};
          data.forEach((setting: any) => {
            const packageKey = setting.key.replace("package_", "").replace("_price", "");
            newPrices[packageKey] = setting.value;
          });
          setPrices(prev => ({ ...prev, ...newPrices }));
        }
      } catch (err) {
        console.error("Error fetching prices:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: <Zap className="text-blue-500" />,
      features: ["$1 Reward per Team Pair", "Global Network Access", "24/7 Global Support", "Passive Team Earnings"],
      color: "bg-blue-50/50",
      borderColor: "border-blue-100"
    },
    {
      id: "plus",
      name: "Plus",
      icon: <Rocket className="text-purple-500" />,
      features: ["Higher Team Reward Rate", "Accelerated Pairing", "Unlimited Passive Income", "Priority Team Support", "Basic Analytics"],
      color: "bg-purple-50/50",
      borderColor: "border-purple-100",
      popular: true
    },
    {
      id: "pro",
      name: "Pro",
      icon: <Star className="text-amber-500" />,
      features: ["VIP Reward Multipliers", "Double Pairing Speed", "Advanced Team Insights", "Dedicated Support", "Elite Dashboard"],
      color: "bg-amber-50/50",
      borderColor: "border-amber-100"
    },
    {
      id: "elite",
      name: "Elite",
      icon: <Crown className="text-emerald-500" />,
      features: ["Ultimate Team Royalty", "Maximized Passive Flows", "Global Business Mentor", "Instant VIP Payouts", "Full Platform Control"],
      color: "bg-emerald-50/50",
      borderColor: "border-emerald-100"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-app-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-app-text uppercase">
            Choose Your <span className="text-primary">Wealth Plan</span>
          </h2>
          <p className="text-app-dim font-bold text-lg italic max-w-2xl mx-auto">
            Select a plan that fits your ambition. Prices are controlled by Nexo Global core settings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-primary">
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-[40px] border-2 bg-app-card border-app-border flex flex-col items-center text-center shadow-lg hover:shadow-2xl hover:border-primary/50 transition-all duration-500 group`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full uppercase italic tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}
                
                <div className="w-16 h-16 rounded-3xl bg-app-bg shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {plan.icon}
                </div>

                <h3 className="text-2xl font-black italic text-app-text uppercase mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black text-app-text">${prices[plan.id]}</span>
                  <span className="text-sm font-bold text-app-dim uppercase tracking-widest">USDT</span>
                </div>

                <ul className="space-y-4 w-full mb-10 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm font-bold text-app-dim italic">
                      <Check size={16} className="text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={`https://m.me/1092623327260419?ref=${encodeURIComponent(plan.name + "_Plan")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto w-full bg-app-bg border border-app-border text-center text-app-text py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 italic"
                >
                  Get Started
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}