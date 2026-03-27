"use client";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, FileText, Scale, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsAndPrivacy() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Account Activation",
      icon: <ShieldCheck className="text-blue-500" size={20} />,
      content: "Account ko active karne ke liye aapko aik martaba package fee jama karani hogi. Fee jama hone aur Admin se approve hone ke baad hi aapka binary tree aur referral system active hoga."
    },
    {
      title: "2. Withdrawal Rules",
      icon: <Scale className="text-orange-500" size={20} />,
      content: "Kam az kam withdrawal limit 500 Rs hai. Withdrawal ki requests 24 se 48 ghanton mein process ki jati hain. Har withdrawal par 5% se 10% tak service charges apply ho sakte hain."
    },
    {
      title: "3. Privacy Policy",
      icon: <Lock className="text-emerald-500" size={20} />,
      content: "Aapka personal data jese Phone Number aur Transaction ID sirf verification ke liye istemal hota hai. Hum aapka data kisi teesri party (third party) ko farokht nahi karte."
    },
    {
      title: "4. Multi-Level Marketing (MLM)",
      icon: <FileText className="text-purple-500" size={20} />,
      content: "Nexo Global operates on a decentralized binary networking system. Your earnings are based on direct and indirect referrals. Any form of misrepresentation or policy violation may result in account suspension."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Terms & Privacy</h1>
      </header>

      <main className="p-6">
        {/* Intro Section */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
            <Scale size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
            Hamari Policies aur <br /> Qawaneen
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Aakhri baar update kiya gaya: Feb 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index} 
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-50 rounded-lg">
                  {section.icon}
                </div>
                <h3 className="font-bold text-gray-800">{section.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pl-10">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-5 bg-gray-50 rounded-3xl border border-gray-100 text-center">
          <p className="text-xs text-gray-400 leading-relaxed">
            App ko istemal karte hue aap in qawaneen ko tasleem karte hain. Kisi bhi sawal ki surat mein hamari support team se rabta karein.
          </p>
        </div>
      </main>
    </div>
  );
}