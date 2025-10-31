'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFarcasterNavigation } from '@/lib/hooks/useFarcasterNavigation';
import { useFarcaster } from '@/contexts/FarcasterProvider';

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
}

/**
 * ERROR FALLBACK UI
 *
 * Displays user-friendly error message when something goes wrong.
 * Provides actions to recover (retry, go home).
 *
 * Usage:
 * - Used automatically by ErrorBoundary
 * - Can be used standalone in error.tsx pages
 *
 * Why Important for Smart Contracts:
 * - Contract errors need clear user communication
 * - Users should understand what went wrong
 * - Provide clear next steps (retry, check wallet, etc.)
 */
export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const router = useRouter();
  const { navigateToHome } = useFarcasterNavigation();

  // Parse error message for user-friendly display
  const errorMessage = error?.message || 'An unexpected error occurred';

  // Detect common contract errors
  const isContractError = errorMessage.toLowerCase().includes('contract') ||
                          errorMessage.toLowerCase().includes('transaction') ||
                          errorMessage.toLowerCase().includes('revert');

  const isNetworkError = errorMessage.toLowerCase().includes('network') ||
                         errorMessage.toLowerCase().includes('connection');

  const isUserRejection = errorMessage.toLowerCase().includes('user rejected') ||
                          errorMessage.toLowerCase().includes('user denied');

  // User-friendly error messages
  let displayMessage = errorMessage;
  let displayTitle = 'Something went wrong';
  let suggestions: string[] = [];

  if (isUserRejection) {
    displayTitle = 'Transaction Cancelled';
    displayMessage = 'You cancelled the transaction in your wallet.';
    suggestions = ['Try again if this was a mistake'];
  } else if (isContractError) {
    displayTitle = 'Smart Contract Error';
    suggestions = [
      'Check your wallet balance',
      'Ensure you\'re on the correct network (Base Sepolia)',
      'Try increasing gas limit',
    ];
  } else if (isNetworkError) {
    displayTitle = 'Network Error';
    displayMessage = 'Unable to connect to the blockchain network.';
    suggestions = [
      'Check your internet connection',
      'Try switching to a different RPC endpoint',
      'Wait a moment and try again',
    ];
  } else {
    suggestions = [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if the issue persists',
    ];
  }

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      router.refresh();
    }
  };

  const handleGoHome = () => {
    // Use Farcaster-aware navigation for better compatibility
    navigateToHome();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{displayTitle}</CardTitle>
          <CardDescription className="text-base mt-2">
            {displayMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details (collapsible in production) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
              <summary className="cursor-pointer font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto whitespace-pre-wrap break-words">
                {error.stack || error.message}
              </pre>
            </details>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                Try these steps:
              </h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          {/* Additional Help */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Need help?{' '}
            <a
              href="https://github.com/your-repo/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              Report this issue
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
