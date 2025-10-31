'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config as wagmiConfig } from '@/lib/wagmi';
import { FarcasterProvider } from '@/contexts/FarcasterProvider';
import { useState } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import '@coinbase/onchainkit/styles.css';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <div suppressHydrationWarning>
      <FarcasterProvider>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </FarcasterProvider>
    </div>
  );
}