'use client';

import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { User, AlertCircle, Copy, Check, LogOut, Wallet } from 'lucide-react';
import { useWallet } from './useWallet';
import { baseSepolia, base } from 'viem/chains';
import { useReadContract } from 'wagmi';
import { formatUnits, type Abi } from 'viem';
import MockTokenABI from '@/abis/MockToken.json';
import { useFarcaster } from '@/contexts/FarcasterProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const USDC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;
const MOCK_TOKEN_ABI = MockTokenABI as Abi;

interface WalletConnectProps {
  className?: string;
}

// Type for Ethereum provider
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

export function WalletConnect({ className }: WalletConnectProps) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { address, isCorrectNetwork, switchToBaseSepoliaChain } = useWallet();
  const { isInFarcaster } = useFarcaster();
  const [hasMounted, setHasMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isCorrectNetwork,
    }
  });

  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, 6) // USDC has 6 decimals
    : '0.00';

  // Format large numbers with K, M, B, T suffixes
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);

    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    } else if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    } else {
      return num.toFixed(2);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    // Check if wallet is available in browser
    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

    if (typeof window !== 'undefined' && ethereum && !isInFarcaster) {
      try {
        // Get current chain ID from wallet
        const currentChainId = (await ethereum.request({ method: 'eth_chainId' })) as string;
        const chainIdDecimal = parseInt(currentChainId, 16);

        // If not on Base Sepolia, show warning first (strict for non-Farcaster)
        if (chainIdDecimal !== baseSepolia.id) {
          setShowNetworkWarning(true);
          return;
        }
      } catch (error) {
        console.log('Could not detect network, proceeding with login:', error);
      }
    }

    // Proceed with normal login (allow any network in Farcaster)
    login();
  };

  const handleSwitchAndConnect = async () => {
    const switched = await switchToBaseSepoliaChain();
    if (switched) {
      setShowNetworkWarning(false);
      // Small delay to ensure network switch completes
      setTimeout(() => login(), 500);
    }
  };

  // ClientOnly - prevent hydration mismatch
  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (!hasMounted) {
    return null;
  }

  // Loading state
  if (!ready) {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  // Not connected
  if (!authenticated) {
    return (
      <>
        {/* Network Warning Dialog */}
        <Dialog open={showNetworkWarning} onOpenChange={setShowNetworkWarning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <DialogTitle className="text-xl">Switch to Base Sepolia</DialogTitle>
              </div>
              <DialogDescription className="text-base pt-2">
                This app requires Base Sepolia network. Please switch your wallet network to Base Sepolia before connecting.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
              <Button
                onClick={handleSwitchAndConnect}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Switch to Base Sepolia & Connect
              </Button>
              <Button
                onClick={() => setShowNetworkWarning(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Normal Connect Button */}
        <Button
          onClick={handleConnect}
          className={`bg-gradient-to-r from-primary/70 to-accent/70 hover:from-primary hover:to-accent shadow-sm ${className}`}
        >
          Connect Wallet
        </Button>
      </>
    );
  }

  // Get wallet address for display
  const walletAddress = user?.wallet?.address;
  const displayName = user?.email?.address ||
    user?.google?.email ||
    (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'User');

  // Wrong network - show prominent warning and block usage
  if (authenticated && !isCorrectNetwork) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Wrong Network!</p>
            <p className="text-xs opacity-80">Please switch to Base Sepolia to continue</p>
          </div>
        </div>
        <Button
          onClick={switchToBaseSepoliaChain}
          className="bg-gradient-to-r from-red-500/70 to-orange-500/70 hover:from-red-500 hover:to-orange-500"
        >
          Switch to Base Sepolia
        </Button>
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Connected state (on correct network)
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="bg-card border-border/40 text-foreground hover:bg-card/80 transition-colors rounded-lg px-3 py-2 h-auto flex items-center gap-2"
      >
        {/* Profile Icon */}
        <User className="w-5 h-5 p-0.5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-semibold text-white" />

        {/* Address */}
        <span className="font-mono text-sm font-medium">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : displayName}
        </span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border/40 rounded-lg shadow-lg overflow-hidden z-50">
          {/* Balance */}
          <div className="px-4 py-3 border-b border-border/20">
            {/* USDC Balance */}
            <div className="flex items-center gap-2 text-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isCorrectNetwork && usdcBalance !== undefined
                  ? `${formatBalance(formattedUsdcBalance)} USDC`
                  : "Loading..."}
              </span>
            </div>
            {!isCorrectNetwork && (
              <div className="mt-2">
                <Button
                  onClick={() => {
                    switchToBaseSepoliaChain();
                    setIsOpen(false);
                  }}
                  size="sm"
                  className="w-full text-xs bg-orange-500 hover:bg-orange-600"
                >
                  Switch Network
                </Button>
              </div>
            )}
          </div>

          {/* Copy Address */}
          {address && (
            <button
              onClick={() => {
                copyAddress();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-2 text-foreground hover:bg-background/50 transition-colors text-sm border-b border-border/20"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-accent" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          )}

          {/* Disconnect */}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center gap-2 hover:bg-background/50 transition-colors text-sm text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  );
}
