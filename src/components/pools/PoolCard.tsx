'use client';

import { Pool } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { usePoolStaking } from '@/lib/hooks/usePoolStaking';
import { useTransactionFeedback } from '@/lib/hooks/useTransactionFeedback';
import FloatingIndicator from '@/components/shared/FloatingIndicator';
import { tokenService } from '@/lib/services';
import { Award, Trophy, Crown, Gem, Medal, HelpCircle, CheckCircle, XCircle, ZoomIn, DollarSign, Lock } from 'lucide-react';

interface PoolCardProps {
  pool: Pool;
  onStakeSuccess?: () => void;
}

export default function PoolCard({ pool, onStakeSuccess }: PoolCardProps) {
  const { address, isConnected } = useAccount();
  const { stakeOnPool, calculatePotentialReward, loading } = usePoolStaking();
  const { feedback, executeTransaction, showError } = useTransactionFeedback();

  const [showFullReasoning, setShowFullReasoning] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<'agree' | 'disagree' | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image click handler state - modal not needed, using new tab
  // const [showImageModal, setShowImageModal] = useState(false);

  // NEW: Calculate percentages WITHOUT including creator stake (20/80 split logic)
  // Creator is separate from staker pools now

  const agreePercentage = pool.totalStaked > 0
    ? Math.round((pool.agreeStakes / pool.totalStaked) * 100)
    : 0;
  const disagreePercentage = pool.totalStaked > 0
    ? Math.round((pool.disagreeStakes / pool.totalStaked) * 100)
    : 0;

  // Mock reputation data
  const getReputationDisplay = (address: string) => {
    const mockReputations: Record<string, { accuracy: number; tier: string }> = {
      '0x1234...5678': { accuracy: 87, tier: 'Master' },
      '0xabcd...efgh': { accuracy: 72, tier: 'Expert' },
      '0x2222...3333': { accuracy: 91, tier: 'Legend' },
      '0x4444...5555': { accuracy: 65, tier: 'Analyst' },
      '0x6666...7777': { accuracy: 78, tier: 'Expert' },
      '0x8888...9999': { accuracy: 70, tier: 'Expert' },
      '0xaaaa...bbbb': { accuracy: 88, tier: 'Master' },
      '0xcccc...dddd': { accuracy: 75, tier: 'Expert' },
      '0x9999...1111': { accuracy: 82, tier: 'Master' }
    };

    return mockReputations[address] || { accuracy: 0, tier: 'Novice' };
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Novice': return <Medal className="w-3.5 h-3.5 text-amber-700" />;
      case 'Analyst': return <Award className="w-3.5 h-3.5 text-gray-500" />;
      case 'Expert': return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
      case 'Master': return <Gem className="w-3.5 h-3.5 text-blue-500" />;
      case 'Legend': return <Crown className="w-3.5 h-3.5 text-purple-600" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  const reputation = getReputationDisplay(pool.creatorAddress);

  const handleStakeButtonClick = (position: 'agree' | 'disagree') => {
    setSelectedPosition(position);
    setShowStakeInput(true);
    setStakeAmount('');
  };

  const handleConfirmStake = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) < 1 || !selectedPosition) {
      return;
    }

    const amount = parseFloat(stakeAmount);

    // Validate balance
    const hasBalance = await tokenService.hasSufficientBalance(address as `0x${string}`, amount);
    if (!hasBalance) {
      showError('Insufficient USDC balance');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await executeTransaction(
        async () => {
          const stake = await stakeOnPool(pool.id, selectedPosition, amount, pool.newsId);

          if (!stake) {
            return { success: false, error: 'Staking failed' };
          }

          return {
            success: true,
            data: stake,
            hash: stake.id // In contract mode, this would be tx hash
          };
        },
        `Staking ${amount} USDC on ${selectedPosition === 'agree' ? 'Yes' : 'No'}...`,
        `Successfully staked ${amount} USDC!`,
        selectedPosition === 'agree' ? 'primary' : 'accent'
      );

      if (result) {
        // Success! Reset state and notify parent
        setShowStakeInput(false);
        setSelectedPosition(null);
        setStakeAmount('');
        onStakeSuccess?.();
      }
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelStake = () => {
    setShowStakeInput(false);
    setSelectedPosition(null);
    setStakeAmount('');
  };

  // NEW: Image click handler
  const handleImageClick = () => {
    if (pool.imageUrl) {
      // Open in new tab for better viewing
      window.open(pool.imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Floating Indicator */}
      <FloatingIndicator {...feedback} />

      <Card className={`border transition-all duration-300 hover:shadow-lg ${
        pool.status === 'resolved'
          ? 'border-accent/50 bg-accent/5 hover:bg-accent/10'
          : 'border-border bg-card hover:bg-muted/30'
      }`}>
        <CardContent className="p-5 md:p-6 space-y-4">
        {/* Resolved Badge */}
        {pool.status === 'resolved' && pool.outcome && (
          <div className="pb-4 border-b border-border/30">
            <Badge className={`px-3 py-1.5 font-semibold flex items-center gap-1.5 ${
              pool.outcome === 'creator_correct'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {pool.outcome === 'creator_correct' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Resolved - Correct
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Resolved - Wrong
                </>
              )}
            </Badge>
          </div>
        )}

        {/* Creator Info - Simplified */}
        <div className="flex items-center justify-between gap-3">
          <Link href={`/profile/${pool.creatorAddress}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
              {pool.creatorAddress.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {/* Mobile: shortened address */}
                <span className="font-semibold text-sm md:hidden">
                  {pool.creatorAddress.slice(0, 6)}...{pool.creatorAddress.slice(-4)}
                </span>
                {/* Desktop: full address */}
                <span className="font-semibold text-sm hidden md:block">{pool.creatorAddress}</span>
                <Badge variant="secondary" className="text-xs hidden md:inline-flex">
                  {getTierIcon(reputation.tier)} {reputation.tier}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground hidden md:block">
                {reputation.accuracy}% accuracy
              </span>
            </div>
          </Link>
          <Badge
            variant={pool.position === 'YES' ? 'default' : 'secondary'}
            className={`text-sm font-semibold px-3 py-1 flex-shrink-0 ${pool.position === 'YES'
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-rose-100 text-rose-700 border-rose-200'
            }`}
          >
            {pool.position}
          </Badge>
        </div>

        {/* Image - Simplified */}
        {pool.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-border/30 bg-muted/20 cursor-pointer group" onClick={handleImageClick}>
            <div className="relative w-full h-[180px] md:h-[240px]">
              <Image
                src={pool.imageUrl}
                alt={pool.imageCaption || 'Pool analysis chart'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 text-white text-xs bg-black/70 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5" />
                  Click to expand
                </div>
              </div>
            </div>
            {pool.imageCaption && (
              <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground text-center">
                {pool.imageCaption}
              </div>
            )}
          </div>
        )}

        {/* Reasoning */}
        <div>
          <p className={`text-sm text-foreground leading-relaxed ${!showFullReasoning && pool.reasoning.length > 150 ? 'line-clamp-3' : ''}`}>
            {pool.reasoning}
          </p>
          {pool.reasoning.length > 150 && (
            <button
              onClick={() => setShowFullReasoning(!showFullReasoning)}
              className="text-xs text-primary hover:underline mt-2"
            >
              {showFullReasoning ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Evidence Links */}
        {pool.evidence.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Supporting Evidence
            </div>
            <div className="flex flex-wrap gap-2">
              {pool.evidence.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-md hover:bg-accent/20 transition-colors font-medium"
                >
                  Source {index + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Stakes Visualization - Simplified */}
        <div className="p-4 rounded-lg bg-muted/20 border border-border/30 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Pool</span>
            <span className="text-lg font-bold text-primary">${pool.totalStaked.toLocaleString()}</span>
          </div>

          {/* Combined Progress Bar */}
          <div className="space-y-2">
            {/* Stake amounts above progress bar */}
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">${pool.agreeStakes.toLocaleString()}</span>
              <span className="text-muted-foreground">${pool.disagreeStakes.toLocaleString()}</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${agreePercentage}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-500"
                style={{ width: `${disagreePercentage}%` }}
              />
            </div>

            {/* Percentages below progress bar */}
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-emerald-700 font-medium">{agreePercentage}% Yes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-rose-700 font-medium">{disagreePercentage}% No</span>
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              </div>
            </div>
          </div>

          {/* Simplified Reward Info */}
          <div className="pt-2 border-t border-border/30 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                Winner takes 80% • Creator 20%
              </span>
              <span>Fee: 2%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {pool.status === 'resolved' ? (
          <div className="space-y-3">
            {/* Auto-Distributed Rewards Display */}
            {pool.autoDistributed && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 ml-2">
                    Rewards Auto-Distributed
                  </span>
                </div>
                {pool.outcome === 'creator_correct' ? (
                  <div className="text-xs text-green-600 text-center">
                    <div className="mb-1">Creator (20%): +${pool.creatorReward?.toLocaleString() || '0'}</div>
                    <div>Stakers (80%): +${pool.stakerRewardsDistributed?.toLocaleString() || '0'}</div>
                    {pool.rewardTxHash && (
                      <a
                        href={`https://sepolia.basescan.org/tx/${pool.rewardTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline block mt-1 hover:text-green-700"
                      >
                        View Transaction →
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-red-600 text-center">
                    Creator was wrong - All staker rewards distributed to No side
                    {pool.rewardTxHash && (
                      <a
                        href={`https://sepolia.basescan.org/tx/${pool.rewardTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline block mt-1 hover:text-red-700"
                      >
                        View Transaction →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="p-3 bg-accent/10 rounded-lg text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <Lock className="w-4 h-4" />
                Pool Settled - Staking Closed
              </p>
            </div>
          </div>
        ) : !showStakeInput ? (
          <div className="flex gap-3">
            <Button
              onClick={() => handleStakeButtonClick('agree')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              Yes
            </Button>
            <Button
              onClick={() => handleStakeButtonClick('disagree')}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-rose-500 font-semibold"
            >
              No
            </Button>
          </div>
        ) : (
          /* Inline Stake Input - Simplified */
          <div className="space-y-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                <span className={selectedPosition === 'agree' ? 'text-emerald-600' : 'text-rose-600'}>
                  {selectedPosition === 'agree' ? 'Yes' : 'No'}
                </span>
              </span>
              <button
                onClick={handleCancelStake}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Amount (USDC) - Min $1"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="1"
                onWheel={(e) => e.currentTarget.blur()}
                className="bg-background border-border text-base"
              />
            </div>

            {/* Potential Outcomes - Simplified */}
            {stakeAmount && parseFloat(stakeAmount) >= 1 && selectedPosition && (() => {
              const amount = parseFloat(stakeAmount);
              const potentialReward = calculatePotentialReward(pool, amount, selectedPosition);
              const profit = potentialReward.maxReward - amount;
              const roi = (profit / amount) * 100;

              return (
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-muted-foreground">Potential Win:</span>
                    <span className="font-bold text-emerald-600">
                      +${potentialReward.maxReward.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${profit.toFixed(2)} profit • {roi.toFixed(1)}% ROI
                  </div>
                </div>
              );
            })()}

            <Button
              onClick={handleConfirmStake}
              disabled={!stakeAmount || parseFloat(stakeAmount) < 1 || isSubmitting || loading}
              className={`w-full ${
                selectedPosition === 'agree'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              } text-white`}
              size="sm"
            >
              {isSubmitting || loading ? 'Processing...' : `Confirm Stake $${stakeAmount || '0'}`}
            </Button>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>{pool.createdAt.toLocaleDateString()}</span>
          {pool.farcasterCastHash && (
            <a
              href={`https://warpcast.com/~/conversations/${pool.farcasterCastHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors font-medium"
            >
              View on Farcaster →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
}
