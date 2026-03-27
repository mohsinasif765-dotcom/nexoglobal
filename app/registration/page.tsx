"use client";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js"; 
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, Mail, Lock, ShieldCheck, UserPlus, 
  Loader2, Eye, EyeOff, Copy, Check 
} from "lucide-react";

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  isValid?: boolean | null;
  icon?: React.ReactNode;
  disabled?: boolean;
  suffix?: React.ReactNode;
}

function RegistrationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sponsorValid, setSponsorValid] = useState<boolean | null>(null); 
  const [pinValid, setPinValid] = useState<boolean | null>(null);
  const [pinTier, setPinTier] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "", 
    password: "",
    sponsorCode: "NEXO-", 
    placement: "left",
    securityPin: "",
  });

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    const pinFromUrl = searchParams.get('pin');
    const placementFromUrl = searchParams.get('placement');
    
    if (refFromUrl) {
      const formattedRef = refFromUrl.startsWith("NEXO-") ? refFromUrl : `NEXO-${refFromUrl}`;
      setFormData(prev => ({ ...prev, sponsorCode: formattedRef }));
      checkSponsorInDb(formattedRef);
    }
    
    if (pinFromUrl) {
      setFormData(prev => ({ ...prev, securityPin: pinFromUrl }));
      checkPinInDb(pinFromUrl);
    }

    if (placementFromUrl === "left" || placementFromUrl === "right") {
      setFormData(prev => ({ ...prev, placement: placementFromUrl }));
    }
  }, [searchParams]);

  const checkSponsorInDb = async (code: string) => {
    if (!code || code === "NEXO-") {
      setSponsorValid(false);
      return;
    }
    try {
      const { data } = await supabase.from('profiles').select('id').eq('referral_code', code).single();
      setSponsorValid(!!data);
    } catch { setSponsorValid(false); }
  };

  const checkPinInDb = async (pin: string) => {
    if (!pin) return;
    try {
      const { data } = await supabase.from('pins').select('id, package_tier').eq('pin_code', pin).eq('status', 'unused').single();
      if (data) {
        setPinValid(true);
        setPinTier(data.package_tier);
      } else {
        setPinValid(false);
        setPinTier(null);
      }
    } catch { 
      setPinValid(false); 
      setPinTier(null);
    }
  };

  const handleSponsorChange = (v: string) => {
    let finalValue = v.toUpperCase();
    // Only auto-fix if "NEXO-NEXO-" appears (typical copy-paste error)
    if (finalValue.includes("NEXO-NEXO-")) {
      finalValue = finalValue.replace(/NEXO-NEXO-/gi, "NEXO-");
    }
    setFormData({ ...formData, sponsorCode: finalValue });
    setSponsorValid(null); 
  };

  const isFormReady = 
    formData.fullName.length > 2 &&
    formData.email.includes("@") && 
    formData.password.length >= 6 &&
    sponsorValid === true &&
    pinValid === true &&
    pinTier !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady) return; 
    setLoading(true);

    try {
      const { data: sponsor } = await supabase.from('profiles').select('id').eq('referral_code', formData.sponsorCode).single();
      if (!sponsor) throw new Error("Sponsor code is invalid.");

      // RPC find_automatic_parent now requires p_tier
      const { data: autoParentId, error: rpcError } = await supabase.rpc('find_automatic_parent', {
        p_sponsor_id: sponsor.id,
        p_placement: formData.placement,
        p_tier: pinTier
      });
      if (rpcError || !autoParentId) throw new Error("Tree placement failed. The tree tier might be full or sponsor not in tree.");

      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
      );

      const { data: authData, error: authError } = await authClient.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");

      const { error: finalError } = await supabase.rpc('complete_user_registration', {
        p_user_id: authData.user.id,
        p_full_name: formData.fullName,
        p_email: formData.email,
        p_sponsor_id: sponsor.id,
        p_parent_id: autoParentId,
        p_placement: formData.placement,
        p_account_type: "",
        p_account_number: "",
        p_pin_code: formData.securityPin
      });

      if (finalError) throw new Error(finalError.message);

      setLoading(false);
      setShowSuccessModal(true);

    } catch (err: any) {
      alert(err.message || "Registration fail ho gayi.");
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `*Nexo Global Account Details*\\n\\nEmail: ${formData.email}\\nPassword: ${formData.password}\\n\\nYou can now log in to the global network.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center p-4 bg-gray-50 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[500px] bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-primary p-8 text-center text-white leading-none">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Nexo Global</h2>
          <p className="opacity-80 text-[10px] mt-2 font-bold uppercase tracking-widest">Network Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <InputField icon={<User size={18}/>} label="Full Name" type="text" placeholder="Ahmed Raza" value={formData.fullName} onChange={(v: string) => setFormData({...formData, fullName: v})} />
          <InputField icon={<Mail size={18}/>} label="Email Address" type="email" placeholder="example@mail.com" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
          
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Sponsor Code" 
              type="text" 
              placeholder="NEXO-XXXX" 
              value={formData.sponsorCode} 
              onChange={handleSponsorChange} 
              onBlur={() => checkSponsorInDb(formData.sponsorCode)} 
              isValid={sponsorValid} 
            />
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 ml-1 mb-1 uppercase tracking-wider">Placement</label>
              <select className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-primary" value={formData.placement} onChange={(e) => setFormData({...formData, placement: e.target.value})}>
                <option value="left">Left Side</option>
                <option value="right">Right Side</option>
              </select>
            </div>
          </div>


          <InputField 
            icon={<ShieldCheck size={18}/>} 
            label="Security PIN" 
            type="text" 
            placeholder="NEXO-PIN-XXXX" 
            value={formData.securityPin} 
            onChange={(v: string) => { 
                let finalValue = v.toUpperCase();
                // If doubled during paste, fix it
                if (finalValue.includes("NEXO-PIN-NEXO-PIN-")) {
                    finalValue = finalValue.replace(/NEXO-PIN-NEXO-PIN-/gi, "NEXO-PIN-");
                }
                setFormData({...formData, securityPin: finalValue}); 
                setPinValid(null); 
            }}
            onBlur={() => checkPinInDb(formData.securityPin)} 
            isValid={pinValid} 
            disabled={!!searchParams.get('pin')}
          />

          <InputField 
            icon={<Lock size={18}/>} 
            label="Create Password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={formData.password} 
            onChange={(v: string) => setFormData({...formData, password: v})} 
            suffix={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          />

          <motion.button whileTap={{ scale: 0.97 }} disabled={loading || !isFormReady} type="submit" className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-xl flex justify-center items-center gap-2 mt-4 ${loading || !isFormReady ? 'bg-gray-300' : 'bg-primary shadow-primary/30'}`}>
            {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={20}/> Complete Registration</>}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[40px] p-8 relative z-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-black italic text-gray-900 uppercase tracking-tighter mb-2">Registration Done</h3>
              <p className="text-xs text-gray-500 font-bold mb-6">User successfully registered.</p>
              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 text-left space-y-3 mb-6">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Login Email</p>
                  <p className="text-sm font-bold text-gray-800">{formData.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Login Password</p>
                  <p className="text-sm font-bold text-gray-800">{formData.password}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={copyCredentials} className={`w-full py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white shadow-lg'}`}>
                  {copied ? <><Check size={18} /> Details Copied</> : <><Copy size={18} /> Copy & Send Details</>}
                </button>
                <button onClick={() => router.push('/pins')} className="w-full py-4 rounded-2xl font-black text-xs uppercase text-gray-400 hover:text-gray-900">
                  Close and Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function Registration() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
      <RegistrationForm />
    </Suspense>
  );
}

function InputField({ label, type, placeholder, value, onChange, onBlur, isValid, icon, disabled, suffix }: InputFieldProps) {
  let borderColor = "border-gray-100";
  if (isValid === true) borderColor = "border-green-500 bg-green-50";
  if (isValid === false) borderColor = "border-red-500 bg-red-50";
  return (
    <div className="flex flex-col relative">
      <label className="text-[10px] font-bold text-gray-400 ml-2 mb-1 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4 text-gray-300">{icon}</div>}
        <input disabled={disabled} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className={`w-full ${icon ? 'pl-11' : 'px-4'} ${suffix ? 'pr-12' : 'pr-4'} py-3.5 border rounded-2xl outline-none transition-all text-sm font-medium focus:ring-2 focus:ring-primary ${borderColor} bg-gray-50`} required />
        {suffix && <div className="absolute right-4">{suffix}</div>}
      </div>
    </div>
  );
}