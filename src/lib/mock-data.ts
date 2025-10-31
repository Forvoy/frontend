/**
 * DEPRECATED: This file has been refactored into modules
 *
 * Old structure (1099 lines in 1 file) has been split into:
 * - lib/mock-data/news.mock.ts
 * - lib/mock-data/pools.mock.ts
 * - lib/mock-data/stakes.mock.ts
 * - lib/mock-data/reputation.mock.ts
 * - lib/mock-data/helpers.ts
 * - lib/mock-data/index.ts (main entry point)
 *
 * This file now re-exports from the new structure for backward compatibility.
 * All imports will continue to work without changes.
 *
 * To complete the migration, update your imports from:
 *   import { MOCK_NEWS } from '@/lib/mock-data';
 * To:
 *   import { MOCK_NEWS } from '@/lib/mock-data/index';  // Or just '@/lib/mock-data'
 */

// Re-export everything from the new modular structure
export * from './mock-data/index';
