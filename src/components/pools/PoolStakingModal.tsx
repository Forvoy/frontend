'use client';

import { useState } from 'react';
import { Pool } from '@/types';
import { usePoolStaking } from '@/lib/hooks/usePoolStaking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PoolStakingModalProps {
  pool: Pool;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PoolStakingModal({ pool, onClose, onSuccess }: PoolStakingModalProps) {
  const { stakeOnPool, calculatePotentialReward, loading } = usePoolStaking();
  const [selectedPosition, setSelectedPosition] = useState<'agree' | 'disagree'>('agree');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStake = async () => {
    setError(null); // Clear previous errors
    const stakeAmount = parseFloat(amount);
    if (stakeAmount < 10) {
      console.warn('[PoolStakingModal] Stake amount below minimum $10:', stakeAmount);
      setError('Minimum stake amount is $10 USDC. Please enter a larger amount.');
      return; // $10 minimum stake
    }

    setIsSubmitting(true);
    try {
      const result = await stakeOnPool(pool.id, selectedPosition, stakeAmount);

      if (result) {
        // Success!
        onSuccess?.();
        onClose();
      } else {
        // FIXED: Show user-friendly error message for failed stake
        setError('Staking failed. Please check your wallet balance and try again.');
      }
    } catch (error) {
      // FIXED: Comprehensive error handling
      console.error('[PoolStakingModal] Staking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Provide user-friendly error messages
      if (errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
        setError('Transaction was cancelled. No changes were made.');
      } else if (errorMessage.includes('insufficient funds')) {
        setError('Insufficient funds for gas fees. Please add more ETH to your wallet.');
      } else if (errorMessage.includes('Cannot change position')) {
        setError('You already staked on this pool with a different position. You can only add more to the same position.');
      } else if (errorMessage.includes('already resolved')) {
        setError('This news has already been resolved. Staking is no longer available.');
      } else {
        setError(`Staking failed: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const stakeAmount = parseFloat(amount) || 0;
  const potentialReward = stakeAmount >= 1
    ? calculatePotentialReward(pool, stakeAmount, selectedPosition)
    : null;

  const agreePercentage = pool.totalStaked > 0
    ? Math.round((pool.agreeStakes / pool.totalStaked) * 100)
    : 0;
  const disagreePercentage = pool.totalStaked > 0
    ? Math.round((pool.disagreeStakes / pool.totalStaked) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl border border-border bg-card my-8">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Stake on Pool</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-secondary"
            >
              ✕
            </Button>
          </div>

          {/* Pool Info */}
          <div className="mb-6 p-4 rounded-lg bg-card/50 border border-border/30">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{pool.creatorAddress}</span>
                  <Badge
                    className={pool.position === 'YES'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-rose-100 text-rose-700 border-rose-200'
                    }
                  >
                    {pool.position}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {pool.reasoning}
                </p>
              </div>
            </div>

            {/* Current Stakes */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Current Stakes</span>
                <span className="font-medium">${pool.totalStaked.toLocaleString()}</span>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="flex-1">
                  <div className="text-emerald-600 mb-1">Agree: {agreePercentage}%</div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${agreePercentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-rose-600 mb-1">Disagree: {disagreePercentage}%</div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${disagreePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Position Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Your Position</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPosition('agree')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPosition === 'agree'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                    : 'border-border hover:border-emerald-500/50'
                }`}
              >
                <div className="font-bold mb-1">Agree</div>
                <div className="text-xs opacity-75">Back this pool&apos;s position</div>
              </button>
              <button
                onClick={() => setSelectedPosition('disagree')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedPosition === 'disagree'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                    : 'border-border hover:border-rose-500/50'
                }`}
              >
                <div className="font-bold mb-1">Disagree</div>
                <div className="text-xs opacity-75">Bet against this pool</div>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Stake Amount (USDC)
            </label>
            <Input
              type="number"
              placeholder="10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              min="1"
              className="bg-background border-border text-lg"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Minimum $10 USDC
            </div>
          </div>

          {/* Potential Rewards */}
          {potentialReward && (
            <div className="mb-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="text-sm font-medium text-accent mb-3">Potential Outcomes</div>

              <div className="space-y-3">
                {selectedPosition === 'agree' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">If pool position CORRECT:</span>
                      <span className="font-bold text-emerald-600">
                        +${potentialReward.maxReward.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      You earn ${(potentialReward.maxReward - stakeAmount).toFixed(2)} profit
                      ({((potentialReward.maxReward - stakeAmount) / stakeAmount * 100).toFixed(1)}% ROI)
                    </div>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">If pool position WRONG:</span>
                      <span className="font-bold text-rose-600">
                        -${stakeAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      You lose your entire stake
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">If pool position WRONG:</span>
                      <span className="font-bold text-emerald-600">
                        +${potentialReward.maxReward.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      You earn ${(potentialReward.maxReward - stakeAmount).toFixed(2)} profit
                      ({((potentialReward.maxReward - stakeAmount) / stakeAmount * 100).toFixed(1)}% ROI)
                    </div>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">If pool position CORRECT:</span>
                      <span className="font-bold text-rose-600">
                        -${stakeAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      You lose your entire stake
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={!amount || parseFloat(amount) < 1 || isSubmitting || loading}
              className={`flex-1 ${
                selectedPosition === 'agree'
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-rose-500 hover:bg-rose-600'
              } text-white`}
            >
              {isSubmitting || loading ? 'Processing...' : `Confirm Stake`}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
              <div className="flex items-start gap-2">
                <span className="text-red-500">⚠️</span>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          )}

          {/* Warning & Info */}
          <div className="mt-4 space-y-2">
            <div className="p-3 rounded-lg bg-card/50 text-xs text-muted-foreground">
              ⚠️ <strong>Risk Warning:</strong> Staking involves risk of loss. Only stake what you can afford to lose.
              Rewards depend on the pool creator&apos;s position being correct/wrong.
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600">
              ℹ️ <strong>Reward Distribution:</strong> Winners (both pool creator and stakers) share the losing pool
              proportionally based on stake amounts. All winning stakers receive equal ROI regardless of role.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
