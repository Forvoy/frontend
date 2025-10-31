import { useState, useCallback, useMemo } from 'react';
import { useGlobalStore } from '@/store/useGlobalStore';
import { News, CreateNewsInput } from '@/types';
import { getNewsById, getNewsByCategory, getNewsCategories } from '@/lib/mock-data';
import { newsService } from '@/lib/services/news.service';

export function useNews() {
  const { newsList, setNewsList, loading, setLoading } = useGlobalStore();
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading('news', true);
      setError(null);

      // Use newsService which handles both contract and mock data
      const newsData = await newsService.getAll();
      setNewsList(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      console.error('Error fetching news:', err);
    } finally {
      setLoading('news', false);
    }
  }, [setLoading, setNewsList]);

  const getNews = (id: string): News | undefined => {
    return getNewsById(id);
  };

  const getNewsByCategoryFilter = (category: string): News[] => {
    return getNewsByCategory(category);
  };

  const getCategories = (): string[] => {
    return getNewsCategories();
  };

  const searchNews = (query: string): News[] => {
    if (!query.trim()) return newsList;

    const lowercaseQuery = query.toLowerCase();
    return newsList.filter(news =>
      news.title.toLowerCase().includes(lowercaseQuery) ||
      news.description.toLowerCase().includes(lowercaseQuery) ||
      news.resolutionCriteria.toLowerCase().includes(lowercaseQuery)
    );
  };

  const sortNews = (
    newsToSort: News[],
    sortBy: 'endDate' | 'totalStaked' | 'totalPools' | 'createdAt'
  ): News[] => {
    return [...newsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'totalPools':
          return b.totalPools - a.totalPools;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const createNews = async (input: CreateNewsInput): Promise<News | null> => {
    try {
      setLoading('news', true);
      setError(null);

      // Use newsService which handles both contract and mock data
      const newNews = await newsService.create(input);

      // Auto-post to Farcaster
      console.log('Posting to Farcaster:', {
        text: `Just created a new prediction on @forter!\n\n${newNews.title}\n\nCreate pools and stake: forter.app/news/${newNews.id}`,
        embeds: []
      });

      // Update local state with new news
      setNewsList([newNews, ...newsList]);

      return newNews;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create news');
      console.error('Error creating news:', err);
      return null;
    } finally {
      setLoading('news', false);
    }
  };

  const getNewsStats = () => {
    const activeNews = newsList.filter(n => n.status === 'active');
    const totalStaked = activeNews.reduce((sum, news) => sum + news.totalStaked, 0);
    const totalPools = activeNews.reduce((sum, news) => sum + news.totalPools, 0);

    return {
      activeCount: activeNews.length,
      totalStaked,
      totalPools,
      categories: getCategories()
    };
  };

  return {
    newsList,
    loading: loading.news,
    error,
    fetchNews,
    getNews,
    getNewsByCategoryFilter,
    getCategories,
    searchNews,
    sortNews,
    createNews,
    getNewsStats,
    refetch: fetchNews
  };
}

// Hook for filtering and sorting news (client-side)
export function useFilteredNews(
  searchQuery: string = '',
  selectedCategory: string = 'All',
  sortBy: 'endDate' | 'totalStaked' | 'totalPools' | 'createdAt' = 'totalStaked'
) {
  const { newsList } = useNews();

  // Use useMemo to prevent unnecessary re-calculations
  const filteredNews = useMemo(() => {
    let filtered = newsList;

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(query) ||
        news.description.toLowerCase().includes(query) ||
        news.resolutionCriteria.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'endDate':
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case 'totalStaked':
          return b.totalStaked - a.totalStaked;
        case 'totalPools':
          return b.totalPools - a.totalPools;
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [newsList, searchQuery, selectedCategory, sortBy]);

  return filteredNews;
}
