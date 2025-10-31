'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/errors/ErrorFallback';

/**
 * PAGE-LEVEL ERROR HANDLER
 *
 * This is a Next.js 15 App Router error boundary that catches errors
 * at the page level (within a route segment).
 *
 * Automatically wraps page components and catches:
 * - Component rendering errors
 * - Data fetching errors
 * - Event handler errors
 *
 * Usage:
 * - Automatically used by Next.js App Router
 * - Place in app/ directory to catch errors for all pages
 * - Place in app/[route]/ to catch errors for specific route
 *
 * Why Important for Smart Contracts:
 * - Contract read/write operations can fail unexpectedly
 * - Provides consistent error UI across all pages
 * - Better UX than default Next.js error page
 *
 * See: https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (in production, send to error tracking service)
    console.error('[Page Error]', error);

    // TODO: Send to error tracking service
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, {
    //     tags: {
    //       errorBoundary: 'page',
    //       digest: error.digest,
    //     },
    //   });
    // }
  }, [error]);

  return <ErrorFallback error={error} reset={reset} />;
}
