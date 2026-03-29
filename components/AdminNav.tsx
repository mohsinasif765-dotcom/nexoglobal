"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Users, Banknote, Ticket } from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 py-3 pb-6 flex justify-between items-center z-50 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
      
      {/* 1. STATS / HOME */}
      <NavLink 
        href="/admin/dashboard" 
        icon={<LayoutDashboard size={20} />} 
        label="Stats" 
        active={isActive('/admin/dashboard')} 
      />

      {/* 2. SYSTEM SETTINGS */}
      <NavLink 
        href="/admin/settings" 
        icon={<Settings size={20} />} 
        label="Settings" 
        active={isActive('/admin/settings')} 
      />

      <NavLink 
        href="/admin/users" 
        icon={<Users size={20} />} 
        label="Users" 
        active={isActive('/admin/users')} 
      />

      {/* 4. DEPOSIT REQUESTS / PINS */}
      <NavLink 
        href="/admin/pins" 
        icon={<Ticket size={20} />} 
        label="Deposits" 
        active={isActive('/admin/pins')} 
      />

      {/* 4. PAYOUTS */}
      <NavLink 
        href="/admin/payouts" 
        icon={<Banknote size={20} />} 
        label="Payouts" 
        active={isActive('/admin/payouts')} 
      />

    </nav>
  );
}

function NavLink({ href, icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 flex-1 relative group">
      <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110 -translate-y-1' : 'text-gray-400 group-hover:text-primary group-hover:bg-primary-light'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${active ? 'text-primary' : 'text-gray-400'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
      )}
    </Link>
  );
}