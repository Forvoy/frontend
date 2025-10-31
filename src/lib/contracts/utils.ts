/**
 * SHARED UTILITIES FOR ALL CONTRACTS
 *
 * Common helper functions used across all contract integrations
 */

import { parseUnits, formatUnits } from 'viem';
import { config } from '@/config/contracts';

/**
 * CONVERSION UTILITIES
 */

// Convert USDC amount to wei (6 decimals)
export function parseUSDC(amount: string | number): bigint {
  return parseUnits(amount.toString(), config.USDC_DECIMALS);
}

// Convert USDC wei to readable amount
export function formatUSDC(amount: bigint | undefined | null): string {
  if (amount === undefined || amount === null) {
    return '0';
  }
  return formatUnits(amount, config.USDC_DECIMALS);
}

// Convert Unix timestamp to Date
export function timestampToDate(timestamp: bigint | undefined | null): Date {
  if (timestamp === undefined || timestamp === null) {
    return new Date(0);
  }
  return new Date(Number(timestamp) * 1000);
}

// Convert Date to Unix timestamp
export function dateToTimestamp(date: Date): bigint {
  return BigInt(Math.floor(date.getTime() / 1000));
}

// Convert boolean position to string
export function positionToString(position: boolean): 'YES' | 'NO' {
  return position ? 'YES' : 'NO';
}

// Convert string position to boolean
export function stringToPosition(position: 'YES' | 'NO'): boolean {
  return position === 'YES';
}

// Convert string/number ID to BigInt (safe conversion)
export function convertToBigInt(id: string | number): bigint {
  if (typeof id === 'number') return BigInt(id);

  // Extract numeric part from string IDs like 'pool-1', 'news-2', etc.
  const numericPart = id.toString().replace(/\D/g, '');

  if (!numericPart) {
    throw new Error(`Cannot extract numeric ID from: ${id}`);
  }

  return BigInt(numericPart);
}

/**
 * ERROR HANDLING
 */
export function handleContractError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown error occurred';
  }

  const message = error.message.toLowerCase();

  // User rejected transaction
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction was cancelled by user';
  }

  // Insufficient funds
  if (message.includes('insufficient funds')) {
    return 'Insufficient ETH for gas fees';
  }

  // Contract revert
  if (message.includes('execution reverted')) {
    return 'Transaction was rejected by the contract';
  }

  // Allowance error
  if (message.includes('insufficient allowance')) {
    return 'Please approve USDC spending first';
  }

  // Network errors
  if (message.includes('network') || message.includes('connection')) {
    return 'Network error. Please check your connection';
  }

  // Default
  return 'Transaction failed. Please try again';
}
