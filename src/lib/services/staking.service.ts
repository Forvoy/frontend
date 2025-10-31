import { PoolStake, StakeInput } from '@/types';
import {
  MOCK_POOL_STAKES,
  getStakesByUser as mockGetStakesByUser,
} from '@/lib/mock-data';
import { isContractsEnabled } from '@/config/contracts';
import {
  stakeOnPool,
  getUserStake,
  handleContractError
} from '@/lib/contracts';

/**
 * STAKING SERVICE - UPDATED FOR AUTO-DISTRIBUTE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR STAKING SMART CONTRACT ⭐
 *
 * This service abstracts data fetching and writing for STAKING operations.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * ⚠️ IMPORTANT UPDATE: Auto-distribute is now implemented!
 * - claimRewards() function is DEPRECATED (rewards auto-distributed on resolution)
 * - getClaimableRewards() now shows auto-distributed rewards history
 * - Rewards are sent directly to wallet when news is resolved
 *
 * SMART CONTRACT INTEGRATION GUIDE:
 *
 * 1. Add contract imports:
 *    ```typescript
 *    import { readContract, writeContract } from 'wagmi/actions';
 *    import { StakingManagerABI } from '@/lib/abis/StakingManager.abi';
 *    import { contracts } from '@/config/contracts';
 *    ```
 *
 * 2. Add environment toggle:
 *    ```typescript
 *    const USE_CONTRACTS = process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true';
 *    ```
 *
 * 3. Update each method to check USE_CONTRACTS:
 *    ```typescript
 *    async stake(input: StakeInput) {
 *      if (USE_CONTRACTS) {
 *        const hash = await writeContract({
 *          address: contracts.stakingManager,
 *          abi: StakingManagerABI,
 *          functionName: 'stake',
 *          args: [
 *            BigInt(input.poolId),
 *            input.position === 'agree' ? true : false,
 *            parseUnits(input.amount.toString(), 6),
 *          ],
 *        });
 *        await waitForTransaction({ hash });
 *        return this.getByPoolId(input.poolId);
 *      }
 *      return mockStake(input);
 *    }
 *    ```
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class StakingService {
  /**
   * Get all stakes (all users, all pools)
   *
   * Contract Integration:
   * - Option 1: Query events (StakeCreated, StakeWithdrawn)
   * - Option 2: Use off-chain indexer (The Graph)
   * - Option 3: Contract view function getAllStakes() (gas-intensive)
   */
  async getAll(): Promise<PoolStake[]> {
    // TODO: Add contract integration here
    // if (USE_CONTRACTS) { ... }

    // Simulate API delay for realistic testing
    await new Promise(resolve => setTimeout(resolve, 500));

    return MOCK_POOL_STAKES;
  }

  /**
   * Get stakes by POOL ID
   *
   * Contract Integration:
   * - Function: getUserStakeHistory(user) + filter by poolId
   * - Used to display "Supporters" and "Opponents" on pool detail page
   * - Gets real-time data from contract, no mock fallback
   */
  async getByPoolId(poolId: string, userAddress?: string): Promise<PoolStake[]> {
    if (!isContractsEnabled()) {
      throw new Error('Contracts are disabled. Enable contracts in environment variables.');
    }

    try {
      console.log('[StakingService] Fetching stakes for pool from contract:', { poolId, userAddress });

      if (!userAddress) {
        console.log('[StakingService] No user address provided, returning empty stakes');
        return [];
      }

      // Get user's complete stake history from contract
      const { getUserStakeHistory } = await import('@/lib/contracts/StakingPool');
      const allUserStakes = await getUserStakeHistory(userAddress as `0x${string}`);

      // Filter stakes for this specific pool
      const poolStakes = allUserStakes
        .filter(stake => stake.poolId === poolId)
        .map((record, index) => ({
          id: `stake-${userAddress}-${record.newsId}-${record.poolId}-${index}`,
          poolId: `${record.newsId}-${record.poolId}`,
          userAddress: userAddress,
          position: (record.position ? 'agree' : 'disagree') as 'agree' | 'disagree', // true = agree, false = disagree
          amount: record.amount,
          createdAt: record.timestamp,
          status: 'active' as const,
          potentialReward: 0,
          actualReward: 0
        }));

      console.log('[StakingService] ✅ Contract pool stakes loaded:', {
        poolId,
        userAddress,
        totalStakes: poolStakes.length,
        totalAmount: poolStakes.reduce((sum, stake) => sum + stake.amount, 0),
        stakes: poolStakes.map(s => ({ position: s.position, amount: s.amount }))
      });

      return poolStakes;

    } catch (error) {
      console.error('[StakingService] Contract getByPoolId failed:', error);

      // Return empty array instead of mock data to force contract data usage
      console.log('[StakingService] Returning empty stakes due to contract error - NO MOCK FALLBACK');
      return [];
    }
  }

  /**
   * Get stakes by USER ADDRESS
   *
   * Contract Integration:
   * - Function: getUserStake(newsId, poolId, user) for each pool
   * - Used for user profile page "Staking History"
   */
  async getByUser(userAddress: string): Promise<PoolStake[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockGetStakesByUser(userAddress);
    }

    try {
      console.log('[StakingService] Fetching stakes for user from contract:', userAddress);

      // Use StakingPool's getUserStakeHistory function
      const { getUserStakeHistory } = await import('@/lib/contracts/StakingPool');
      const stakeHistory = await getUserStakeHistory(userAddress as `0x${string}`);

      // Convert to PoolStake format
      const poolStakes: PoolStake[] = stakeHistory.map((record, index) => ({
        id: `stake-${userAddress}-${record.newsId}-${record.poolId}-${index}`,
        poolId: `${record.newsId}-${record.poolId}`, // Composite ID
        userAddress: userAddress,
        position: (record.position ? 'agree' : 'disagree') as 'agree' | 'disagree', // true = agree, false = disagree
        amount: record.amount,
        createdAt: record.timestamp
      }));

      console.log('[StakingService] Found', poolStakes.length, 'stakes for user from contract');
      return poolStakes;

    } catch (error) {
      console.error('[StakingService] Contract getByUser failed, falling back to mock:', error);

      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockGetStakesByUser(userAddress);
      }

      throw new Error(handleContractError(error));
    }
  }

  /**
   * Create new stake (agree or disagree with pool)
   *
   * Contract Integration:
   * - Function: stake(newsId, poolId, amount, userPosition)
   * - Requires: USDC approval first (2-step transaction)
   * - Emits: Staked event
   */
  async stake(input: StakeInput, newsId?: string): Promise<PoolStake> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newStake: PoolStake = {
        id: `stake-${Date.now()}`,
        poolId: input.poolId,
        userAddress: '0xuser...mock',
        position: input.position,
        amount: input.amount,
        createdAt: new Date(),
      };

      return newStake;
    }

    try {
      // Get newsId - either from parameter or fetch pool to get it
      let resolvedNewsId = newsId;

      if (!resolvedNewsId) {
        const { poolService } = await import('./pool.service');
        const allPools = await poolService.getAll();
        const pool = allPools.find(p => p.id === input.poolId);

        if (!pool) {
          throw new Error(`Pool not found with ID: ${input.poolId}`);
        }

        resolvedNewsId = pool.newsId;
      }

      // FIXED: Extract poolId numeric part properly
      // Pool IDs can be in formats: "5", "pool-5", "newsId-5", etc.
      // We need to extract the actual pool number (last part after hyphen or the whole string if no hyphen)
      let poolIdNumeric: string;

      if (input.poolId.includes('-')) {
        // Format: "something-5" → extract "5"
        const parts = input.poolId.split('-');
        poolIdNumeric = parts[parts.length - 1]; // Get the last part (actual pool ID)
      } else {
        // Format: "5" → use as is
        poolIdNumeric = input.poolId;
      }

      // Validate that we extracted a valid number
      if (!/^\d+$/.test(poolIdNumeric)) {
        throw new Error(`Invalid pool ID format: ${input.poolId}. Expected numeric pool ID.`);
      }

      // Validate pool exists and is active
      const { poolService } = await import('./pool.service');
      const pool = await poolService.getById(input.poolId, resolvedNewsId);

      if (!pool) {
        throw new Error(`Pool ${input.poolId} not found for news ${resolvedNewsId}`);
      }

      if (pool.status !== 'active') {
        throw new Error(`Pool ${input.poolId} is not active for staking`);
      }

      // Validate news is still active (not resolved)
      const { newsService } = await import('./news.service');
      const news = await newsService.getById(resolvedNewsId);

      if (!news) {
        throw new Error(`News ${resolvedNewsId} not found`);
      }

      if (news.status !== 'active') {
        throw new Error(`News ${resolvedNewsId} is already resolved`);
      }

      // FIXED: Check for valid existing stake with amount > 0
      const existingStake = await this.getUserStake(input.newsId, input.poolId, input.userAddress);
      console.log('[StakingService] 🔍 EXISTING STAKE CHECK:');
      console.log('  Input position:', input.position);
      console.log('  Pool position:', pool.position);
      console.log('  Existing stake:', existingStake);

      // Only consider it as "existing stake" if amount > 0
      const hasValidExistingStake = existingStake && existingStake.amount > 0;
      console.log('  Has valid existing stake:', hasValidExistingStake);

      if (hasValidExistingStake) {
        const userChoicePosition = input.position === 'agree';
        const existingPosition = existingStake.position;
        const poolPositionBool = pool.position === 'YES';

        console.log('[StakingService] 📊 VALIDATION CHECK:');
        console.log('  userChoicePosition:', userChoicePosition);
        console.log('  existingPosition:', existingPosition);
        console.log('  poolPositionBool:', poolPositionBool);

        if (userChoicePosition !== existingPosition) {
          const existingText = existingPosition ? 'agree' : 'disagree';
          console.log('[StakingService] ❌ POSITION MISMATCH - BLOCKING STAKE');
          throw new Error(`Cannot change position. You already staked "${existingText}" on this pool. You can only add more stakes to the same position.`);
        } else {
          console.log('[StakingService] ✅ POSITION MATCHES - ALLOWING STAKE');
        }
      } else {
        console.log('[StakingService] ✅ NO VALID EXISTING STAKE - ALLOWING NEW STAKE');
      }

      const poolPositionBool = pool.position === 'YES';
      const userPositionAbsolute = input.position === 'agree'
        ? poolPositionBool      // Agree: same position as pool
        : !poolPositionBool;    // Disagree: opposite position from pool

      // FIXED: Correct parameter mapping
      // userAgreesWithPool: true = agrees with pool creator, false = disagrees
      const userAgreesWithPool = userPositionAbsolute;

      // Log for debugging
      console.log('[StakingService] 🎯 FIXED Stake Mapping:', {
        poolId: {
          original: input.poolId,
          extracted: poolIdNumeric,
          extractionMethod: input.poolId.includes('-') ? 'split-last-part' : 'direct'
        },
        poolPosition: pool.position,
        poolPositionBool: poolPositionBool,
        userChoice: input.position,
        userPositionAbsolute: userPositionAbsolute,
        userPositionType: typeof userPositionAbsolute,
        amount: input.amount,
        calculation: `${input.position} → ${poolPositionBool} (pool) → ${userPositionAbsolute} → ${userAgreesWithPool} (userAgreesWithPool)`
      });

      // Call smart contract
      const result = await stakeOnPool(
        resolvedNewsId,
        poolIdNumeric,
        input.amount,
        userAgreesWithPool
      );

      if (!result.success) {
        let errorMessage = result.error || 'Staking transaction failed';

        // Handle common revert reasons with user-friendly messages
        if (result.error?.includes('Cannot change position')) {
          errorMessage = 'You already staked on this pool with a different position. You can only add more to the same position.';
        } else if (result.error?.includes('Stake below minimum')) {
          errorMessage = 'Stake amount is below the minimum required. Please check the minimum stake amount.';
        } else if (result.error?.includes('Transfer failed') || result.error?.includes('insufficient allowance')) {
          errorMessage = 'Token approval failed. Please make sure you have enough USDC and try again.';
        } else if (result.error?.includes('Invalid pool ID')) {
          errorMessage = 'Invalid pool selected. Please refresh and try again.';
        } else if (result.error?.includes('News already resolved')) {
          errorMessage = 'This news has already been resolved. Staking is no longer available.';
        } else if (result.error?.includes('User rejected') || result.error?.includes('User denied')) {
          errorMessage = 'Transaction cancelled by user';
        }

        console.error('[StakingService] ❌ Stake failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('[StakingService] ✅ Success! Tx:', result.hash);

      // Verify stake went to correct pool
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { poolService } = await import('./pool.service');
        const updatedPool = await poolService.getById(input.poolId, resolvedNewsId);

        if (updatedPool) {
          const agreeIncrease = updatedPool.agreeStakes - pool.agreeStakes;
          const disagreeIncrease = updatedPool.disagreeStakes - pool.disagreeStakes;

          // FIXED: Correct verification logic that accounts for pool position
          const poolPositionBool = pool.position === 'YES';
          const userPositionAbsolute = input.position === 'agree'
            ? poolPositionBool      // Agree: same position as pool
            : !poolPositionBool;    // Disagree: opposite position from pool

          const expectedPool = userPositionAbsolute ? 'agreeStakes' : 'disagreeStakes';
          const isCorrect = (userPositionAbsolute && agreeIncrease === input.amount) ||
                           (!userPositionAbsolute && disagreeIncrease === input.amount);

          console.log('[StakingService] 📊 FIXED Verification:', {
            poolPosition: pool.position,
            userChoice: input.position,
            userPositionAbsolute,
            expected: expectedPool,
            agreeChange: agreeIncrease > 0 ? `+$${agreeIncrease}` : '$0',
            disagreeChange: disagreeIncrease > 0 ? `+$${disagreeIncrease}` : '$0',
            status: isCorrect ? '✅ CORRECT POOL!' : '❌ WRONG POOL!'
          });
        }
      } catch (fetchError) {
        console.warn('[StakingService] Could not verify pool update:', fetchError);
      }

      // Create the stake object based on the successful transaction
      const newStake: PoolStake = {
        id: `stake-${Date.now()}`, // In real app, get from event
        poolId: input.poolId,
        userAddress: '0xConnectedWallet', // TODO: Get from connected wallet
        position: input.position,
        amount: input.amount,
        createdAt: new Date(),
      };

      return newStake;

    } catch (error) {
      console.error('[StakingService] Stake failed:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Withdraw stake and claim rewards (after pool resolution)
   *
   * Contract Integration:
   * - Function: withdraw(newsId, poolId)
   * - Transfers rewards to user wallet
   * - Only works after news is resolved
   */
  async withdraw(newsId: string, poolId: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`[Mock] Withdrew rewards for pool ${poolId}`);
      return { success: true, txHash: '0xmock...hash' };
    }

    try {
      console.log('[StakingService] Withdrawing stake and claiming rewards...', { newsId, poolId });

      // Import withdrawStake
      const { withdrawStake } = await import('@/lib/contracts');

      // Call smart contract to withdraw
      const result = await withdrawStake(newsId, poolId);

      if (!result.success) {
        throw new Error(result.error || 'Withdrawal transaction failed');
      }

      console.log('[StakingService] Withdrawal successful:', result.hash);

      return {
        success: true,
        txHash: result.hash
      };

    } catch (error) {
      console.error('[StakingService] Withdraw failed:', error);
      return {
        success: false,
        error: handleContractError(error)
      };
    }
  }

  /**
   * Emergency withdraw (before pool resolution)
   *
   * Contract Integration:
   * - Function: emergencyWithdraw(newsId, poolId)
   * - Allows withdrawal before resolution (may have penalty)
   * - Only works if news not yet resolved
   */
  async emergencyWithdraw(newsId: string, poolId: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`[Mock] Emergency withdrew from pool ${poolId}`);
      return { success: true, txHash: '0xmock...hash' };
    }

    try {
      console.log('[StakingService] Emergency withdrawing stake...', { newsId, poolId });

      // Import emergencyWithdraw
      const { emergencyWithdraw } = await import('@/lib/contracts');

      // Call smart contract to emergency withdraw
      const result = await emergencyWithdraw(newsId, poolId);

      if (!result.success) {
        throw new Error(result.error || 'Emergency withdrawal failed');
      }

      console.log('[StakingService] Emergency withdrawal successful:', result.hash);

      return {
        success: true,
        txHash: result.hash
      };

    } catch (error) {
      console.error('[StakingService] Emergency withdraw failed:', error);
      return {
        success: false,
        error: handleContractError(error)
      };
    }
  }

  /**
   * Refresh all user stakes from contract (for real-time updates)
   *
   * Contract Integration:
   * - Function: getUserStakeHistory(user) from StakingPool contract
   * - Used to refresh user's complete stake history after transactions
   */
  async refreshUserStakes(userAddress: string): Promise<PoolStake[]> {
    if (!isContractsEnabled()) {
      throw new Error('Contracts are disabled. Enable contracts in environment variables.');
    }

    try {
      console.log('[StakingService] 🔄 Refreshing all user stakes from contract:', userAddress);

      // Get user's complete stake history from contract
      const { getUserStakeHistory } = await import('@/lib/contracts/StakingPool');
      const allUserStakes = await getUserStakeHistory(userAddress as `0x${string}`);

      // Convert to PoolStake format
      const poolStakes: PoolStake[] = allUserStakes.map((record, index) => ({
        id: `stake-${userAddress}-${record.newsId}-${record.poolId}-${index}`,
        poolId: `${record.newsId}-${record.poolId}`,
        userAddress: userAddress,
        position: (record.position ? 'agree' : 'disagree') as 'agree' | 'disagree', // true = agree, false = disagree
        amount: record.amount,
        createdAt: record.timestamp,
        status: 'active' as const,
        potentialReward: 0,
        actualReward: 0
      }));

      console.log('[StakingService] ✅ Fresh user stakes loaded from contract:', {
        userAddress,
        totalStakes: poolStakes.length,
        totalAmount: poolStakes.reduce((sum, stake) => sum + stake.amount, 0)
      });

      return poolStakes;

    } catch (error) {
      console.error('[StakingService] Failed to refresh user stakes from contract:', error);
      return [];
    }
  }

  /**
   * Claim rewards (after pool resolution)
   *
   * Contract Integration:
   * ```typescript
   * const hash = await writeContract({
   *   address: contracts.stakingManager,
   *   abi: StakingManagerABI,
   *   functionName: 'claimRewards',
   *   args: [BigInt(poolId)],
   * });
   *
   * const receipt = await waitForTransaction({ hash });
   *
   * // Extract reward amount from event
   * const rewardAmount = receipt.logs[0].data; // Parse based on ABI
   *
   * return formatUnits(rewardAmount, 6); // Convert to decimal
   * ```
   *
   * Note: Contract calculates rewards based on:
   * - Pool outcome (creator correct/wrong)
   * - User's position (agree/disagree)
   * - Reward distribution algorithm
   */
  async claimRewards(
    poolId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userAddress: string
  ): Promise<number> {
    // ⚠️ DEPRECATED: Auto-distribute now implemented!
    // Rewards are automatically sent to wallet when news is resolved
    console.warn(`[Deprecated] claimRewards() called for pool ${poolId}. Rewards are now auto-distributed on resolution.`);

    // Return 0 since rewards are auto-distributed
    return 0;
  }

  /**
   * Get auto-distributed rewards history for user
   *
   * UPDATED: Since rewards are auto-distributed, this function now shows
   * historical rewards that have already been sent to user's wallet
   *
   * Contract Integration:
   * - Function: Query RewardDistributed events for user
   * - Returns: Array of auto-distributed rewards
   */
  async getClaimableRewards(poolId: string, userAddress: string): Promise<number> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock: Check if rewards were auto-distributed for this pool
      const userStakes = await this.getByUser(userAddress);
      const poolStakes = userStakes.filter(s => s.poolId === poolId);

      if (poolStakes.length === 0) return 0;

      // Simulate auto-distribute check: if pool resolved and user won, show reward
      const mockPoolResolved = Math.random() > 0.5; // 50% chance resolved
      const mockUserWon = Math.random() > 0.4; // 60% chance won

      if (mockPoolResolved && mockUserWon) {
        const totalStaked = poolStakes.reduce((sum, s) => sum + s.amount, 0);
        // NEW 20/80 split calculation: user gets proportional share of 80% pool
        const mockTotalPool = totalStaked * 3; // Assume larger pool
        const protocolFee = mockTotalPool * 0.02;
        const remaining = mockTotalPool - protocolFee;
        const stakersPool = remaining * 0.80;
        const userReward = stakersPool * 0.25; // User's proportional share

        return userReward;
      }

      return 0; // No auto-distributed rewards yet
    }

    try {
      console.log('[StakingService] Calculating claimable rewards from contract:', { poolId, userAddress });
      
      // For now, we'll use mock calculation since rewards calculation
      // requires knowing the pool resolution status and user's position
      // This would be implemented with the actual contract function
      
      console.log('[StakingService] Rewards calculation not yet implemented, using mock');
      
      // Mock calculation
      const userStakes = await this.getByUser(userAddress);
      const poolStakes = userStakes.filter(s => s.poolId === poolId);

      if (poolStakes.length === 0) return 0;

      const totalStaked = poolStakes.reduce((sum, s) => sum + s.amount, 0);
      const mockMultiplier = 1.2; // 20% profit for contract mode
      return totalStaked * mockMultiplier;

    } catch (error) {
      console.error('[StakingService] Contract getClaimableRewards failed:', error);
      return 0;
    }
  }

  /**
   * Get staking statistics
   * (Can be calculated client-side or fetched from contract)
   */
  async getStats(poolId?: string, userAddress?: string) {
    let stakes: PoolStake[];

    if (poolId && userAddress) {
      stakes = await this.getByPoolId(poolId, userAddress);
    } else if (poolId) {
      // If only poolId is provided, we can't get stakes without user address
      // Return empty array since getByPoolId now requires user address
      stakes = [];
    } else if (userAddress) {
      stakes = await this.getByUser(userAddress);
    } else {
      stakes = await this.getAll();
    }

    const agreeStakes = stakes.filter(s => s.position === 'agree');
    const disagreeStakes = stakes.filter(s => s.position === 'disagree');

    return {
      totalStakes: stakes.length,
      totalAmount: stakes.reduce((sum, s) => sum + s.amount, 0),
      agreeCount: agreeStakes.length,
      agreeAmount: agreeStakes.reduce((sum, s) => sum + s.amount, 0),
      disagreeCount: disagreeStakes.length,
      disagreeAmount: disagreeStakes.reduce((sum, s) => sum + s.amount, 0),
      uniqueStakers: new Set(stakes.map(s => s.userAddress)).size,
    };
  }

  /**
   * Get user's stake details for a specific pool
   *
   * Contract Integration:
   * - Function: getUserStake(newsId, poolId, userAddress)
   * - Returns: Detailed stake information
   */
  async getUserStakeDetails(
    newsId: string,
    poolId: string,
    userAddress: string
  ): Promise<{
    amount: number;
    position: 'agree' | 'disagree';
    timestamp: Date;
    isWithdrawn: boolean;
  } | null> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));

      const userStakes = await this.getByUser(userAddress);
      const poolStake = userStakes.find(s => s.poolId === poolId);

      if (!poolStake) return null;

      return {
        amount: poolStake.amount,
        position: poolStake.position,
        timestamp: poolStake.createdAt,
        isWithdrawn: false
      };
    }

    try {
      console.log('[StakingService] Fetching user stake details from contract...', {
        newsId,
        poolId,
        userAddress
      });

      // Import getUserStake
      const { getUserStake } = await import('@/lib/contracts');

      const stake = await getUserStake(newsId, poolId, userAddress as `0x${string}`);

      if (!stake) {
        console.log('[StakingService] No stake found for user');
        return null;
      }

      console.log('[StakingService] User stake details fetched:', stake);

      return {
        amount: stake.amount,
        position: stake.position ? 'agree' : 'disagree',
        timestamp: stake.timestamp,
        isWithdrawn: stake.isWithdrawn
      };

    } catch (error) {
      console.error('[StakingService] Get user stake details failed:', error);
      return null;
    }
  }

  /**
   * Check if user has staked on a pool
   * (Helper function for UI state)
   */
  async hasUserStaked(poolId: string, userAddress: string): Promise<boolean> {
    const userStakes = await this.getByUser(userAddress);
    return userStakes.some(s => s.poolId === poolId);
  }

  /**
   * Get user's position on a pool
   * (Helper function for UI state)
   */
  async getUserPosition(
    poolId: string,
    userAddress: string
  ): Promise<'agree' | 'disagree' | null> {
    const userStakes = await this.getByUser(userAddress);
    const poolStake = userStakes.find(s => s.poolId === poolId);
    return poolStake?.position || null;
  }

  /**
   * Get user's stake details for position validation
   */
  async getUserStake(
    newsId: string,
    poolId: string,
    userAddress: string
  ): Promise<{
    amount: number;
    position: boolean;
    timestamp: Date;
    isWithdrawn: boolean;
  } | null> {
    try {
      const data = await getUserStake(newsId, poolId, userAddress as `0x${string}`);
      return data;
    } catch (error) {
      console.error('[StakingService] getUserStake failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const stakingService = new StakingService();
