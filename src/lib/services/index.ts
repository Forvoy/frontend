/**
 * SERVICES - MAIN ENTRY POINT
 *
 * ⭐ THIS IS THE INTEGRATION LAYER FOR SMART CONTRACTS ⭐
 *
 * Services abstract all data fetching logic.
 * Components should ONLY import from here, never from mock-data directly.
 *
 * Benefits:
 * 1. Single place to switch between mock/contract data
 * 2. Type-safe API for components
 * 3. Easy to test (mock the service layer)
 * 4. Clean separation of concerns
 *
 * Usage in Components:
 * ```typescript
 * import { newsService } from '@/lib/services';
 *
 * const news = await newsService.getAll();
 * const newNews = await newsService.create(input);
 * ```
 */

export { newsService } from './news.service';
export { poolService } from './pool.service';
export { stakingService } from './staking.service';
export { reputationService } from './reputation.service';
export { tokenService } from './token.service';
