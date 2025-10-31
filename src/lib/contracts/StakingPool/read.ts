/**
 * STAKING POOL CONTRACT - READ FUNCTIONS
 *
 * All read-only contract calls for StakingPool.sol
 */

import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { PoolStakeStatsContractData } from '../types';
import type { Address } from '@/types/contracts';
import { formatUSDC } from '../utils';

/**
 * Get pool stake statistics
 */
export async function getPoolStakeStats(
  newsId: string,
  poolId: string
): Promise<{
  totalStaked: number;
  agreeStakes: number;
  disagreeStakes: number;
  stakerCount: number;
} | null> {
  try {
    const data = await readContract(wagmiConfig, {
      address: contracts.stakingPool.address,
      abi: contracts.stakingPool.abi,
      functionName: 'getPoolStakeStats',
      args: [BigInt(newsId), BigInt(poolId)],
    }) as PoolStakeStatsContractData;

    return {
      totalStaked: Number(formatUSDC(data.total)),
      agreeStakes: Number(formatUSDC(data.agree)),
      disagreeStakes: Number(formatUSDC(data.disagree)),
      stakerCount: Number(data.stakerCount),
    };
  } catch (error) {
    console.error('[StakingPool/read] getPoolStakeStats failed:', error);
    return null;
  }
}

/**
 * Get user stake history
 * Returns all stakes made by a user across all pools
 */
export async function getUserStakeHistory(userAddress: Address): Promise<Array<{
  newsId: string;
  poolId: string;
  amount: number;
  position: boolean;
  timestamp: Date;
}>> {
  try {
    console.log('[StakingPool/read] Fetching stake history for:', userAddress);

    const data = await readContract(wagmiConfig, {
      address: contracts.stakingPool.address,
      abi: contracts.stakingPool.abi,
      functionName: 'getUserStakeHistory',
      args: [userAddress],
    }) as Array<{
      newsId: bigint;
      poolId: bigint;
      amount: bigint;
      position: boolean;
      timestamp: bigint;
    }>;

    const stakes = data.map(record => ({
      newsId: record.newsId.toString(),
      poolId: record.poolId.toString(),
      amount: Number(formatUSDC(record.amount)),
      position: record.position,
      timestamp: new Date(Number(record.timestamp) * 1000)
    }));

    console.log('[StakingPool/read] Found', stakes.length, 'stakes for user');
    return stakes;
  } catch (error) {
    console.error('[StakingPool/read] getUserStakeHistory failed:', error);
    return [];
  }
}
