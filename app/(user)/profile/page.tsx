"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, ShieldCheck, Key, LogOut, ChevronRight, 
  FileText, Lock, Info, MessageCircle, ArrowLeft,
  Loader2, Zap, Settings, CreditCard, History,
  Camera, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useRef } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }

      // Fetch profile data including profile_url
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError) throw profileError;

      if (profile) {
        setUserData({
          name: profile.full_name,
          referralCode: profile.referral_code,
          status: profile.status,
          userId: authUser.id,
          profileUrl: profile.profile_url
        });
      }
    } catch (e) {
      console.error("Profile Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.userId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // 3. Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_url: publicUrl })
        .eq('id', userData.userId);

      if (updateError) throw updateError;

      // 4. Update local state
      setUserData({ ...userData, profileUrl: publicUrl });
      alert("Profile picture updated successfully!");

    } catch (error: any) {
      alert(error.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-app text-primary">
       <Loader2 className="animate-spin" size={32} />
       <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-text-dim italic">Loading VIP Profile...</p>
    </div>
  );

  const menuItems = [
    { label: "Account Security", group: [
      { name: "Change Password", icon: <Key size={18} />, action: () => router.push("/settings/change-password"), color: "text-primary" },
      { name: "Withdraw History", icon: <History size={18} />, action: () => router.push("/withdraw-history"), color: "text-primary" }
    ]},
    { label: "Legal & Vision", group: [
      { name: "Terms & Conditions", icon: <FileText size={18} />, action: () => router.push("/terms"), color: "text-blue-500" },
      { name: "Privacy Policy", icon: <Lock size={18} />, action: () => router.push("/privacy"), color: "text-emerald-500" },
      { name: "About Nexo Global", icon: <Info size={18} />, action: () => router.push("/about"), color: "text-purple-500" }
    ]},
    { label: "Support Protocol", group: [
      { name: "Contact Support", icon: <MessageCircle size={18} />, action: () => window.open('https://t.me/nexoglobal_support'), color: "text-primary" }
    ]}
  ];

  return (
    <div className="min-h-screen bg-bg-app pb-32 transition-colors duration-300">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/*" 
        className="hidden" 
      />
      {/* HEADER */}
      <header className="bg-bg-card/80 backdrop-blur-xl p-5 sticky top-0 z-40 border-b border-app flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.back()} 
             className="w-10 h-10 bg-bg-app border border-app rounded-2xl flex items-center justify-center text-text-dim hover:text-primary transition-all active:scale-95 shadow-sm"
           >
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-xl font-black italic tracking-tighter text-text-app leading-none uppercase">VIP Profile</h1>
        </div>
        <button onClick={handleLogout} className="w-10 h-10 bg-bg-app border border-app rounded-2xl flex items-center justify-center text-text-dim hover:text-rose-500 transition-all active:scale-95 shadow-sm">
           <LogOut size={20} />
        </button>
      </header>

      <main className="p-6 space-y-10">
        {/* User Badge */}
        <section className="text-center relative py-6">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
           <div className="relative z-10 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-indigo-600 rounded-[45px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 overflow-hidden border-4 border-bg-card">
                   {uploading ? (
                     <Loader2 className="animate-spin" size={32} />
                   ) : userData?.profileUrl ? (
                     <img src={userData.profileUrl} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <User size={64} />
                   )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-bg-card group-hover:scale-110 active:scale-90 transition-all"
                >
                   <Camera size={18} />
                </button>
              </div>
              <h2 className="text-3xl font-black text-text-app italic uppercase tracking-tighter leading-none mb-2">{userData?.name}</h2>
              <div className="flex items-center justify-center gap-2">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic border border-primary/20 px-3 py-1 rounded-full bg-primary/5">Node ID: {userData?.referralCode}</span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic border border-emerald-500/20 px-3 py-1 rounded-full bg-emerald-500/5">{userData?.status}</span>
              </div>
           </div>
        </section>

        {/* Menu Groups */}
        <div className="space-y-8">
           {menuItems.map((group, gIdx) => (
             <div key={gIdx} className="space-y-3">
                <p className="text-[10px] font-black text-text-dim uppercase tracking-[0.3em] ml-4 italic px-2 border-l-2 border-primary/40">{group.label}</p>
                <div className="bg-bg-card rounded-[40px] border border-app shadow-sm overflow-hidden divide-y divide-app">
                   {group.group.map((item, iIdx) => (
                     <motion.button
                       whileTap={{ scale: 0.98 }}
                       key={iIdx}
                       onClick={item.action}
                       className="w-full p-6 flex items-center justify-between hover:bg-bg-app transition-all text-left group"
                     >
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl bg-bg-app border border-app shadow-inner ${item.color} group-hover:scale-110 transition-transform`}>
                             {item.icon}
                          </div>
                          <span className="text-sm font-black text-text-app italic uppercase tracking-tighter">{item.name}</span>
                       </div>
                       <ChevronRight size={18} className="text-text-dim opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                     </motion.button>
                   ))}
                </div>
             </div>
           ))}
        </div>

        {/* Action Logout */}
        <button 
           onClick={handleLogout}
           className="w-full bg-rose-500/10 border border-rose-500/20 p-6 rounded-[35px] flex items-center justify-between group active:scale-[0.98] transition-all"
        >
           <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
                 <LogOut size={20} />
              </div>
              <p className="text-sm font-black text-rose-500 italic uppercase tracking-tighter">Secure Session Exit</p>
           </div>
           <ChevronRight size={18} className="text-rose-500" />
        </button>

        {/* Footer Note */}
        <div className="text-center space-y-2 opacity-30 select-none">
           <Zap className="mx-auto text-primary" size={24} />
           <p className="text-[8px] font-black text-text-dim uppercase tracking-[0.5em] italic">Binary Protocol Encryption Active</p>
        </div>
      </main>
    </div>
  );
}
