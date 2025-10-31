/**
 * TOKEN (USDC) CONTRACT - MAIN EXPORT
 *
 * Centralized exports for all Token contract operations
 */

// Read operations
export { getUSDCBalance, getUSDCAllowance } from './read';

// Write operations
export { approveUSDC, transferUSDC } from './write';
