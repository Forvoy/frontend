"use client";

import { useRouter } from 'next/navigation';
import { useFarcaster } from '@/contexts/FarcasterProvider';

/**
 * Custom hook for Farcaster-aware navigation
 * Uses Next.js router by default, with fallbacks for MiniApp environment
 */
export function useFarcasterNavigation() {
  const router = useRouter();
  const { isInFarcaster } = useFarcaster();

  /**
   * Navigate to home page (/)
   * Works both in regular web and Farcaster MiniApp environment
   */
  const navigateToHome = () => {
    console.log('[FarcasterNav] navigateToHome called, isInFarcaster:', isInFarcaster);

    if (isInFarcaster) {
      console.log('[FarcasterNav] Using Farcaster-optimized navigation');

      // Method 1: Try Next.js router first (preferred)
      try {
        router.push('/');
        return;
      } catch (e1) {
        console.log('[FarcasterNav] Next.js router failed:', e1);
      }

      // Method 2: Direct window.location for MiniApp iframe
      try {
        window.location.href = '/';
        return;
      } catch (e2) {
        console.log('[FarcasterNav] window.location.href failed:', e2);
      }

      // Method 3: Full URL navigation
      try {
        window.location.href = window.location.origin + '/';
        return;
      } catch (e3) {
        console.log('[FarcasterNav] Full URL navigation failed:', e3);
      }

      // Method 4: Force reload
      console.log('[FarcasterNav] Forcing page refresh...');
      window.location.reload();
    } else {
      // Regular web environment - use Next.js router
      console.log('[FarcasterNav] Using Next.js router');
      router.push('/');
    }
  };

  /**
   * Navigate to any route
   * @param path - Route path (e.g., '/news', '/profile/address')
   */
  const navigateTo = (path: string) => {
    console.log('[FarcasterNav] navigateTo called:', path, 'isInFarcaster:', isInFarcaster);

    if (isInFarcaster) {
      // Try Next.js router first, fallback to window.location
      try {
        router.push(path);
      } catch {
        console.log('[FarcasterNav] Router failed, using window.location');
        window.location.href = path;
      }
    } else {
      router.push(path);
    }
  };

  /**
   * Navigate back in history
   */
  const navigateBack = () => {
    console.log('[FarcasterNav] navigateBack called');

    if (isInFarcaster) {
      // In MiniApp, be careful with history
      try {
        router.back();
      } catch {
        console.log('[FarcasterNav] Router.back failed, navigating to home');
        navigateToHome();
      }
    } else {
      router.back();
    }
  };

  /**
   * Replace current route (no history entry)
   * @param path - Route path
   */
  const replaceTo = (path: string) => {
    console.log('[FarcasterNav] replaceTo called:', path);

    if (isInFarcaster) {
      try {
        router.replace(path);
      } catch {
        console.log('[FarcasterNav] Router.replace failed, using window.location.replace');
        window.location.replace(path);
      }
    } else {
      router.replace(path);
    }
  };

  return {
    navigateToHome,
    navigateTo,
    navigateBack,
    replaceTo,
    isInFarcaster,
  };
}
