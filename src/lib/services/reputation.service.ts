import { ReputationData } from '@/types';
import {
  getReputationData as mockGetReputationData,
  getAllAnalysts as mockGetAllAnalysts,
  getAnalystsByTier as mockGetAnalystsByTier,
  getAnalystsByCategory as mockGetAnalystsByCategory,
  sortAnalysts,
  calculateTier,
  getTierIcon,
} from '@/lib/mock-data';
import { isContractsEnabled } from '@/config/contracts';
import type { Address } from '@/types/contracts';
import {
  getUserReputation,
  handleContractError
} from '@/lib/contracts';

/**
 * REPUTATION SERVICE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR REPUTATION SMART CONTRACT ⭐
 *
 * This service abstracts data fetching for REPUTATION data.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * SMART CONTRACT INTEGRATION OPTIONS:
 *
 * Option 1: On-Chain Reputation (Soulbound NFT)
 * ```typescript
 * import { ReputationNFTABI } from '@/lib/abis/ReputationNFT.abi';
 *
 * const reputationData = await readContract({
 *   address: contracts.reputationNFT,
 *   abi: ReputationNFTABI,
 *   functionName: 'getReputation',
 *   args: [userAddress as `0x${string}`],
 * });
 * ```
 *
 * Option 2: Off-Chain Calculation (The Graph Indexer)
 * ```typescript
 * // Query The Graph subgraph
 * const response = await fetch('https://api.thegraph.com/subgraphs/...');
 * const { data } = await response.json();
 * ```
 *
 * Option 3: Hybrid (On-Chain Score, Off-Chain Details)
 * - Store reputation score on-chain
 * - Calculate breakdown/history off-chain
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class ReputationService {
  /**
   * Get reputation data for a specific user
   *
   * Contract Integration:
   * - Function: getUserReputation(address user)
   * - Returns: Reputation struct with score, tier, stats
   */
  async getByAddress(address: string): Promise<ReputationData | undefined> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetReputationData(address);
    }

    try {
      const reputation = await getUserReputation(address as Address);
      return reputation || undefined;
    } catch (error) {
      console.error('[ReputationService] Contract getByAddress failed:', error);
      return undefined;
    }
  }

  /**
   * Get all analysts (pool creators with statistics)
   *
   * Contract Integration Strategy:
   * - Fetches all news items and their pools from Forter contract
   * - Aggregates pool creators and calculates statistics
   * - Optionally enriches with ReputationNFT data if available
   *
   * Performance Notes:
   * - Makes O(n) calls where n = number of news items
   * - For production, consider using The Graph indexer for better performance
   */
  async getAllAnalysts(): Promise<ReputationData[]> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockGetAllAnalysts();
    }

    try {
      const { getNewsCount, getPoolsByNewsId } = await import('@/lib/contracts/Forter');

      const newsCount = await getNewsCount();
      if (newsCount === 0) {
        return [];
      }

      // Fetch all pools across all news
      const poolPromises = [];
      for (let i = 1; i <= newsCount; i++) {
        poolPromises.push(getPoolsByNewsId(i.toString()));
      }

      const allPoolsByNews = await Promise.all(poolPromises);

      // Aggregate pool creators and their statistics
      const creatorStats = new Map<string, {
        totalPools: number;
        correctPools: number;
        wrongPools: number;
        activePools: number;
        lastActive?: Date;
      }>();

      allPoolsByNews.forEach((pools) => {
        pools.forEach(pool => {
          const creator = pool.creatorAddress.toLowerCase();

          if (!creatorStats.has(creator)) {
            creatorStats.set(creator, {
              totalPools: 0,
              correctPools: 0,
              wrongPools: 0,
              activePools: 0,
            });
          }

          const stats = creatorStats.get(creator)!;
          stats.totalPools++;

          if (pool.status === 'resolved') {
            if (pool.outcome === 'creator_correct') {
              stats.correctPools++;
            } else if (pool.outcome === 'creator_wrong') {
              stats.wrongPools++;
            }
          } else {
            stats.activePools++;
          }

          if (pool.createdAt) {
            const poolDate = pool.createdAt;
            if (!stats.lastActive || poolDate > stats.lastActive) {
              stats.lastActive = poolDate;
            }
          }
        });
      });

      // Convert to ReputationData array
      const analysts: ReputationData[] = [];

      for (const [address, stats] of creatorStats.entries()) {
        // Try to get reputation data from contract
        let reputationData = null;
        try {
          reputationData = await getUserReputation(address as Address);
        } catch {
          // No reputation NFT yet, use calculated data
        }

        const accuracy = stats.totalPools > 0 && (stats.correctPools + stats.wrongPools) > 0
          ? Math.round((stats.correctPools / (stats.correctPools + stats.wrongPools)) * 100)
          : 0;

        analysts.push({
          address,
          accuracy,
          totalPools: stats.totalPools,
          correctPools: stats.correctPools,
          wrongPools: stats.wrongPools,
          activePools: stats.activePools,
          tier: reputationData?.tier || calculateTier(reputationData?.reputationPoints || 0, stats.totalPools),
          reputationPoints: reputationData?.reputationPoints || 0,
          categoryStats: {},
          lastActive: stats.lastActive,
          nftTokenId: undefined,
        });
      }

      return analysts;

    } catch (error) {
      console.error('[ReputationService] Failed to fetch analysts:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Get analysts by tier
   *
   * Contract Integration:
   * - Filter from getAllAnalysts() or
   * - Query subgraph with tier filter
   */
  async getByTier(tier: string): Promise<ReputationData[]> {
    // TODO: Add contract integration here

    await new Promise(resolve => setTimeout(resolve, 400));

    return mockGetAnalystsByTier(tier);
  }

  /**
   * Get analysts by category specialization
   *
   * Contract Integration:
   * - Calculate from user's pool creation history
   * - Query subgraph with category filter
   */
  async getByCategory(category: string): Promise<ReputationData[]> {
    // TODO: Add contract integration here

    await new Promise(resolve => setTimeout(resolve, 400));

    return mockGetAnalystsByCategory(category);
  }

  /**
   * Get top analysts (leaderboard)
   *
   * Contract Integration:
   * - Query subgraph: orderBy: score, orderDirection: desc, first: N
   */
  async getTopAnalysts(limit: number = 10): Promise<ReputationData[]> {
    const allAnalysts = await this.getAllAnalysts();
    const sorted = sortAnalysts(allAnalysts, 'accuracy');
    return sorted.slice(0, limit);
  }

  /**
   * Get reputation stats (global)
   *
   * Contract Integration:
   * - Can be calculated on-chain or off-chain
   * - Aggregate data from all analysts
   */
  async getGlobalStats() {
    const allAnalysts = await this.getAllAnalysts();

    if (allAnalysts.length === 0) {
      return {
        totalAnalysts: 0,
        avgScore: 0,
        avgSuccessRate: 0,
        totalPoolsCreated: 0,
        totalStaked: 0,
        tierDistribution: {
          'Legend': 0,
          'Master': 0,
          'Expert': 0,
          'Analyst': 0,
          'Novice': 0,
        },
      };
    }

    return {
      totalAnalysts: allAnalysts.length,
      avgScore: allAnalysts.reduce((sum, a) => sum + a.accuracy, 0) / allAnalysts.length,
      avgSuccessRate:
        allAnalysts.reduce((sum, a) => sum + a.accuracy, 0) / allAnalysts.length,
      totalPoolsCreated: allAnalysts.reduce((sum, a) => sum + a.totalPools, 0),
      totalStaked: 0, // ReputationData doesn't track totalStaked
      tierDistribution: {
        'Legend': allAnalysts.filter(a => a.tier === 'Legend').length,
        'Master': allAnalysts.filter(a => a.tier === 'Master').length,
        'Expert': allAnalysts.filter(a => a.tier === 'Expert').length,
        'Analyst': allAnalysts.filter(a => a.tier === 'Analyst').length,
        'Novice': allAnalysts.filter(a => a.tier === 'Novice').length,
      },
    };
  }

  /**
   * Search analysts by name or address
   *
   * Contract Integration:
   * - Query subgraph with search filter
   * - Note: Names are off-chain data (from Farcaster/Lens)
   */
  async search(query: string): Promise<ReputationData[]> {
    if (!query.trim()) return this.getAllAnalysts();

    const allAnalysts = await this.getAllAnalysts();
    const lowercaseQuery = query.toLowerCase();

    return allAnalysts.filter(analyst =>
      analyst.address.toLowerCase().includes(lowercaseQuery) ||
      (analyst.specialty && analyst.specialty.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Calculate reputation score for an address
   *
   * UPDATED: Now uses point-based system with stake multipliers
   * Contract Integration:
   * - Points = Σ (Base Points × Stake Multiplier)
   * - Base: +100 correct, -30 wrong
   * - Multipliers: 1.0x (<$100), 1.5x ($100-$499), 2.0x ($500-$999), 2.5x ($1K-$4.9K), 3.0x ($5K+)
   */
  async calculateScore(address: string): Promise<number> {
    const reputation = await this.getByAddress(address);
    if (!reputation) return 0;

    // Return reputation points from contract or mock data
    return reputation.reputationPoints || 0;
  }

  /**
   * Update reputation (called after pool resolution)
   *
   * Contract Integration (WRITE OPERATION):
   * ```typescript
   * const hash = await writeContract({
   *   address: contracts.reputationNFT,
   *   abi: ReputationNFTABI,
   *   functionName: 'updateReputation',
   *   args: [
   *     userAddress as `0x${string}`,
   *     qualityScore,
   *     wasCorrect,
   *     amountStaked,
   *   ],
   * });
   *
   * await waitForTransaction({ hash });
   * ```
   *
   * Note: This should be called by the contract itself (internal function)
   * when a pool is resolved, not directly by frontend.
   */
  async updateReputation(
    address: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _qualityScore: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _wasCorrect: boolean,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _amountStaked: number
  ): Promise<void> {
    // TODO: This should be done by smart contract internally
    // Frontend should never call this directly
    console.warn('[ReputationService] updateReputation should be called by contract, not frontend');

    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`[Mock] Updated reputation for ${address}`);
  }

  /**
   * Mint reputation NFT (Soulbound Token)
   *
   * Contract Integration:
   * ```typescript
   * const hash = await writeContract({
   *   address: contracts.reputationNFT,
   *   abi: ReputationNFTABI,
   *   functionName: 'mint',
   *   args: [userAddress as `0x${string}`],
   * });
   *
   * await waitForTransaction({ hash });
   * ```
   *
   * Note: Usually auto-minted when user creates first pool
   */
  async mintNFT(address: string): Promise<string> {
    // TODO: Add contract integration here

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockTokenId = `token-${Date.now()}`;
    console.log(`[Mock] Minted reputation NFT ${mockTokenId} for ${address}`);

    return mockTokenId;
  }

  /**
   * Get reputation tier for reputation points and total pools
   * UPDATED: Now uses point-based system with minimum pool requirements
   */
  getTier(reputationPoints: number, totalPools: number = 0): string {
    return calculateTier(reputationPoints, totalPools);
  }

  /**
   * Get tier icon emoji
   * (Pure function, no contract call needed)
   */
  getTierIcon(tier: string): string {
    return getTierIcon(tier);
  }

  /**
   * Sort analysts by various criteria
   * (Client-side sorting, or use subgraph orderBy)
   */
  async getSorted(
    sortBy: 'score' | 'successRate' | 'totalPools' | 'totalStaked' = 'score'
  ): Promise<ReputationData[]> {
    const allAnalysts = await this.getAllAnalysts();
    return sortAnalysts(allAnalysts, sortBy);
  }
}

// Export singleton instance
export const reputationService = new ReputationService();
