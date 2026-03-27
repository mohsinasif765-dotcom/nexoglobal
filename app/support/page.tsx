"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Send, 
  MessageSquare, 
  Mail, 
  Loader2, 
  CheckCircle,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContactSupport() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('support_messages')
        .insert([{
          user_id: session.user.id,
          subject: formData.subject,
          message: formData.message
        }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
          <CheckCircle size={80} className="text-green-500 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800">Message Mil Gaya!</h2>
        <p className="text-gray-500 mt-2">Humari team jald hi aap se rabta karegi.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
        >
          Wapis Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-gray-50 rounded-full">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Contact Support</h1>
      </header>

      <main className="p-6 space-y-8">
        {/* Quick Contact Chips */}
        <div className="grid grid-cols-2 gap-4">
          <a 
            href="https://wa.me/923001234567" 
            target="_blank"
            className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex flex-col items-center gap-2 active:scale-95 transition"
          >
            <Smartphone className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase">WhatsApp</span>
          </a>
          <a 
            href="mailto:support@lifedreams.pk" 
            className="bg-blue-50 p-4 rounded-3xl border border-blue-100 flex flex-col items-center gap-2 active:scale-95 transition"
          >
            <Mail className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700 uppercase">Email</span>
          </a>
        </div>

        {/* Support Form */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <MessageSquare size={20} />
            <h3 className="font-bold text-gray-800">Humein Message Karein</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Subject</label>
              <input 
                type="text" 
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Withdrawal Issue / Account Update"
                className="w-full mt-1 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Message</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Apna masla yahan tafseel se likhein..."
                className="w-full mt-1 p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-medium resize-none"
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition disabled:bg-gray-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Message</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}