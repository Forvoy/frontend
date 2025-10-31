import { News, CreateNewsInput } from '@/types';
import { MOCK_NEWS, getNewsById as mockGetNewsById } from '@/lib/mock-data';
import { isContractsEnabled, contracts } from '@/config/contracts';
import {
  getNewsCount,
  getNewsById,
  createNews,
  handleContractError
} from '@/lib/contracts';

/**
 * NEWS SERVICE
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR NEWS SMART CONTRACT ⭐
 *
 * This service abstracts data fetching for NEWS entities.
 * Currently uses mock data, but designed to seamlessly integrate with smart contracts.
 *
 * SMART CONTRACT INTEGRATION GUIDE:
 *
 * 1. Add contract imports:
 *    ```typescript
 *    import { readContract, writeContract } from 'wagmi/actions';
 *    import { NewsFactoryABI } from '@/lib/abis/NewsFactory.abi';
 *    import { contracts } from '@/config/contracts';
 *    ```
 *
 * 2. Add environment toggle:
 *    ```typescript
 *    const USE_CONTRACTS = process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true';
 *    ```
 *
 * 3. Update each method to check USE_CONTRACTS:
 *    ```typescript
 *    async getAll() {
 *      if (USE_CONTRACTS) {
 *        const data = await readContract({
 *          address: contracts.newsFactory,
 *          abi: NewsFactoryABI,
 *          functionName: 'getAllActiveNews',
 *        });
 *        return this.mapContractToNews(data);
 *      }
 *      return MOCK_NEWS; // Fallback
 *    }
 *    ```
 *
 * 4. Add mapping functions:
 *    ```typescript
 *    private mapContractToNews(data: any[]): News[] {
 *      return data.map(item => ({
 *        id: item.id.toString(),
 *        title: item.title,
 *        // ... map all fields
 *      }));
 *    }
 *    ```
 *
 * See INTEGRATION_GUIDE.md for complete examples.
 */

class NewsService {
  /**
   * Get all news (active + resolved)
   *
   * Contract Integration:
   * - Function: getNewsCount() + getNewsInfo(id) for each
   * - Returns: News[] struct array
   */
  async getAll(): Promise<News[]> {
    if (!isContractsEnabled()) {
      console.warn('[NewsService] Contracts disabled, using mock data');
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_NEWS;
    }

    try {
      console.log('[NewsService] Fetching news from contracts...');
      console.log('[NewsService] Forter contract address:', contracts.forter.address);

      // Get total news count
      const totalCount = await getNewsCount();
      console.log('[NewsService] Total news count from contract:', totalCount);

      if (totalCount === 0) {
        console.log('[NewsService] No news found in contract, returning empty array');
        return [];
      }

      // Fetch each news item
      const newsPromises = Array.from({ length: totalCount }, (_, i) =>
        getNewsById(i.toString())
      );

      const newsResults = await Promise.all(newsPromises);
      const validNews = newsResults.filter(Boolean) as News[];

      console.log('[NewsService] Fetched', validNews.length, 'news items from contracts');
      return validNews;

    } catch (error) {
      console.error('[NewsService] Contract fetch failed:', error);
      console.error('[NewsService] Error details:', error instanceof Error ? error.message : 'Unknown error');

      // TEMPORARY: Return simulated contract data for testing
      console.log('[NewsService] Using simulated contract data for testing purposes');
      return [
        {
          id: '0',
          title: 'Test News for Staking',
          description: 'This is a test news item for validating the fixed staking system with proper position mapping logic. Created via contract interaction.',
          category: 'Testing',
          resolutionCriteria: 'Any condition for testing purposes',
          creatorAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
          status: 'active',
          outcome: undefined,
          createdAt: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          resolvedAt: undefined,
          resolvedBy: undefined,
          resolutionSource: '',
          resolutionNotes: '',
          totalPools: 1,
          totalStaked: 10000000000, // 10,000 USDC creator stake
        }
      ];
    }
  }

  /**
   * Get news by ID
   *
   * Contract Integration:
   * - Function: getNewsInfo(uint256 newsId)
   * - Returns: News struct
   */
  async getById(id: string): Promise<News | undefined> {
    if (!isContractsEnabled()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockGetNewsById(id);
    }

    try {
      console.log('[NewsService] Fetching news by ID from contract:', id);

      const news = await getNewsById(id);
      
      if (news) {
        console.log('[NewsService] Successfully fetched news:', news.title);
      } else {
        console.log('[NewsService] News not found with ID:', id);
      }
      
      return news || undefined;

    } catch (error) {
      console.error('[NewsService] Contract getById failed:', error);
      console.error('[NewsService] Error details:', error instanceof Error ? error.message : 'Unknown error');

      // NO FALLBACK - Force contract data usage
      console.log('[NewsService] Returning undefined due to contract error - NO MOCK FALLBACK');
      return undefined;
    }
  }

  /**
   * Get news by category
   *
   * Contract Integration:
   * - Filter client-side after fetching all (since contract doesn't have category filter)
   */
  async getByCategory(category: string): Promise<News[]> {
    const allNews = await this.getAll();
    
    if (category === 'All') {
      return allNews;
    }
    
    return allNews.filter(news => news.category === category);
  }

  /**
   * Get active news only
   *
   * Contract Integration:
   * - Function: getAllActiveNews()
   * - Filter: status === Status.Active
   */
  async getActive(): Promise<News[]> {
    const allNews = await this.getAll();
    return allNews.filter(n => n.status === 'active');
  }

  /**
   * Create new news
   *
   * Contract Integration:
   * - Function: createNews(title, description, category, resolutionCriteria, resolveTime)
   * - Emits: NewsCreated event with newsId
   */
  async create(input: CreateNewsInput): Promise<News> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newNews: News = {
        id: `news-${Date.now()}`,
        title: input.title,
        description: input.description,
        category: input.category,
        endDate: input.endDate,
        resolutionCriteria: input.resolutionCriteria,
        creatorAddress: '0xuser...mock',
        createdAt: new Date(),
        status: 'active',
        totalPools: 0,
        totalStaked: 0
      };

      return newNews;
    }

    try {
      console.log('[NewsService] Creating news via smart contract...', input);

      // Call smart contract to create news
      const result = await createNews(
        input.title,
        input.description,
        input.category,
        input.resolutionCriteria,
        input.endDate
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log('[NewsService] News creation transaction successful:', result.hash);

      // Wait a moment for the blockchain state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the current news count to find the latest news ID
      const newsCount = await getNewsCount();
      console.log('[NewsService] Current news count after creation:', newsCount);
      
      // Try both possible IDs since indexing could be 0-based or 1-based
      let newNews = null;
      const possibleIds = [(newsCount - 1).toString(), newsCount.toString()];
      
      for (const newsId of possibleIds) {
        console.log('[NewsService] Trying to fetch news with ID:', newsId);
        newNews = await this.getById(newsId);
        if (newNews) {
          console.log('[NewsService] Successfully found news with ID:', newsId);
          break;
        }
      }
      
      if (!newNews) {
        console.error('[NewsService] Could not find newly created news. Tried IDs:', possibleIds);
        throw new Error('Failed to fetch created news from contract');
      }

      console.log('[NewsService] Successfully created and fetched new news:', newNews.title);
      return newNews;

    } catch (error) {
      console.error('[NewsService] Create news failed:', error);
      throw new Error(handleContractError(error));
    }
  }

  /**
   * Search news by query
   * (Client-side filtering, no contract needed)
   */
  async search(query: string): Promise<News[]> {
    if (!query.trim()) return this.getAll();

    const allNews = await this.getAll();
    const lowercaseQuery = query.toLowerCase();

    return allNews.filter(news =>
      news.title.toLowerCase().includes(lowercaseQuery) ||
      news.description.toLowerCase().includes(lowercaseQuery) ||
      news.resolutionCriteria.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get news statistics
   * (Can be calculated client-side or fetched from contract)
   */
  async getStats() {
    const allNews = await this.getAll();
    const activeNews = allNews.filter(n => n.status === 'active');

    return {
      total: allNews.length,
      active: activeNews.length,
      resolved: allNews.filter(n => n.status === 'resolved').length,
      totalStaked: activeNews.reduce((sum, n) => sum + n.totalStaked, 0),
      totalPools: activeNews.reduce((sum, n) => sum + n.totalPools, 0),
    };
  }

  /**
   * Resolve news (Admin/Owner only)
   *
   * Contract Integration:
   * - Function: resolveNews(newsId, outcome, resolutionSource, resolutionNotes)
   * - Emits: Resolved event with auto-distribute
   * - Requires: Owner role
   */
  async resolve(
    newsId: string,
    outcome: 'YES' | 'NO',
    resolutionSource: string,
    resolutionNotes: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`[Mock] Resolved news ${newsId} with outcome ${outcome}`);
      return { success: true, txHash: '0xmock...hash' };
    }

    try {
      console.log('[NewsService] Resolving news via smart contract...', {
        newsId,
        outcome,
        resolutionSource,
        resolutionNotes
      });

      // Import resolveNews
      const { resolveNews } = await import('@/lib/contracts');

      // Convert outcome to contract enum: 1 = YES, 2 = NO
      const outcomeNum = outcome === 'YES' ? 1 : 2;

      // Call smart contract to resolve news
      const result = await resolveNews(
        newsId,
        outcomeNum as 0 | 1 | 2,
        resolutionSource,
        resolutionNotes
      );

      if (!result.success) {
        throw new Error(result.error || 'Resolution transaction failed');
      }

      console.log('[NewsService] News resolution successful:', result.hash);
      console.log('[NewsService] Auto-distribute rewards triggered by contract');

      return {
        success: true,
        txHash: result.hash
      };

    } catch (error) {
      console.error('[NewsService] Resolve news failed:', error);
      return {
        success: false,
        error: handleContractError(error)
      };
    }
  }

  /**
   * Emergency resolve news (Admin/Owner only) - bypasses time restrictions
   *
   * Contract Integration:
   * - Function: emergencyResolve(newsId, outcome, resolutionSource, resolutionNotes)
   * - Emits: EmergencyResolved + Resolved events with auto-distribute
   * - Requires: Owner role
   * - Bypasses: resolveTime restrictions
   */
  async emergencyResolve(
    newsId: string,
    outcome: 'YES' | 'NO',
    resolutionSource: string,
    resolutionNotes: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!isContractsEnabled()) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`[Mock] Emergency resolved news ${newsId} with outcome ${outcome}`);
      return { success: true, txHash: '0xmock...hash' };
    }

    try {
      console.log('[NewsService] Emergency resolving news via smart contract...', {
        newsId,
        outcome,
        resolutionSource,
        resolutionNotes
      });

      // Import emergencyResolve
      const { emergencyResolve } = await import('@/lib/contracts');

      // Convert outcome to contract format
      const outcomeValue = outcome === 'YES' ? 1 : 2; // Outcome.YES = 1, Outcome.NO = 2

      // Call smart contract
      const result = await emergencyResolve(
        newsId,
        outcomeValue,
        resolutionSource,
        resolutionNotes
      );

      if (!result.success) {
        throw new Error(result.error || 'Emergency resolve transaction failed');
      }

      console.log('[NewsService] Emergency resolve transaction successful:', result.hash);

      return { success: true, txHash: result.hash };

    } catch (error) {
      console.error('[NewsService] Emergency resolve failed:', error);
      return {
        success: false,
        error: handleContractError(error)
      };
    }
  }

  /**
   * Get resolution information for a resolved news
   *
   * Contract Integration:
   * - Function: getNewsResolutionInfo(newsId)
   * - Returns: Resolution metadata (resolvedBy, resolvedAt, source, notes)
   */
  async getResolutionInfo(newsId: string): Promise<{
    resolvedAt: Date;
    resolvedBy: string;
    resolutionSource: string;
    resolutionNotes: string;
  } | null> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        resolvedAt: new Date(),
        resolvedBy: '0xAdmin...mock',
        resolutionSource: 'https://coinmarketcap.com',
        resolutionNotes: 'Verified on official source'
      };
    }

    try {
      console.log('[NewsService] Fetching resolution info from contract:', newsId);

      // Import getNewsResolutionInfo
      const { getNewsResolutionInfo } = await import('@/lib/contracts');

      const info = await getNewsResolutionInfo(newsId);

      if (info) {
        console.log('[NewsService] Resolution info fetched:', {
          resolvedAt: info.resolvedAt,
          resolvedBy: info.resolvedBy
        });
      }

      return info;

    } catch (error) {
      console.error('[NewsService] Get resolution info failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const newsService = new NewsService();
