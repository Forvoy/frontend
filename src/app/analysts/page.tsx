'use client';

import { useMemo } from 'react';
import { useAnalysts, useFilteredAnalysts } from '@/lib/hooks/useAnalysts';
import AnalystCard from '@/components/analysts/AnalystCard';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Target,
  Award,
  AlertTriangle,
  Search,
  Lightbulb,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function AnalystsPage() {
  const categories = ['All', 'Crypto', 'Macro', 'Tech', 'DeFi'];

  // Fetch all analysts from contract or mock
  const { analysts, loading, error } = useAnalysts();

  // Filter and sort analysts
  const {
    filteredAnalysts,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    stats: filterStats
  } = useFilteredAnalysts(analysts);

  // Calculate global stats
  const stats = useMemo(() => {
    const totalAnalysts = analysts.length;
    const avgAccuracy = filterStats.avgAccuracy;

    // Count by category
    const categoryCount: Record<string, number> = {};
    analysts.forEach(analyst => {
      if (analyst.specialty) {
        analyst.specialty.split(',').forEach(cat => {
          const trimmed = cat.trim();
          categoryCount[trimmed] = (categoryCount[trimmed] || 0) + 1;
        });
      }
    });

    const mostActiveCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

    return {
      totalAnalysts,
      avgAccuracy,
      mostActiveCategory: mostActiveCategory ? mostActiveCategory[0] : 'N/A',
      mostActiveCategoryCount: mostActiveCategory ? mostActiveCategory[1] : 0
    };
  }, [analysts, filterStats]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading analysts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Card className="border border-destructive/50 bg-destructive/5">
            <CardContent className="p-6 md:p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Failed to load analysts</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <Award className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Top Analysts & Informers
            </span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg max-w-3xl">
            Discover credible analysts by track record. All reputation data is verified on-chain and built from proven pool creation performance.
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="border border-border bg-card">
            <CardContent className="p-3 md:p-6 text-center">
              <Users className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-primary" />
              <div className="text-base md:text-2xl font-bold text-primary mb-0.5 md:mb-1">
                {stats.totalAnalysts}
              </div>
              <div className="text-[10px] md:text-sm text-muted-foreground leading-tight">Total Analysts</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card">
            <CardContent className="p-3 md:p-6 text-center">
              <Target className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-accent" />
              <div className="text-base md:text-2xl font-bold text-accent mb-0.5 md:mb-1">
                {stats.avgAccuracy}%
              </div>
              <div className="text-[10px] md:text-sm text-muted-foreground leading-tight">Average Accuracy</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card">
            <CardContent className="p-3 md:p-6 text-center">
              <Layers className="h-4 w-4 md:h-6 md:w-6 mx-auto mb-1 md:mb-2 text-foreground" />
              <div className="text-base md:text-2xl font-bold text-foreground mb-0.5 md:mb-1">
                {stats.mostActiveCategory}
              </div>
              <div className="text-[10px] md:text-sm text-muted-foreground leading-tight">Most Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          {/* Category Filter */}
          <div>
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Category</div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    categoryFilter === category
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <div className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Sort by</div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              <button
                onClick={() => setSortBy('accuracy')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  sortBy === 'accuracy'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Accuracy</span>
                </span>
              </button>
              <button
                onClick={() => setSortBy('totalPools')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  sortBy === 'totalPools'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Most </span>
                  <span>Pools</span>
                </span>
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  sortBy === 'recent'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-card text-muted-foreground hover:bg-secondary border border-border'
                }`}
              >
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-3 md:mb-4">
          <p className="text-xs md:text-sm text-muted-foreground">
            Showing {filteredAnalysts.length} {filteredAnalysts.length === 1 ? 'analyst' : 'analysts'}
            {categoryFilter !== 'All' && ` in ${categoryFilter}`}
          </p>
        </div>

        {/* Analysts Grid */}
        {filteredAnalysts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredAnalysts.map((analyst) => (
              <AnalystCard key={analyst.address} analyst={analyst} />
            ))}
          </div>
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-8 md:p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No analysts found</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Try adjusting your filters to see more results.
              </p>
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setSortBy('accuracy');
                }}
                className="text-primary hover:underline text-sm md:text-base"
              >
                Reset filters
              </button>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-8 md:mt-12 border border-primary/30 bg-primary/5">
          <CardContent className="p-4 md:p-6 lg:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>How Reputation Works</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>Tier System</span>
                </h4>
                <ul className="space-y-1 md:space-y-1.5">
                  <li>👑 <strong>Legend</strong>: 95%+ accuracy</li>
                  <li>💎 <strong>Master</strong>: 85-94% accuracy</li>
                  <li>🥇 <strong>Expert</strong>: 70-84% accuracy</li>
                  <li>🥈 <strong>Analyst</strong>: 50-69% accuracy</li>
                  <li>🥉 <strong>Novice</strong>: Below 50%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Target className="h-4 w-4" />
                  <span>Accuracy Calculation</span>
                </h4>
                <p className="mb-2">
                  Reputation is calculated <strong>only from pool creation</strong>, not from staking activity.
                </p>
                <p>
                  Accuracy = (Correct Pools / Total Resolved Pools) × 100%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
