'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from '@privy-io/wagmi';
import { config as wagmiConfig } from '@/lib/wagmi';
import { ClientOnly } from '@/lib/privy';
import { FarcasterProvider } from '@/contexts/FarcasterProvider';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@coinbase/onchainkit/styles.css';

const PrivyProvider = dynamic(
  () => import('@privy-io/react-auth').then((mod) => ({ default: mod.PrivyProvider })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Suppress console warnings for known Privy issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].includes('unique "key" prop') ||
           args[0].includes('cannot be a descendant') ||
           args[0].includes('validateDOMNesting'))
        ) {
          return;
        }
        originalError.apply(console, args);
      };

      // Cleanup function to restore original console.error
      return () => {
        console.error = originalError;
      };
    }
  }, []);

  return (
    <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
      <div suppressHydrationWarning>
        <FarcasterProvider>
          <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
              loginMethods: ['email', 'wallet'],
              appearance: {
                theme: 'dark',
                accentColor: '#676FFF',
                logo: '/forter.webp',
                showWalletLoginFirst: false,
              },
              embeddedWallets: {
                ethereum: {
                  createOnLogin: 'users-without-wallets',
                },
              },
              // Set Base Sepolia as the default chain
              defaultChain: {
                id: 84532, // Base Sepolia chain ID
                name: 'Base Sepolia',
                network: 'base-sepolia',
                nativeCurrency: {
                  decimals: 18,
                  name: 'Ethereum',
                  symbol: 'ETH',
                },
                rpcUrls: {
                  default: {
                    http: ['https://sepolia.base.org'],
                  },
                  public: {
                    http: ['https://sepolia.base.org'],
                  },
                },
                blockExplorers: {
                  default: {
                    name: 'BaseScan',
                    url: 'https://sepolia.basescan.org',
                  },
                },
                testnet: true,
              },
              // IMPORTANT: Only allow Base Sepolia - this prevents connection on other chains
              supportedChains: [
                {
                  id: 84532, // Base Sepolia chain ID
                  name: 'Base Sepolia',
                  network: 'base-sepolia',
                  nativeCurrency: {
                    decimals: 18,
                    name: 'Ethereum',
                    symbol: 'ETH',
                  },
                  rpcUrls: {
                    default: {
                      http: ['https://sepolia.base.org'],
                    },
                    public: {
                      http: ['https://sepolia.base.org'],
                    },
                  },
                  blockExplorers: {
                    default: {
                      name: 'BaseScan',
                      url: 'https://sepolia.basescan.org',
                    },
                  },
                  testnet: true,
                },
              ],
              mfa: {
                noPromptOnMfaRequired: false,
              },
              legal: {
                termsAndConditionsUrl: '',
                privacyPolicyUrl: '',
              },
            }}
          >
            <QueryClientProvider client={queryClient}>
              <WagmiProvider config={wagmiConfig}>
                {children}
              </WagmiProvider>
            </QueryClientProvider>
          </PrivyProvider>
        </FarcasterProvider>
      </div>
    </ClientOnly>
  );
}