import { useGlobalStore } from '@/store/useGlobalStore';
import { PoolStake, Pool } from '@/types';
import { stakingService } from '@/lib/services';
import { useAccount } from 'wagmi';

export function usePoolStaking() {
  const { poolStakes, setPoolStakes, pools, setPools, loading, setLoading } = useGlobalStore();
  const { address } = useAccount();

  const stakeOnPool = async (
    poolId: string,
    position: 'agree' | 'disagree',
    amount: number,
    newsId?: string
  ): Promise<PoolStake | null> => {
    // FIXED: Define rollback variables in function scope (outside try-catch)
    let optimisticPoolUpdate: { oldPool: Pool; newPool: Pool } | null = null;
    let optimisticStakeUpdate: PoolStake[] | null = null;

    try {
      setLoading('stakes', true);

      // Validate amount with minimum stake ($10 from contract)
      if (amount < 10) {
        throw new Error('Minimum stake is $10 USDC');
      }

      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Use stakingService which handles both contract and mock data
      const newStake = await stakingService.stake({
        newsId: newsId || '',
        poolId,
        position,
        amount,
        userAddress: address as `0x${string}`
      }, newsId);

      // FIXED: Implement optimistic updates with rollback
      const poolIndex = pools.findIndex(p => p.id === poolId);

      if (poolIndex !== -1) {
        // Store original state for potential rollback
        const originalPool = pools[poolIndex];
        const originalStakes = [...poolStakes];

        // DETECT AND FIX CREATOR STAKE BUG FOR EXISTING POOLS
        const pool = originalPool;

        // FIXED: Check for legacy creator stake bug (only affects old contracts)
        // OLD BUG: Creator stake was put in agreeStakes regardless of pool position
        // NEW CONTRACTS: Creator stake follows pool position correctly
        // This detection handles backward compatibility with old pools
        const hasCreatorStakeBug = pool.position === 'NO' && pool.agreeStakes > 0 && pool.disagreeStakes === 0;

        let workingPool = pool;

        if (hasCreatorStakeBug) {
          console.log('[usePoolStaking] 🐛 DETECTED CREATOR STAKE BUG IN NO POOL!');
          console.log('[usePoolStaking] Pool position:', pool.position, 'but all stakes in agreeStakes');
          console.log('[usePoolStaking] Pool stakes - agreeStakes:', pool.agreeStakes, 'disagreeStakes:', pool.disagreeStakes);

          // Fix: Move creator stake from agreeStakes to disagreeStakes for NO pools
          const creatorStakeAmount = pool.agreeStakes;

          workingPool = {
            ...pool,
            agreeStakes: 0,  // Remove incorrectly placed creator stake
            disagreeStakes: creatorStakeAmount  // Put creator stake where it belongs
          };

          console.log('[usePoolStaking] 🔧 FIXED: Moved', creatorStakeAmount, 'from agreeStakes to disagreeStakes');
          console.log('[usePoolStaking] Corrected pool - agreeStakes:', workingPool.agreeStakes, 'disagreeStakes:', workingPool.disagreeStakes);
        } else {
          console.log('[usePoolStaking] ✅ Pool has correct stake distribution');
        }

        // FIXED: Initialize variables before use
        let agreeStakesIncrease = 0;
        let disagreeStakesIncrease = 0;

        // Contract logic: agreeStakes = users who agree with pool creator's position
        // disagreeStakes = users who disagree with pool creator's position
        // Use workingPool (corrected if bug detected) for calculations

        if (position === 'agree') {
          // User agrees with pool creator's position
          if (workingPool.position === 'YES') {
            agreeStakesIncrease = amount; // Pool says YES, user agrees → agreeStakes increase
          } else {
            disagreeStakesIncrease = amount; // Pool says NO, user agrees → disagreeStakes increase
          }
        } else {
          // User disagrees with pool creator's position
          if (workingPool.position === 'YES') {
            disagreeStakesIncrease = amount; // Pool says YES, user disagrees → disagreeStakes increase
          } else {
            agreeStakesIncrease = amount; // Pool says NO, user disagrees → agreeStakes increase
          }
        }

        const updatedPool = {
          ...workingPool,
          agreeStakes: workingPool.agreeStakes + agreeStakesIncrease,
          disagreeStakes: workingPool.disagreeStakes + disagreeStakesIncrease,
          totalStaked: workingPool.totalStaked + amount
        };

        console.log('[usePoolStaking] 🎯 FIXED OPTIMISTIC UPDATE:', {
          poolId,
          poolPosition: workingPool.position,
          userChoice: position,
          amount,
          bugDetected: hasCreatorStakeBug,
          oldAgree: pool.agreeStakes,
          oldDisagree: pool.disagreeStakes,
          correctedAgree: workingPool.agreeStakes,
          correctedDisagree: workingPool.disagreeStakes,
          newAgree: updatedPool.agreeStakes,
          newDisagree: updatedPool.disagreeStakes,
          agreeIncrease: agreeStakesIncrease,
          disagreeIncrease: disagreeStakesIncrease,
          calculation: `Pool ${workingPool.position} + User ${position} = ${workingPool.position === 'YES' ? 'YES' : 'NO'}+${agreeStakesIncrease}, ${workingPool.position === 'YES' ? 'NO' : 'YES'}+${disagreeStakesIncrease}`,
          expectedBehavior: workingPool.position === 'YES' ?
            (position === 'agree' ? 'User agrees with YES pool → goes to GREEN' : 'User disagrees with YES pool → goes to RED') :
            (position === 'agree' ? 'User agrees with NO pool → goes to RED' : 'User disagrees with NO pool → goes to GREEN')
        });

        // Store optimistic update data for rollback
        optimisticPoolUpdate = { oldPool: originalPool, newPool: updatedPool };
        optimisticStakeUpdate = [...originalStakes, newStake];

        // Apply optimistic updates immediately
        const newPools = [...pools];

        // IMPORTANT: If we detected and fixed a creator stake bug, update the pool store immediately
        if (hasCreatorStakeBug) {
          console.log('[usePoolStaking] 📢 UPDATING POOL STORE: Fixing creator stake bug permanently');
          // First update the pool to fix the bug, then apply the new stake
          newPools[poolIndex] = updatedPool;
        } else {
          newPools[poolIndex] = updatedPool;
        }

        setPools(newPools);
        setPoolStakes(optimisticStakeUpdate);
      } else {
        console.warn('[usePoolStaking] Pool not found for ID:', poolId);
      }

      // FIXED: Refresh pool data from contract after successful stake
      try {
        console.log('[usePoolStaking] 🔄 Refreshing pool data from contract after successful stake');

        const { poolService } = await import('@/lib/services');

        // Extract newsId from poolId format (newsId-poolId)
        let resolvedNewsId = newsId;
        if (!resolvedNewsId && pools[poolIndex]?.newsId) {
          resolvedNewsId = pools[poolIndex].newsId;
        }

        if (resolvedNewsId && poolId) {
          const freshStats = await poolService.refreshPoolStats(resolvedNewsId, poolId);

          if (freshStats) {
            console.log('[usePoolStaking] ✅ Pool stats refreshed from contract:', freshStats);

            // Update pool in global store with fresh data
            const updatedPools = [...pools];
            const currentPool = updatedPools[poolIndex];

            if (currentPool) {
              const refreshedPool = {
                ...currentPool,
                agreeStakes: freshStats.agreeStakes,
                disagreeStakes: freshStats.disagreeStakes,
                totalStaked: freshStats.totalStaked
              };

              updatedPools[poolIndex] = refreshedPool;
              setPools(updatedPools);

              console.log('[usePoolStaking] 📊 Pool updated in global store:', {
                poolId,
                agreeStakes: freshStats.agreeStakes,
                disagreeStakes: freshStats.disagreeStakes,
                totalStaked: freshStats.totalStaked
              });
            }
          } else {
            console.warn('[usePoolStaking] ⚠️ Failed to refresh pool stats from contract, using optimistic update');
          }
        }
      } catch (refreshError) {
        console.warn('[usePoolStaking] ⚠️ Pool refresh failed, but stake succeeded:', refreshError);
      }

      // FIXED: Refresh user stakes from contract after successful stake
      try {
        console.log('[usePoolStaking] 🔄 Refreshing user stakes from contract after successful stake');

        if (address) {
          const { stakingService } = await import('@/lib/services');
          const freshUserStakes = await stakingService.refreshUserStakes(address);

          if (freshUserStakes.length > 0) {
            console.log('[usePoolStaking] ✅ User stakes refreshed from contract:', {
              userAddress: address,
              totalStakes: freshUserStakes.length,
              totalAmount: freshUserStakes.reduce((sum, stake) => sum + stake.amount, 0)
            });

            // Update user stakes in global store
            setPoolStakes(freshUserStakes);
          } else {
            console.warn('[usePoolStaking] ⚠️ No user stakes returned from contract');
          }
        }
      } catch (stakeRefreshError) {
        console.warn('[usePoolStaking] ⚠️ User stakes refresh failed, but stake succeeded:', stakeRefreshError);
      }

      console.log('Stake successful:', newStake);
      return newStake;
    } catch (err) {
      // FIXED: Rollback optimistic updates on error
      if (optimisticPoolUpdate && optimisticStakeUpdate) {
        console.log('[usePoolStaking] 🔄 ROLLING BACK optimistic updates due to error:', err instanceof Error ? err.message : 'Failed to stake');

        // Rollback pool state
        const newPools = [...pools];
        const poolIndex = newPools.findIndex(p => p.id === poolId);
        if (poolIndex !== -1) {
          newPools[poolIndex] = optimisticPoolUpdate.oldPool;
          setPools(newPools);
        }

        // Rollback user stakes
        setPoolStakes(poolStakes); // Restore original state
      }

      console.error('Failed to stake:', err instanceof Error ? err.message : 'Failed to stake');
      console.error('Error staking:', err);
      return null;
    } finally {
      setLoading('stakes', false);
    }
  };

  const getUserStakes = (poolId?: string): PoolStake[] => {
    if (poolId) {
      return poolStakes.filter(stake => stake.poolId === poolId);
    }
    return poolStakes;
  };

  const getUserTotalStaked = (): number => {
    return poolStakes.reduce((sum, stake) => sum + stake.amount, 0);
  };

  const calculatePotentialReward = (
    pool: Pool,
    stakeAmount: number,
    position: 'agree' | 'disagree'
  ): { minReward: number; maxReward: number; breakEven: number } => {
    const { agreeStakes, disagreeStakes, totalStaked, creatorStake } = pool;

    // Total pool after user stake
    const newTotalPool = totalStaked + stakeAmount;
    const platformFee = newTotalPool * 0.02; // 2% protocol fee

    // FIXED: Smart contract implements 20/80 SPLIT with auto-distribute
    // - Creator gets 20% of remaining pool (after 2% fee) IF pool correct
    // - Winning stakers get 80% of remaining pool
    // - Creator stake is EXCLUDED from winning staker pool (no double-dipping)
    // - Rewards are auto-distributed on resolution (no manual claim)

    // NEW 20/80 SPLIT LOGIC
    const remaining = newTotalPool - platformFee; // 98% remaining after platform fee
    // const creatorReward = remaining * 0.20; // 20% to creator (only if pool correct)
    const stakersPool = remaining * 0.80;   // 80% to stakers

    // Determine winning pool based on position
    // CRITICAL FIX: EXCLUDE creator stake from winning pool calculation
    let winningPoolTotal: number;
    let userPotentialReward: number;

    if (position === 'agree') {
      // User agrees with pool creator's position
      // If pool is CORRECT:
      // - Creator gets 20% (creatorReward)
      // - Agree stakers get 80%, BUT creator stake is excluded from distribution
      const newAgreeTotal = agreeStakes + stakeAmount;
      const agreePoolExcludingCreator = newAgreeTotal - creatorStake;

      winningPoolTotal = agreePoolExcludingCreator;

      // User's proportional share of 80% stakers pool
      const userShare = winningPoolTotal > 0 ? stakeAmount / winningPoolTotal : 0;
      userPotentialReward = stakersPool * userShare;
    } else {
      // User disagrees with pool creator's position
      // If pool is WRONG:
      // - Creator gets 0%
      // - Disagree stakers get 98% (all remaining after platform fee)
      const newDisagreeTotal = disagreeStakes + stakeAmount;

      winningPoolTotal = newDisagreeTotal;

      // User's proportional share of full remaining pool (98%)
      const userShare = winningPoolTotal > 0 ? stakeAmount / winningPoolTotal : 0;
      userPotentialReward = remaining * userShare; // Full 98% pool for disagree winners
    }

    // Calculate both scenarios
    const maxReward = userPotentialReward; // If user's position wins
    const minReward = 0; // If user's position loses (loses entire stake)

    return {
      minReward,
      maxReward,
      breakEven: stakeAmount
    };
  };

  const getStakesByPool = (poolId: string): PoolStake[] => {
    return poolStakes.filter(stake => stake.poolId === poolId);
  };

  const getStakeStats = (poolId: string) => {
    const stakes = getStakesByPool(poolId);
    const agreeStakes = stakes.filter(s => s.position === 'agree');
    const disagreeStakes = stakes.filter(s => s.position === 'disagree');

    return {
      totalStakers: stakes.length,
      agreeStakers: agreeStakes.length,
      disagreeStakers: disagreeStakes.length,
      totalStaked: stakes.reduce((sum, s) => sum + s.amount, 0),
      agreeTotal: agreeStakes.reduce((sum, s) => sum + s.amount, 0),
      disagreeTotal: disagreeStakes.reduce((sum, s) => sum + s.amount, 0)
    };
  };

  return {
    poolStakes,
    loading: loading.stakes,
    stakeOnPool,
    getUserStakes,
    getUserTotalStaked,
    calculatePotentialReward,
    getStakesByPool,
    getStakeStats
  };
}
