'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/lib/privy';
import { Button } from '@/components/ui/button';
import { Droplet, Loader2 } from 'lucide-react';
import { parseUnits, formatUnits, type Abi } from 'viem';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import MockTokenABI from '@/abis/MockToken.json';
import FloatingIndicator from '@/components/shared/FloatingIndicator';

const USDC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`;
const MOCK_TOKEN_ABI = MockTokenABI as Abi;

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

export default function FaucetPage() {
  const { address, isConnected, isCorrectNetwork } = useWallet();
  const [mintAmount, setMintAmount] = useState('100');
  const [selectedPreset, setSelectedPreset] = useState(100);
  const [showIndicator, setShowIndicator] = useState(false);
  const [indicatorType, setIndicatorType] = useState<'loading' | 'success' | 'error'>('loading');
  const [indicatorMessage, setIndicatorMessage] = useState('');

  // Read USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: MOCK_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isCorrectNetwork,
    }
  });

  // Write contract - mint
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction states
  useEffect(() => {
    if (isPending) {
      setShowIndicator(true);
      setIndicatorType('loading');
      setIndicatorMessage('Confirming transaction...');
    } else if (isConfirming) {
      setIndicatorType('loading');
      setIndicatorMessage('Minting USDC...');
    } else if (isSuccess) {
      setIndicatorType('success');
      setIndicatorMessage(`Successfully minted ${mintAmount} USDC!`);
      refetchBalance();

      // Hide indicator after 3 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    } else if (error) {
      setIndicatorType('error');
      setIndicatorMessage(`Error: ${error.message}`);

      // Hide indicator after 5 seconds
      setTimeout(() => {
        setShowIndicator(false);
      }, 5000);
    }
  }, [isPending, isConfirming, isSuccess, error, mintAmount, refetchBalance]);

  const formattedBalance = balance
    ? formatUnits(balance as bigint, 6) // USDC has 6 decimals
    : '0.00';

  const handleMint = async () => {
    if (!address || !isConnected || !isCorrectNetwork) return;

    try {
      const amount = parseUnits(mintAmount, 6); // USDC has 6 decimals

      writeContract({
        address: USDC_ADDRESS,
        abi: MOCK_TOKEN_ABI,
        functionName: 'mint',
        args: [address, amount],
      });
    } catch (err) {
      console.error('Mint error:', err);
    }
  };

  const handlePresetClick = (amount: number) => {
    setMintAmount(amount.toString());
    setSelectedPreset(amount);
  };

  const handleMaxClick = () => {
    setMintAmount('10000');
    setSelectedPreset(0);
  };

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

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 md:pt-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border/40 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
            <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">USDC Faucet</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Please connect your wallet to use the faucet
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen pt-20 md:pt-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border/40 rounded-xl md:rounded-2xl p-6 md:p-8 text-center">
            <h1 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">USDC Faucet</h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
              Please switch to Base Sepolia network to use the faucet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingIndicator
        show={showIndicator}
        type={indicatorType}
        message={indicatorMessage}
        txHash={hash}
      />

      <div className="min-h-screen pt-20 md:pt-32 px-4 pb-8">
        <div className="max-w-3xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-8">
          {/* Balance Section */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your USDC Balance</p>
            <p className="text-4xl font-normal">
              {formatBalance(formattedBalance)} <span className="text-foreground">USDC</span>
            </p>
          </div>

          {/* Network Section */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Network</p>
            <p className="text-3xl font-normal">Base Sepolia</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="bg-card border border-border/40 rounded-2xl p-8 space-y-6">
            {/* Balance & Network Info */}
            <div className="grid grid-cols-2 gap-6">
              {/* Balance */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your USDC Balance</p>
                <p className="text-4xl font-medium">
                  {formatBalance(formattedBalance)} <span className="text-2xl font-normal">USDC</span>
                </p>
              </div>
              {/* Network */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Network</p>
                <p className="text-4xl font-medium">Base Sepolia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mint Amount Input */}
        <div className="bg-card border border-border/40 rounded-2xl md:rounded-3xl p-5 md:p-8 mt-8 md:mt-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <p className="text-base md:text-lg text-foreground">Mint Amount</p>
            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10">
              <Droplet className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
          </div>

          <input
            type="number"
            value={mintAmount}
            onChange={(e) => {
              setMintAmount(e.target.value);
              setSelectedPreset(0);
            }}
            className="w-full bg-transparent text-4xl md:text-6xl font-normal outline-none mb-4 md:mb-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="10000"
          />

          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
            <span>~${mintAmount || '0'}.00</span>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="hidden sm:inline">{formattedBalance} USDC</span>
              <button
                onClick={handleMaxClick}
                className="px-3 py-1 md:px-4 md:py-1 bg-primary hover:bg-primary/80 text-white rounded-full text-xs md:text-sm font-medium transition-colors"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Preset Amounts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-6">
          {PRESET_AMOUNTS.map((amount) => (
            <button
              key={amount}
              onClick={() => handlePresetClick(amount)}
              className={`
                py-2 md:py-3 px-4 md:px-6 rounded-full border text-base md:text-lg font-normal transition-all
                ${selectedPreset === amount
                  ? 'border-primary/50 bg-primary/5 text-primary'
                  : 'border-border/40 hover:border-border text-foreground hover:bg-card'
                }
              `}
            >
              {amount} USDC
            </button>
          ))}
        </div>

        {/* Mint Button */}
        <Button
          onClick={handleMint}
          disabled={isPending || isConfirming || !mintAmount || parseFloat(mintAmount) <= 0}
          className="w-full h-14 md:h-16 text-base md:text-lg font-normal rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all mt-5 md:mt-6"
        >
          {isPending || isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
              {isPending ? 'Confirming...' : 'Minting...'}
            </>
          ) : (
            <>
              <Droplet className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Mint {mintAmount} USDC
            </>
          )}
        </Button>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <span className="font-semibold">Note:</span> This is testnet USDC for Base Sepolia only. These tokens have no real value and are meant for testing purposes.
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
