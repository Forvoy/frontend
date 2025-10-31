/**
 * MOCK DATA - MAIN ENTRY POINT
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR SMART CONTRACT DEVELOPERS ⭐
 *
 * This file re-exports all mock data and helper functions.
 * When integrating with smart contracts:
 *
 * 1. Keep this file structure (don't change imports in components)
 * 2. Create a service layer (lib/services/) that handles contract calls
 * 3. Replace the exports below to use services instead of mock data
 * 4. Toggle between mock/contract mode using environment variable
 *
 * Example Integration:
 * ```typescript
 * // Before (mock):
 * export { MOCK_NEWS } from './news.mock';
 *
 * // After (with contracts):
 * import { newsService } from '../services/news.service';
 * export const MOCK_NEWS = await newsService.getAll(); // Or keep for fallback
 * ```
 *
 * See INTEGRATION_GUIDE.md for detailed instructions.
 */

// ============================================
// RE-EXPORT MOCK DATA
// ============================================

export { MOCK_NEWS } from './news.mock';
export { MOCK_POOLS } from './pools.mock';
export { MOCK_POOL_STAKES } from './stakes.mock';
export { MOCK_REPUTATION } from './reputation.mock';

// ============================================
// RE-EXPORT HELPER FUNCTIONS
// ============================================

export {
  // News helpers
  getNewsByCategory,
  getNewsById,
  getNewsCategories,
  getNewsStats,

  // Pool helpers
  getPoolsByNewsId,
  getPoolById,
  getPoolsByCreator,
  getPoolStats,

  // Stake helpers
  getPoolStakesByPoolId,
  getStakesByUser,

  // Reputation helpers
  getReputationData,
  getAllAnalysts,
  getAnalystsByTier,
  getAnalystsByCategory,
  sortAnalysts,
  getTierIcon,
  calculateTier,

  // User profile helpers
  getUserProfileStats,

  // Types
  type UserProfileStats,
} from './helpers';
