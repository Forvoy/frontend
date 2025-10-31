import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { Pool, CreatePoolInput } from '@/types';
import { getPoolStats } from '@/lib/mock-data';
import { config } from '@/config/contracts';
import { poolService } from '@/lib/services/pool.service';

export function usePools(newsId?: string) {
  const { pools, setPools, loading, setLoading } = useGlobalStore();
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async (targetNewsId?: string) => {
    try {
      setLoading('pools', true);
      setError(null);

      const effectiveNewsId = targetNewsId || newsId;
      
      // Use poolService which handles both contract and mock data
      const poolsData = effectiveNewsId
        ? await poolService.getByNewsId(effectiveNewsId)
        : await poolService.getAll();

      setPools(poolsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
      console.error('Error fetching pools:', err);
    } finally {
      setLoading('pools', false);
    }
  }, [newsId, setLoading, setPools]);

  const getPool = useCallback(async (id: string, newsId?: string): Promise<Pool | undefined> => {
    return poolService.getById(id, newsId);
  }, []);

  const getPoolsByNews = useCallback(async (targetNewsId: string): Promise<Pool[]> => {
    return poolService.getByNewsId(targetNewsId);
  }, []);

  const filterPoolsByPosition = (position: 'YES' | 'NO'): Pool[] => {
    return pools.filter(pool => pool.position === position);
  };

  const sortPools = (
    poolsToSort: Pool[],
    sortBy: 'totalStaked' | 'agreeStakes' | 'createdAt'
  ): Pool[] => {
    return [...poolsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'agreeStakes':
          return b.agreeStakes - a.agreeStakes;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const createPool = async (input: CreatePoolInput): Promise<Pool | null> => {
    try {
      setLoading('pools', true);
      setError(null);

      // Validate minimum stake amount
      if (input.creatorStake < config.MIN_STAKE_AMOUNT) {
        throw new Error(`Minimum stake is $${config.MIN_STAKE_AMOUNT} USDC`);
      }

      // Use poolService.create() which handles both mock and contract integration
      const newPool = await poolService.create(input);

      // Auto-post to Farcaster
      console.log('Creating pool and posting to Farcaster:', {
        poolId: newPool.id,
        text: `Just created a pool on @forter!\n\nPosition: ${newPool.position}\n\nStake & discuss: forter.app/news/${input.newsId}`,
        embeds: input.imageUrl ? [input.imageUrl] : []
      });

      // Update local state with new pool
      setPools([newPool, ...pools]);

      return newPool;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pool');
      console.error('Error creating pool:', err);
      return null;
    } finally {
      setLoading('pools', false);
    }
  };

  const getPoolStatistics = (poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return null;

    return getPoolStats(pool);
  };

  // Auto-fetch pools when newsId is provided
  useEffect(() => {
    if (newsId) {
      fetchPools(newsId);
    }
  }, [newsId, fetchPools]);

  return {
    pools,
    loading: loading.pools,
    error,
    fetchPools,
    getPool,
    getPoolsByNews,
    filterPoolsByPosition,
    sortPools,
    createPool,
    getPoolStatistics,
    refetch: fetchPools
  };
}

// Hook for filtered pools by position
export function useFilteredPools(
  newsId: string,
  positionFilter: 'all' | 'YES' | 'NO' = 'all'
) {
  const { pools } = usePools(newsId);

  // Use useMemo to prevent unnecessary re-calculations
  const filteredPools = useMemo(() => {
    return positionFilter === 'all'
      ? pools
      : pools.filter(pool => pool.position === positionFilter);
  }, [pools, positionFilter]);

  return filteredPools;
}
