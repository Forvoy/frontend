/**
 * Quality Scoring Utilities
 *
 * Implements the quality control strategy defined in README.
 * Scores are calculated client-side for MVP, will move to backend later.
 */

import { News, Pool, ReputationData } from '@/types';

// ============================================
// POOL QUALITY SCORING
// ============================================

/**
 * Calculate quality score for a pool (0-100)
 *
 * Scoring breakdown:
 * - Reasoning quality: 0-40 pts (length and depth)
 * - Evidence links: 0-20 pts (up to 4 links)
 * - Visual evidence: 0-15 pts (has image)
 * - Creator reputation: 0-25 pts (based on accuracy)
 */
export function calculatePoolQualityScore(
  pool: Pool,
  creatorReputation?: ReputationData
): number {
  let score = 0;

  // 1. Reasoning quality (0-40 points)
  // More detailed reasoning = higher score
  const reasoningLength = pool.reasoning.length;
  score += Math.min(reasoningLength / 10, 40);

  // 2. Evidence links (0-20 points)
  // Each link adds 5 points, max 4 links
  score += Math.min(pool.evidence.length * 5, 20);

  // 3. Visual evidence (0-15 points)
  // Having image/chart significantly boosts quality
  if (pool.imageUrl) {
    score += 15;
  }

  // 4. Creator reputation (0-25 points)
  // Higher accuracy = more trust in analysis
  if (creatorReputation) {
    score += (creatorReputation.accuracy / 100) * 25;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Get quality badge for pool
 */
export function getPoolQualityBadge(score: number): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: 'text-emerald-600',
      icon: '🏆',
      description: 'Top-tier analysis with strong evidence and reasoning'
    };
  }
  if (score >= 60) {
    return {
      label: 'Good',
      color: 'text-blue-600',
      icon: '⭐',
      description: 'Well-researched analysis with solid evidence'
    };
  }
  if (score >= 40) {
    return {
      label: 'Decent',
      color: 'text-yellow-600',
      icon: '✓',
      description: 'Reasonable analysis with basic evidence'
    };
  }
  return {
    label: 'Needs Analysis',
    color: 'text-orange-600',
      icon: '📊',
      description: 'Waiting for pools to be created'
    };
}

// ============================================
// NEWS QUALITY SCORING
// ============================================

/**
 * Calculate quality score for news (0-100)
 *
 * Scoring breakdown:
 * - Pool count: 0-30 pts (more pools = more interest)
 * - Total staked: 0-30 pts (more stakes = more conviction)
 * - Avg pool quality: 0-25 pts (quality of analysis)
 * - Speed to first pool: 0-15 pts (fast response = good topic)
 */
export function calculateNewsQualityScore(
  news: News,
  pools: Pool[],
  reputationMap?: Map<string, ReputationData>
): number {
  let score = 0;

  // 1. Pool count (0-30 points)
  // Each pool adds 10 points, max 3 pools for full score
  score += Math.min(pools.length * 10, 30);

  // 2. Total staked (0-30 points)
  // Every $10 staked = 1 point
  score += Math.min(news.totalStaked / 10, 30);

  // 3. Average pool quality (0-25 points)
  if (pools.length > 0) {
    const avgQuality = calculateAvgPoolQuality(pools, reputationMap);
    score += (avgQuality / 100) * 25;
  }

  // 4. Speed to first pool (0-15 points)
  // Fast pool creation indicates interesting topic
  if (pools.length > 0) {
    const speedScore = calculateSpeedScore(news, pools);
    score += speedScore;
  }

  return Math.min(Math.round(score), 100);
}

/**
 * Calculate average pool quality for a news
 */
function calculateAvgPoolQuality(
  pools: Pool[],
  reputationMap?: Map<string, ReputationData>
): number {
  if (pools.length === 0) return 0;

  const totalQuality = pools.reduce((sum, pool) => {
    const reputation = reputationMap?.get(pool.creatorAddress);
    const poolScore = calculatePoolQualityScore(pool, reputation);
    return sum + poolScore;
  }, 0);

  return totalQuality / pools.length;
}

/**
 * Calculate speed score (0-15 points)
 * Faster pool creation = better topic
 */
function calculateSpeedScore(news: News, pools: Pool[]): number {
  const firstPool = pools.sort((a, b) =>
    a.createdAt.getTime() - b.createdAt.getTime()
  )[0];

  const timeDiff = firstPool.createdAt.getTime() - news.createdAt.getTime();
  const hoursToFirstPool = timeDiff / (1000 * 60 * 60);

  // < 1 hour = 15 pts
  // < 6 hours = 10 pts
  // < 24 hours = 5 pts
  // > 24 hours = 0 pts
  if (hoursToFirstPool < 1) return 15;
  if (hoursToFirstPool < 6) return 10;
  if (hoursToFirstPool < 24) return 5;
  return 0;
}

/**
 * Get quality badge for news
 */
export function getNewsQualityBadge(score: number): {
  label: string;
  color: string;
  icon: string;
  description?: string;
} {
  if (score >= 80) {
    return { label: 'Excellent', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: '🏆', description: 'High engagement with strong analysis' };
  }
  if (score >= 60) {
    return { label: 'Good', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: '⭐', description: 'Decent engagement with solid analysis' };
  }
  if (score >= 40) {
    return { label: 'Decent', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: '✓', description: 'Some engagement with basic analysis' };
  }
  return {
    label: 'Needs Analysis',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    icon: '📊',
    description: 'Waiting for pools and analysis to be created'
  };
}

// ============================================
// FILTERING & SORTING HELPERS
// ============================================

export type QualityFilter = 'all' | 'decent' | 'good' | 'excellent';
export type ActivityFilter = 'any' | 'active' | 'popular' | 'trending';

/**
 * Filter news by quality threshold
 */
export function filterByQuality(
  newsList: News[],
  filter: QualityFilter
): News[] {
  const thresholds = {
    all: 0,
    decent: 40,
    good: 60,
    excellent: 80,
  };

  const minScore = thresholds[filter];
  return newsList.filter(news => (news.qualityScore ?? 0) >= minScore);
}

/**
 * Filter news by activity level
 */
export function filterByActivity(
  newsList: News[],
  filter: ActivityFilter
): News[] {
  switch (filter) {
    case 'active':
      return newsList.filter(n => n.totalPools >= 1);
    case 'popular':
      return newsList.filter(n => n.totalPools >= 3);
    case 'trending':
      return newsList.filter(n =>
        n.totalPools >= 5 && n.totalStaked >= 100
      );
    default:
      return newsList;
  }
}

/**
 * Sort news by quality score
 */
export function sortByQuality(newsList: News[]): News[] {
  return [...newsList].sort((a, b) =>
    (b.qualityScore ?? 0) - (a.qualityScore ?? 0)
  );
}

/**
 * Get trending news (quality + recency)
 */
export function getTrendingNews(newsList: News[]): News[] {
  const now = new Date().getTime();
  const dayInMs = 24 * 60 * 60 * 1000;

  return newsList
    .filter(news => {
      const isRecent = (now - news.createdAt.getTime()) < (7 * dayInMs);
      const hasActivity = (news.qualityScore ?? 0) >= 40;
      return isRecent && hasActivity;
    })
    .sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate pool creation requirements
 */
export function validatePoolCreation(pool: Partial<Pool>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Minimum reasoning length
  if (!pool.reasoning || pool.reasoning.length < 100) {
    errors.push('Reasoning must be at least 100 characters');
  }

  // Minimum creator stake
  if (!pool.creatorStake || pool.creatorStake < 1) {
    errors.push('Minimum stake is $1 USDC');
  }

  // Position required
  if (!pool.position) {
    errors.push('Position (YES/NO) is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if news meets refund conditions
 * (For future deposit system)
 */
export function meetsRefundConditions(news: News): boolean {
  const MIN_POOLS = 3;
  const MIN_STAKED = 50;
  const TIME_WINDOW_DAYS = 7;

  const now = new Date().getTime();
  const timeSinceCreation = now - news.createdAt.getTime();
  const daysSinceCreation = timeSinceCreation / (24 * 60 * 60 * 1000);

  return (
    news.totalPools >= MIN_POOLS &&
    news.totalStaked >= MIN_STAKED &&
    daysSinceCreation <= TIME_WINDOW_DAYS
  );
}
