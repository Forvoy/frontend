"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  bio?: string;
}

interface FarcasterContextType {
  isReady: boolean;
  user: FarcasterUser | null;
  error: string | null;
  isInFarcaster: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  isReady: false,
  user: null,
  error: null,
  isInFarcaster: false,
});

export const useFarcaster = () => {
  const context = useContext(FarcasterContext);
  if (!context) {
    throw new Error('useFarcaster must be used within FarcasterProvider');
  }
  return context;
};

interface FarcasterProviderProps {
  children: ReactNode;
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInFarcaster, setIsInFarcaster] = useState(false);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're on mobile and handle differently
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        console.log('[Farcaster] Mobile device detected:', isMobile);

        // Check if we're in Farcaster environment
        const isFarcaster = (() => {
          try {
            const checks = {
              windowTop: window.top !== window.self,
              userAgent: navigator.userAgent.includes('Farcaster') || navigator.userAgent.includes('Warpcast'),
              locationCheck: window.location !== window.parent.location,
              referrer: document.referrer.includes('warpcast.com') || document.referrer.includes('farcaster.xyz'),
              ancestorOrigins: window.location.ancestorOrigins?.length > 0
            };
            console.log('[Farcaster] Environment detection checks:', checks);

            return checks.windowTop ||
                   checks.userAgent ||
                   checks.locationCheck ||
                   checks.referrer ||
                   checks.ancestorOrigins;
          } catch (e) {
            console.log('[Farcaster] Detection error (assuming iframe):', e);
            // If we can't access window.top, we're likely in an iframe
            return true;
          }
        })();
        console.log('[Farcaster] Environment detected:', isFarcaster);
        setIsInFarcaster(isFarcaster);

        // For mobile devices, use shorter timeout and fallback faster
        const mobileTimeout = isMobile ? 2000 : 5000;
        const timeoutId = setTimeout(() => {
          console.log('[Farcaster] SDK timeout reached, setting ready to true');
          setIsReady(true);
        }, mobileTimeout);

        try {
          // Wait for SDK to be ready with timeout
          await Promise.race([
            sdk.actions.ready(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('SDK timeout')), mobileTimeout)
            )
          ]);

          clearTimeout(timeoutId);
          setIsReady(true);
          console.log('[Farcaster] SDK ready');

          // Get user context if available
          const context = await sdk.context;
          if (context?.user) {
            console.log('[Farcaster] User context loaded:', context.user);
            setUser(context.user as FarcasterUser);
          }
        } catch (sdkError) {
          console.log('[Farcaster] SDK initialization failed or timed out:', sdkError);
          clearTimeout(timeoutId);
          setIsReady(true); // Continue anyway - app should work without Farcaster
        }

      } catch (err) {
        console.error('[Farcaster] Failed to initialize:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Always set ready to true to prevent infinite loading
        setIsReady(true);
      }
    };

    initializeFarcaster();
  }, []);

  return (
    <FarcasterContext.Provider value={{ isReady, user, error, isInFarcaster }}>
      {children}
    </FarcasterContext.Provider>
  );
}
