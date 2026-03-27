"use client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bsc, polygon } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";

// Create the config as a singleton
const WC_PROJECT_ID = "18c2195443c58ef1c869579c51c6871f";

const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: WC_PROJECT_ID,
    chains: [bsc, polygon],
    transports: {
      [bsc.id]: http(),
      [polygon.id]: http(),
    },
    appName: "Nexo Global",
    ssr: true, // Crucial for Next.js 13+ App Router
  })
);

const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider 
          theme="auto" 
          mode="dark"
          options={{
             setShowBalance: true,
             initialChainId: bsc.id
          }}
        >
          {/* 
            Native-like hydration handling: 
            Preventing full-app flicker by only gating Web3-dependent logic if needed, 
            but here we follow the standard pattern for Wagmi/ConnectKit stability.
          */}
          {mounted ? children : (
             <div className="min-h-screen flex items-center justify-center bg-bg-app transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                   <Loader2 className="animate-spin text-primary" size={32} />
                   <p className="font-black italic uppercase tracking-widest text-[8px] text-text-dim">Syncing Protocol...</p>
                </div>
             </div>
          )}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default Web3Provider;
