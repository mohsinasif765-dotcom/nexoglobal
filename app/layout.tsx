import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo Global",
  description: "Next-Generation Global Networking & Wealth Building",
  // Icons ka section yahan add karein
  icons: {
    icon: "/user-logo.png", // Agar file ka naam logo.png hai to wo likhein
    shortcut: "/user-logo.png",
    apple: "/user-logo.png",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import Web3Provider from "@/components/Web3Provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-indigo-500/30 selection:text-indigo-900 group/body`}
      >
        <ThemeProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
