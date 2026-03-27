"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Key, Loader2, ChevronLeft } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
      <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-gray-500 font-bold uppercase text-[10px]">
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
          <Key size={24} />
        </div>
        
        <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter mb-2">Change Password</h2>
        <p className="text-gray-400 text-xs font-medium mb-8">Enter your new strong password below.</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            required
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-mono"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full bg-gray-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-gray-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-[10px] font-black uppercase tracking-widest ${message.includes("Error") ? "text-red-500" : "text-emerald-500"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}