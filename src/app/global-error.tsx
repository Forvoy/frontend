'use client';

import { useEffect } from 'react';

/**
 * GLOBAL ERROR HANDLER
 *
 * This is a Next.js 15 App Router error boundary that catches errors
 * at the root level (the entire application).
 *
 * Catches errors that escape page-level error.tsx, including:
 * - Root layout errors
 * - Global initialization errors
 * - Critical runtime errors
 *
 * Note: Must include <html> and <body> tags because it replaces
 * the root layout when an error occurs.
 *
 * Usage:
 * - Automatically used by Next.js App Router
 * - Place in app/ directory (must be at root level)
 * - Last resort error handler
 *
 * Why Important for Smart Contracts:
 * - Catches catastrophic contract initialization errors
 * - Handles Wagmi/RainbowKit setup failures
 * - Prevents complete app crash
 *
 * See: https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error('[Global Error]', error);

    // TODO: Send to error tracking service
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, {
    //     tags: {
    //       errorBoundary: 'global',
    //       digest: error.digest,
    //     },
    //   });
    // }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}>
              ⚠️
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}>
              Critical Error
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#666',
              marginBottom: '2rem',
            }}>
              The application encountered a critical error and cannot continue.
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#999',
              marginBottom: '2rem',
            }}>
              {error.message}
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
            }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#3b82f6',
                  backgroundColor: 'white',
                  border: '2px solid #3b82f6',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '0.5rem',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  fontSize: '0.75rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {error.stack || error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
