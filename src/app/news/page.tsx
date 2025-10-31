'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { News } from '@/types';
import { MOCK_NEWS, MOCK_POOLS, MOCK_REPUTATION } from '@/lib/mock-data';
import { newsService } from '@/lib/services';
import NewsCard from '@/components/news/NewsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { calculateNewsQualityScore, QualityFilter, ActivityFilter } from '@/lib/quality-scoring';
import { Trophy, DollarSign, Layers, Clock, ChevronDown } from 'lucide-react';

const CATEGORIES = ['All', 'Crypto', 'Macro', 'Tech', 'Sports', 'Politics'];

export default function NewsPage() {
  const { newsList, setNewsList, pools, loading, setLoading } = useGlobalStore();
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'quality' | 'endDate' | 'totalStaked' | 'totalPools'>('quality');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('any');
  const [showFilters, setShowFilters] = useState(false);

  // Load news data on component mount
  useEffect(() => {
    const loadNews = async () => {
      setLoading('news', true);
      try {
        const newsData = await newsService.getAll();
        setNewsList(newsData);
        console.log('[NewsPage] Loaded', newsData.length, 'news items from contract');
      } catch (error) {
        console.error('[NewsPage] Failed to load news:', error);
        // Fallback to mock data if contract fails
        setNewsList(MOCK_NEWS);
      } finally {
        setLoading('news', false);
      }
    };

    loadNews();
  }, [setNewsList, setLoading]);

  // Calculate quality scores for all news
  const newsWithQuality = useMemo(() => {
    const reputationMap = new Map(
      Object.entries(MOCK_REPUTATION).map(([addr, rep]) => [addr, rep])
    );

    return newsList.map(news => {
      // Use contract pools if available, fallback to mock pools
      const contractPools = pools.filter(p => p.newsId === news.id);
      const mockPools = MOCK_POOLS.filter(p => p.newsId === news.id);
      const allPools = contractPools.length > 0 ? contractPools : mockPools;
      const qualityScore = calculateNewsQualityScore(news, allPools, reputationMap);

      console.log('[NewsPage] Quality calculation for news', news.id, {
        contractPools: contractPools.length,
        mockPools: mockPools.length,
        usedPools: allPools.length,
        qualityScore,
        title: news.title
      });

      return {
        ...news,
        qualityScore,
      };
    });
  }, [newsList, pools]);

  // Filter and sort news
  useEffect(() => {
    let filtered = newsWithQuality;

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(news => news.status === selectedStatus);
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    // Quality filter
    if (qualityFilter !== 'all') {
      const thresholds = {
        all: 0,
        decent: 40,
        good: 60,
        excellent: 80,
      };
      const minScore = thresholds[qualityFilter];
      filtered = filtered.filter(news => (news.qualityScore ?? 0) >= minScore);
    }

    // Activity filter
    if (activityFilter !== 'any') {
      switch (activityFilter) {
        case 'active':
          filtered = filtered.filter(n => n.totalPools >= 1);
          break;
        case 'popular':
          filtered = filtered.filter(n => n.totalPools >= 3);
          break;
        case 'trending':
          filtered = filtered.filter(n => n.totalPools >= 5 && n.totalStaked >= 100);
          break;
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'quality':
          return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'totalPools':
          return b.totalPools - a.totalPools;
        default:
          return 0;
      }
    });

    setFilteredNews(filtered);
  }, [newsWithQuality, selectedCategory, selectedStatus, qualityFilter, activityFilter, searchQuery, sortBy]);

  const activeNews = filteredNews.filter(n => n.status === 'active');
  const totalStaked = activeNews.reduce((sum, news) => sum + news.totalStaked, 0);
  const totalPools = activeNews.reduce((sum, news) => sum + news.totalPools, 0);

  return (
    <div className="min-h-screen pt-16 md:pt-24 pb-32 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header - Cleaner Layout */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                News Explorer
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Discover predictions and stake on credibility
              </p>
            </div>
            {/* Desktop Create Button */}
            <Link href="/news/create" className="hidden md:block">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                + Create NEWS
              </Button>
            </Link>
          </div>

          {/* Stats Overview - Inline with reduced emphasis */}
          <div className="flex items-center gap-4 md:gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Active:</span>
              <span className="font-semibold text-primary">{activeNews.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Pools:</span>
              <span className="font-semibold text-accent">{totalPools}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Staked:</span>
              <span className="font-semibold">${totalStaked.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <Link href="/news/create" className="md:hidden fixed bottom-10 right-4 z-40">
          <Button size="lg" className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/30 p-0">
            <span className="text-2xl">+</span>
          </Button>
        </Link>

        {/* Filters - Streamlined */}
        <div className="mb-6 md:mb-8">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Enhanced Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'quality' | 'endDate' | 'totalStaked' | 'totalPools')}
                className="appearance-none w-full sm:w-[200px] h-10 pl-10 pr-10 rounded-md border border-border bg-card text-sm font-medium hover:bg-secondary hover:border-primary transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="quality">Quality Score</option>
                <option value="totalStaked">Most Staked</option>
                <option value="totalPools">Most Pools</option>
                <option value="endDate">Ending Soon</option>
              </select>

              {/* Icon on the left */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {sortBy === 'quality' && <Trophy className="w-4 h-4 text-primary" />}
                {sortBy === 'totalStaked' && <DollarSign className="w-4 h-4 text-accent" />}
                {sortBy === 'totalPools' && <Layers className="w-4 h-4 text-primary" />}
                {sortBy === 'endDate' && <Clock className="w-4 h-4 text-orange-500" />}
              </div>

              {/* Chevron on the right */}
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Mobile: Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium mb-3 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(selectedCategory !== 'All' || selectedStatus !== 'all' || qualityFilter !== 'all' || activityFilter !== 'any') && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Filter Chips - Simplified */}
          <div className={`${showFilters ? 'block' : 'hidden md:block'}`}>
            {/* Desktop: Single row of filters */}
            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
              {/* Status */}
              {(['all', 'active', 'resolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <div className="h-4 w-px bg-border mx-1" />
              {/* Categories */}
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Mobile: Vertical grouped filters */}
            <div className="md:hidden space-y-3">
              {/* Status Filter */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Status</span>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedStatus === status
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Category</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'all') && (
              <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">Showing {filteredNews.length} {filteredNews.length === 1 ? 'result' : 'results'}</span>
                  {searchQuery && (
                    <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('all');
                    setSearchQuery('');
                  }}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* News Grid - Mobile Optimized */}
        {loading.news ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-border bg-card animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
            {filteredNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <Card className="border border-border bg-card">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">No news found</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Try adjusting your search criteria or explore different categories.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
