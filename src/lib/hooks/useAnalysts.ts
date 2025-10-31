import { useState, useEffect, useCallback } from 'react';
import { reputationService } from '@/lib/services';
import type { ReputationData } from '@/types';

/**
 * Hook for managing analysts/leaderboard data
 *
 * Features:
 * - Fetches all analysts from contract or mock
 * - Loading and error states
 * - Refetch capability
 *
 * Usage:
 * ```tsx
 * const { analysts, loading, error, refetch } = useAnalysts();
 * ```
 */
export function useAnalysts() {
  const [analysts, setAnalysts] = useState<ReputationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await reputationService.getAllAnalysts();
      setAnalysts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analysts';
      setError(errorMessage);
      console.error('[useAnalysts] Error loading analysts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load analysts on mount
  useEffect(() => {
    fetchAnalysts();
  }, [fetchAnalysts]);

  return {
    analysts,
    loading,
    error,
    refetch: fetchAnalysts,
  };
}

/**
 * Hook for filtering and sorting analysts
 *
 * Features:
 * - Category filtering
 * - Multiple sort options (accuracy, totalPools, recent)
 * - Statistics calculation
 *
 * Usage:
 * ```tsx
 * const {
 *   filteredAnalysts,
 *   categoryFilter,
 *   setCategoryFilter,
 *   sortBy,
 *   setSortBy,
 *   stats
 * } = useFilteredAnalysts(analysts);
 * ```
 */
export function useFilteredAnalysts(
  analysts: ReputationData[],
  initialCategory: string = 'All',
  initialSort: 'accuracy' | 'totalPools' | 'recent' = 'accuracy'
) {
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'accuracy' | 'totalPools' | 'recent'>(initialSort);

  // Filter by category
  const categoryFiltered = analysts.filter(analyst => {
    if (categoryFilter === 'All') return true;
    return analyst.specialty?.includes(categoryFilter);
  });

  // Sort analysts
  const sortedAnalysts = [...categoryFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'totalPools':
        return b.totalPools - a.totalPools;
      case 'recent':
        return (
          new Date(b.lastActive || 0).getTime() -
          new Date(a.lastActive || 0).getTime()
        );
      default:
        return 0;
    }
  });

  // Calculate statistics
  const stats = {
    totalAnalysts: analysts.length,
    avgAccuracy: analysts.length > 0
      ? Math.round(analysts.reduce((sum, a) => sum + a.accuracy, 0) / analysts.length)
      : 0,
    filteredCount: sortedAnalysts.length,
  };

  return {
    filteredAnalysts: sortedAnalysts,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    stats,
  };
}
