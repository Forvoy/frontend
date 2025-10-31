/**
 * FORTER CONTRACT - MAIN EXPORT
 *
 * Centralized exports for all Forter contract operations
 */

// Read operations
export {
  getNewsCount,
  getNewsById,
  getPoolsByNewsId,
  getPoolById,
  getPoolsByCreator,
  getUserStake,
  getNewsResolutionInfo,
} from './read';

// Write operations
export {
  createNews,
  createPool,
  stakeOnPool,
  resolveNews,
  emergencyResolve,
} from './write';

// Data mappers
export {
  mapContractToNews,
  mapContractToPool,
} from './mappers';
