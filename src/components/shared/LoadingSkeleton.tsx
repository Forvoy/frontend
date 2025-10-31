import { Card, CardContent } from '@/components/ui/card';

/**
 * LOADING SKELETON COMPONENTS
 *
 * Reusable skeleton loaders for various content types.
 * Previously duplicated across news, pools, profile pages.
 *
 * Features:
 * - Smooth pulse animation
 * - Matches actual content layout
 * - Responsive design
 * - Accessible (uses aria-busy)
 *
 * Usage:
 * ```tsx
 * {loading ? (
 *   <NewsCardSkeleton count={6} />
 * ) : (
 *   <NewsCard news={news} />
 * )}
 * ```
 *
 * Why Extracted:
 * - DRY principle (used 10+ times)
 * - Consistent loading UX
 * - Easier to maintain
 * - Better perceived performance
 */

// ============================================
// BASE SKELETON COMPONENTS
// ============================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className || ''}`}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// ============================================
// NEWS SKELETON
// ============================================

export function NewsCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border border-border bg-card">
          <CardContent className="p-6">
            {/* Title */}
            <Skeleton className="h-4 w-3/4 mb-3" />

            {/* Description */}
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-2/3 mb-4" />

            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>

            {/* Stats */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function NewsCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NewsCardSkeleton count={count} />
    </div>
  );
}

// ============================================
// POOL SKELETON
// ============================================

export function PoolCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border border-border bg-card">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Position Badge */}
            <Skeleton className="h-6 w-16 mb-4" />

            {/* Reasoning */}
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4 mb-4" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Action Button */}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function PoolCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <PoolCardSkeleton count={count} />
    </div>
  );
}

// ============================================
// STAT CARD SKELETON
// ============================================

export function StatCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border border-border bg-card">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-8 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function StatCardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCardSkeleton count={count} />
    </div>
  );
}

// ============================================
// ANALYST SKELETON
// ============================================

export function AnalystCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border border-border bg-card">
          <CardContent className="p-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-5 w-12" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div>
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>

            {/* Action Button */}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function AnalystCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnalystCardSkeleton count={count} />
    </div>
  );
}

// ============================================
// PROFILE SKELETON
// ============================================

export function ProfileHeaderSkeleton() {
  return (
    <Card className="border border-border bg-card mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <Skeleton className="h-24 w-24 rounded-full" />

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <Skeleton className="h-6 w-48 mb-2 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-32 mb-4 mx-auto md:mx-0" />

            {/* Stats */}
            <div className="flex gap-6 justify-center md:justify-start">
              <div>
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div>
                <Skeleton className="h-5 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div>
                <Skeleton className="h-5 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Badge */}
          <Skeleton className="h-16 w-16 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// TABLE SKELETON
// ============================================

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={`h-12 ${j === 0 ? 'w-1/4' : j === cols - 1 ? 'w-1/6' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// DETAIL PAGE SKELETON
// ============================================

export function DetailPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border border-border bg-card">
        <CardContent className="p-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-6" />

          <div className="flex gap-4 mb-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>

          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      {/* Stats */}
      <StatCardSkeletonGrid count={4} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PoolCardSkeleton count={4} />
      </div>
    </div>
  );
}

// ============================================
// FULL PAGE SKELETON
// ============================================

export function PageSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-3xl" />
        </div>

        {/* Stats */}
        <StatCardSkeletonGrid count={3} />

        {/* Filters */}
        <Card className="border border-border bg-card my-8">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <NewsCardSkeletonGrid count={6} />
      </div>
    </div>
  );
}
