"use client";
import BottomNav from "@/components/BottomNav";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Page Content */}
      <div className="pb-32">
        {children}
      </div>

      {/* Global Navigation */}
      <BottomNav />
    </div>
  );
}
