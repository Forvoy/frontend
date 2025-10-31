/**
 * SHARED COMPONENTS - MAIN EXPORT
 *
 * Reusable UI components used throughout the application.
 * Extracted to follow DRY principle and ensure consistent UX.
 *
 * Usage:
 * ```typescript
 * import { StatCard, EmptyState, NewsCardSkeleton } from '@/components/shared';
 * ```
 */

// Stat Cards
export { StatCard, StatGrid } from './StatCard';

// Empty States
export {
  EmptyState,
  EmptyNewsState,
  EmptyPoolsState,
  EmptyStakesState,
  EmptySearchState,
  EmptyAnalystsState,
} from './EmptyState';

// Loading Skeletons
export {
  Skeleton,
  SkeletonText,
  NewsCardSkeleton,
  NewsCardSkeletonGrid,
  PoolCardSkeleton,
  PoolCardSkeletonGrid,
  StatCardSkeleton,
  StatCardSkeletonGrid,
  AnalystCardSkeleton,
  AnalystCardSkeletonGrid,
  ProfileHeaderSkeleton,
  TableSkeleton,
  DetailPageSkeleton,
  PageSkeleton,
} from './LoadingSkeleton';

// Floating Indicator (Transaction Feedback)
export { default as FloatingIndicator } from './FloatingIndicator';
