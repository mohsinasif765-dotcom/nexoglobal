"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  FileText, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  History, 
  Loader2,
  Phone,
  QrCode
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MoreMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, referral_code')
        .eq('id', session.user.id)
        .single();
      
      if (data) setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const menuItems = [
    { 
      group: "Team & Business", 
      items: [
        { icon: <History size={20} />, label: "Withdrawal History", path: "/withdraw-history", color: "text-orange-500" },
      ]
    },
    { 
      group: "Company & Support", 
      items: [
        { icon: <FileText size={20} />, label: "Terms & Conditions", path: "/terms", color: "text-gray-500" },
        { icon: <Headphones size={20} />, label: "Contact Support", path: "/support", color: "text-emerald-500" },
      ]
    }
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-primary" size={30} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      {/* 1. PROFILE VIEW HEADER (No Editing) */}
      <header className="bg-white p-8 pt-12 shadow-sm border-b border-gray-100 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border-2 border-primary/20">
          <User size={40} />
        </div>
        <h1 className="text-xl font-bold text-gray-800">{profile?.full_name || "User Name"}</h1>
        
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Phone size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600">{profile?.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <QrCode size={14} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600 font-mono">{profile?.referral_code}</span>
          </div>
        </div>
      </header>

      <main className="p-4 mt-6 space-y-8">
        
        {menuItems.map((group, gIndex) => (
          <div key={gIndex} className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
              {group.group}
            </h3>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {group.items.map((item, iIndex) => (
                <motion.div 
                  key={iIndex}
                  whileTap={{ backgroundColor: "#f9fafb" }}
                  onClick={() => router.push(item.path)}
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors
                    ${iIndex !== group.items.length - 1 ? 'border-b border-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl bg-gray-50 ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* 2. LOGOUT BUTTON */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full mt-6 p-4 bg-red-50 text-red-600 rounded-3xl font-bold flex items-center justify-center gap-3 border border-red-100 active:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </motion.button>

        <div className="text-center pt-8">
          <p className="text-[10px] text-gray-400 font-mono tracking-[0.3em] uppercase">Nexo Global Network</p>
          <p className="text-[9px] text-gray-400 mt-1">Secure Member Portal</p>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}