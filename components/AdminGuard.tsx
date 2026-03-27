"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAccess() {
      // 1. Session check (Browser cookies yahan asani se mil jati hain)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace("/login");
        return;
      }

      // 2. Profile se role check karein
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || profile?.role !== "admin") {
        console.log("Access Denied: Not an admin");
        router.replace("/dashboard");
        return;
      }

      // Agar sab theek hai to access de do
      setIsAuthorized(true);
    }

    checkAccess();
  }, [router]);

  // Loading state jab tak check ho raha ho
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] italic">
          Verifying Admin...
        </p>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}