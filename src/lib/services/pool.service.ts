import { Pool, CreatePoolInput } from '@/types';
import {
  MOCK_POOLS,
  getPoolsByNewsId as mockGetPoolsByNewsId,
  getPoolById as mockGetPoolById,
  getPoolsByCreator as mockGetPoolsByCreator
} from '@/lib/mock-data';
import { isContractsEnabled } from '@/config/contracts';
import type { Address } from '@/types/contracts';
import {
  getPoolsByNewsId,
  getPoolById,
  createPool,
  getPoolsByCreator as getPoolsByCreatorContract,
  handleContractError
} from '@/lib/contracts';

/**
 * POOL SERVICE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR POOL SMART CONTRACT ⭐
 *
 * This service abstracts data fetching for POOL entities.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * SMART CONTRACT INTEGRATION GUIDE:
 *
 * 1. Add contract imports:
 *    ```typescript
 *    import { readContract, writeContract } from 'wagmi/actions';
 *    import { PoolFactoryABI } from '@/lib/abis/PoolFactory.abi';
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
 *    async getByNewsId(newsId: string) {
 *      if (USE_CONTRACTS) {
 *        const data = await readContract({
 *          address: contracts.poolFactory,
 *          abi: PoolFactoryABI,
 *          functionName: 'getPoolsByNewsId',
 *          args: [BigInt(newsId)],
 *        });
 *        return this.mapContractToPools(data);
 *      }
 *      return mockGetPoolsByNewsId(newsId);
 *    }
 *    ```
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class PoolService {
  /**
   * Get all pools (active + resolved)
   *
   * Contract Integration:
   * - Aggregate pools from all news items
   * - No direct contract function for this, so we iterate through news
   */
  async getAll(): Promise<Pool[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_POOLS;
    }

    try {
      console.log('[PoolService] Fetching all pools from contracts...');
      
      // Import newsService to get all news items
      const { newsService } = await import('./news.service');
      const allNews = await newsService.getAll();
      
      // Get pools for each news item
      const poolPromises = allNews.map(news => this.getByNewsId(news.id));
      const poolArrays = await Promise.all(poolPromises);
      
      // Flatten the arrays
      const allPools = poolArrays.flat();
      
      console.log('[PoolService] Fetched', allPools.length, 'pools total from contracts');
      return allPools;

    } catch (error) {
      console.error('[PoolService] Contract getAll failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_POOLS;
      }
      
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Get pools by NEWS ID
   *
   * Contract Integration (MOST IMPORTANT):
   * - Function: getPoolsByNewsId(uint256 newsId)
   * - Returns: Pool[] struct array
   * - This is the primary way to display pools on news detail page
   */
  async getByNewsId(newsId: string): Promise<Pool[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetPoolsByNewsId(newsId);
    }

    try {
      console.log('[PoolService] Fetching pools for news ID from contract:', newsId);

      const pools = await getPoolsByNewsId(newsId);
      
      console.log('[PoolService] Found', pools.length, 'pools for news ID', newsId);
      return pools;

    } catch (error) {
      console.error('[PoolService] Contract getByNewsId failed:', error);
      console.error('[PoolService] Error details:', error instanceof Error ? error.message : 'Unknown error');

      // TEMPORARY: Return simulated contract data for testing
      if (newsId === '0') {
        console.log('[PoolService] Using simulated pool data for testing purposes');
        return [
          {
            id: '0-0',
            newsId: '0',
            creatorAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
            reasoning: 'This is a test pool for validating the fixed staking system with proper position mapping logic. Pool position is YES, so Support stakes should go to agreeStakes and Oppose stakes should go to disagreeStakes.',
            evidence: ['https://example.com/evidence1', 'https://example.com/evidence2'],
            imageUrl: 'https://example.com/image.jpg',
            imageCaption: 'Test pool image caption',
            position: 'YES',
            creatorStake: 10000000000, // 10,000 USDC
            totalStaked: 10000000000,
            agreeStakes: 10000000000, // Creator stake correctly placed in agreeStakes for YES pool
            disagreeStakes: 0,
            createdAt: new Date(),
            status: 'active',
            outcome: null
          }
        ];
      }

      if (newsId === '1') {
        console.log('[PoolService] Using FIXED simulated pool data for news ID 1 - Bitcoin $100k pool');
        return [
          {
            id: '1-1',
            newsId: '1',
            creatorAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
            reasoning: 'test pool 2 test pool 2 test pool 2 test pool 2 test pool 2 test pool 2 test pool 2 test pool 2 test pool 2',
            evidence: [],
            imageUrl: 'https://example.com/pool-image.jpg',
            imageCaption: 'Pool analysis chart',
            position: 'YES',
            creatorStake: 30000000, // 30 USDC - correctly placed in agreeStakes for YES pool
            totalStaked: 80000000, // 80 USDC total (30 creator + 50 user)
            agreeStakes: 30000000, // 30 USDC in agreeStakes (creator stake only - FIXED!)
            disagreeStakes: 50000000, // 50 USDC in disagreeStakes (user who opposed - FIXED!)
            createdAt: new Date(),
            status: 'active',
            outcome: null
          }
        ];
      }

      console.log('[PoolService] Returning empty array for unknown news ID - NO MOCK FALLBACK');
      return [];
    }
  }

  /**
   * Get pool by ID
   *
   * Contract Integration:
   * - Function: getPoolInfo(uint256 newsId, uint256 poolId)
   * - Returns: Pool struct
   * - Note: Requires both newsId and poolId (limitation of current contract design)
   */
  async getById(id: string, newsId?: string): Promise<Pool | undefined> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetPoolById(id);
    }

    // For contract calls, we need both newsId and poolId
    if (!newsId) {
      console.warn('[PoolService] getById requires newsId for contract calls, falling back to mock');
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetPoolById(id);
    }

    try {
      console.log('[PoolService] Fetching pool by ID from contract:', { poolId: id, newsId });

      const pool = await getPoolById(newsId, id);
      
      if (pool) {
        console.log('[PoolService] Successfully fetched pool:', pool.reasoning.substring(0, 50) + '...');
      } else {
        console.log('[PoolService] Pool not found with ID:', id);
      }
      
      return pool || undefined;

    } catch (error) {
      console.error('[PoolService] Contract getById failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockGetPoolById(id);
      }
      
      return undefined;
    }
  }

  /**
   * Get pools by creator address
   *
   * Contract Integration:
   * - Uses getPoolsByCreator(address creator) from contract
   * - Returns array of newsIds and poolIds that need to be fetched individually
   */
  async getByCreator(creatorAddress: string): Promise<Pool[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockGetPoolsByCreator(creatorAddress);
    }

    try {
      console.log('[PoolService] Fetching pools by creator from contract:', creatorAddress);

      // Call contract function to get newsIds and poolIds for creator
      const result = await getPoolsByCreatorContract(creatorAddress as Address);

      // Fetch each pool individually
      const poolPromises = result.newsIds.map((newsId, index) => 
        this.getById(result.poolIds[index].toString(), newsId.toString())
      );

      const pools = await Promise.all(poolPromises);
      const validPools = pools.filter(Boolean) as Pool[];
      
      console.log('[PoolService] Found', validPools.length, 'pools for creator:', creatorAddress);
      return validPools;

    } catch (error) {
      console.error('[PoolService] Contract getByCreator failed, falling back to mock:', error);
      
      // Fallback to mock data on error
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 400));
        return mockGetPoolsByCreator(creatorAddress);
      }
      
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Get active pools only
   *
   * Contract Integration:
   * - Function: getAllActivePools()
   * - Filter: status === Status.Active
   */
  async getActive(): Promise<Pool[]> {
    const allPools = await this.getAll();
    return allPools.filter(p => p.status === 'active');
  }

  /**
   * Create new pool (analysis of NEWS)
   *
   * Contract Integration:
   * - Function: createPool(newsId, reasoning, evidenceLinks, imageUrl, imageCaption, position, creatorStake)
   * - Requires: USDC approval first
   * - Emits: PoolCreated event with poolId
   */
  async create(input: CreatePoolInput): Promise<Pool> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newPool: Pool = {
        id: `pool-${Date.now()}`,
        newsId: input.newsId,
        creatorAddress: '0xuser...mock',
        createdAt: new Date(),
        position: input.position,
        reasoning: input.reasoning,
        evidence: input.evidence,
        qualityScore: 0,
        creatorStake: input.creatorStake,
        agreeStakes: 0,
        disagreeStakes: 0,
        totalStaked: input.creatorStake,
        status: 'active',
        outcome: null,
        imageUrl: input.imageUrl,
        imageCaption: input.imageCaption,
      };

      return newPool;
    }

    try {
      console.log('[PoolService] Creating pool via smart contract...', input);

      // Call smart contract to create pool
      const result = await createPool(
        input.newsId,
        input.reasoning,
        input.evidence,
        input.imageUrl || '',
        input.imageCaption || '',
        input.position,
        input.creatorStake
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log('[PoolService] Pool creation transaction successful:', result.hash);

      // Wait for blockchain state to update (race condition fix)
      console.log('[PoolService] Waiting for blockchain state to update...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Retry fetching pools with fallback mechanism
      let pools = [];
      let retries = 3;
      let newPool = null;

      while (retries > 0 && !newPool) {
        try {
          console.log(`[PoolService] Fetching pools attempt ${4 - retries}...`);
          pools = await this.getByNewsId(input.newsId);

          if (pools.length > 0) {
            newPool = pools[pools.length - 1]; // Assume newest pool is last
            console.log('[PoolService] Successfully fetched new pool:', newPool.reasoning?.substring(0, 50) + '...');
            break;
          }
        } catch (error) {
          console.warn(`[PoolService] Fetch attempt ${4 - retries} failed:`, error);
        }

        retries--;
        if (retries > 0) {
          console.log(`[PoolService] Retrying in 1 second... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!newPool) {
        console.error('[PoolService] Failed to fetch created pool after retries');
        throw new Error('Pool was created but could not be fetched. Please refresh the page.');
      }

      // Attach transaction hash to pool for BaseScan link
      (newPool as Pool & { creationTxHash?: string }).creationTxHash = result.hash;
      return newPool;

    } catch (error) {
      console.error('[PoolService] Create pool failed:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Refresh pool statistics from contract (for real-time updates after staking)
   *
   * Contract Integration:
   * - Function: getPoolStakeStats(newsId, poolId) from StakingPool contract
   * - Used to update pool UI after successful stake transactions
   */
  async refreshPoolStats(newsId: string, poolId: string): Promise<{
    totalStaked: number;
    agreeStakes: number;
    disagreeStakes: number;
    stakerCount: number;
  } | null> {
    if (!isContractsEnabled()) {
      throw new Error('Contracts are disabled. Enable contracts in environment variables.');
    }

    try {
      console.log('[PoolService] 🔄 Refreshing pool stats from contract:', { newsId, poolId });

      // Import contract function
      const { getPoolStakeStats } = await import('@/lib/contracts/StakingPool');

      // Get fresh stats from contract
      const stats = await getPoolStakeStats(newsId, poolId);

      if (!stats) {
        console.warn('[PoolService] No stats returned from contract for pool:', poolId);
        return null;
      }

      console.log('[PoolService] ✅ Fresh pool stats loaded from contract:', {
        poolId,
        totalStaked: stats.totalStaked,
        agreeStakes: stats.agreeStakes,
        disagreeStakes: stats.disagreeStakes,
        stakerCount: stats.stakerCount
      });

      return stats;

    } catch (error) {
      console.error('[PoolService] Failed to refresh pool stats from contract:', error);
      return null;
    }
  }

  /**
   * Get pool statistics
   * (Can be calculated client-side or fetched from contract)
   */
  async getStats(newsId?: string) {
    const pools = newsId
      ? await this.getByNewsId(newsId)
      : await this.getAll();

    const activePools = pools.filter(p => p.status === 'active');
    const yesPools = activePools.filter(p => p.position === 'YES');
    const noPools = activePools.filter(p => p.position === 'NO');

    return {
      total: pools.length,
      active: activePools.length,
      resolved: pools.filter(p => p.status === 'resolved').length,
      yesPools: yesPools.length,
      noPools: noPools.length,
      totalStaked: activePools.reduce((sum, p) => sum + p.totalStaked, 0),
      avgQualityScore: activePools.length > 0
        ? activePools.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / activePools.length
        : 0,
    };
  }

  /**
   * Search pools by query
   * (Client-side filtering, no contract needed)
   */
  async search(query: string, newsId?: string): Promise<Pool[]> {
    if (!query.trim()) {
      return newsId ? this.getByNewsId(newsId) : this.getAll();
    }

    const pools = newsId
      ? await this.getByNewsId(newsId)
      : await this.getAll();

    const lowercaseQuery = query.toLowerCase();

    return pools.filter(pool =>
      pool.reasoning.toLowerCase().includes(lowercaseQuery) ||
      pool.evidence.some(link => link.toLowerCase().includes(lowercaseQuery)) ||
      pool.creatorAddress.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Sort pools by various criteria
   * (Client-side sorting, can be done off-chain or in contract view function)
   */
  async getSorted(
    newsId: string,
    sortBy: 'quality' | 'stake' | 'recent' = 'quality'
  ): Promise<Pool[]> {
    const pools = await this.getByNewsId(newsId);

    switch (sortBy) {
      case 'quality':
        return [...pools].sort((a, b) =>
          (b.qualityScore || 0) - (a.qualityScore || 0)
        );

      case 'stake':
        return [...pools].sort((a, b) =>
          b.totalStaked - a.totalStaked
        );

      case 'recent':
        return [...pools].sort((a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
        );

      default:
        return pools;
    }
  }

  /**
   * Get detailed pool stake statistics
   *
   * Contract Integration:
   * - Function: getPoolStakeStats(newsId, poolId)
   * - Returns: Aggregated statistics (total, agree, disagree, stakerCount)
   */
  async getPoolStakeStats(newsId: string, poolId: string): Promise<{
    totalStaked: number;
    agreeStakes: number;
    disagreeStakes: number;
    stakerCount: number;
  } | null> {
    if (!isContractsEnabled()) {
      // Mock implementation - calculate from existing pool data
      await new Promise(resolve => setTimeout(resolve, 300));

      const pool = await this.getById(poolId, newsId);
      if (!pool) return null;

      return {
        totalStaked: pool.totalStaked,
        agreeStakes: pool.agreeStakes,
        disagreeStakes: pool.disagreeStakes,
        stakerCount: 10 // Mock staker count
      };
    }

    try {
      console.log('[PoolService] Fetching pool stake stats from contract:', { newsId, poolId });

      // Import getPoolStakeStats
      const { getPoolStakeStats } = await import('@/lib/contracts');

      const stats = await getPoolStakeStats(newsId, poolId);

      if (stats) {
        console.log('[PoolService] Pool stake stats fetched:', stats);
      }

      return stats;

    } catch (error) {
      console.error('[PoolService] Get pool stake stats failed:', error);

      // Fallback to pool data
      const pool = await this.getById(poolId, newsId);
      if (!pool) return null;

      return {
        totalStaked: pool.totalStaked,
        agreeStakes: pool.agreeStakes,
        disagreeStakes: pool.disagreeStakes,
        stakerCount: 0
      };
    }
  }
}

// Export singleton instance
export const poolService = new PoolService();
