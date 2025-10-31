/**
 * CONTRACTS - MAIN EXPORT POINT
 *
 * Centralized exports for all contract operations
 * Organized by contract type for better maintainability
 */

// ==========================================
// SHARED UTILITIES & TYPES
// ==========================================
export {
  parseUSDC,
  formatUSDC,
  timestampToDate,
  dateToTimestamp,
  positionToString,
  stringToPosition,
  handleContractError,
} from './utils';

export type {
  TransactionResult,
  NewsContractData,
  PoolContractData,
  ReputationContractData,
  StakeContractData,
  PoolStakeStatsContractData,
  NewsResolutionContractData,
} from './types';

// ==========================================
// FORTER CONTRACT
// ==========================================
export {
  // Read
  getNewsCount,
  getNewsById,
  getPoolsByNewsId,
  getPoolById,
  getPoolsByCreator,
  getUserStake,
  getNewsResolutionInfo,
  // Write
  createNews,
  createPool,
  stakeOnPool,
  resolveNews,
  emergencyResolve,
  // Mappers
  mapContractToNews,
  mapContractToPool,
} from './Forter';

// ==========================================
// REPUTATION NFT CONTRACT
// ==========================================
export {
  // Read
  getUserReputation,
  getAllAnalystsFromContract,
  getTotalAnalysts,
  getUserByTokenId,
  // Write
  mintReputationNFT,
  updateReputation,
  // Mappers
  mapContractToReputation,
} from './ReputationNFT';

// ==========================================
// STAKING POOL CONTRACT
// ==========================================
export {
  // Read
  getPoolStakeStats,
  // Write
  withdrawStake,
  emergencyWithdraw,
} from './StakingPool';

// ==========================================
// TOKEN (USDC) CONTRACT
// ==========================================
export {
  // Read
  getUSDCBalance,
  getUSDCAllowance,
  // Write
  approveUSDC,
  transferUSDC,
} from './Token';
