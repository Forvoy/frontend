'use client';

import { useWallet } from '@/lib/privy/useWallet';

export function ChainIndicator() {
  const { isConnected, isCorrectNetwork } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className={`
        px-3 py-1.5 rounded-lg text-xs font-medium border hidden md:inline
        ${isCorrectNetwork
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
          : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
        }
      `}>
        <div className="flex items-center gap-1.5">
          {/* Status dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${
            isCorrectNetwork ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
          }`} />
          {/* Chain name - hidden on mobile */}
          <span className="hidden md:inline">
            {isCorrectNetwork ? 'Base Sepolia' : 'Wrong Network'}
          </span>
        </div>
      </div>
    </div>
  );
}
