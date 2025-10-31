/**
 * SHARED TYPES FOR CONTRACT INTEGRATIONS
 *
 * Common types used across all contract operations
 */

import type { Address } from '@/types/contracts';

/**
 * TRANSACTION RESULT
 */
export interface TransactionResult {
  hash: `0x${string}`;
  success: boolean;
  error?: string;
}

/**
 * RAW CONTRACT DATA TYPES
 * These match the exact struct formats returned by contracts
 */

export interface NewsContractData {
  creator: Address;              // address
  title: string;                 // string
  description: string;           // string
  category: string;              // string
  resolutionCriteria: string;    // string
  createdAt: bigint;             // uint256
  resolveTime: bigint;           // uint256
  status: number;                // NewsStatus enum (0=Active, 1=Resolved)
  outcome: number;               // Outcome enum (0=None, 1=YES, 2=NO)
  totalPools: bigint;            // uint256
  totalStaked: bigint;           // uint256
}

export interface NewsResolutionContractData {
  resolvedAt: bigint;            // uint256
  resolvedBy: Address;           // address
  resolutionSource: string;      // string
  resolutionNotes: string;       // string
}

export interface PoolContractData {
  creator: Address;              // address
  reasoning: string;             // string
  evidenceLinks: string[];       // string[]
  imageUrl: string;              // string
  imageCaption: string;          // string
  position: boolean;            // Position as boolean (true=YES, false=NO)
  creatorStake: bigint;          // uint256
  totalStaked: bigint;           // uint256
  agreeStakes: bigint;           // uint256
  disagreeStakes: bigint;        // uint256
  createdAt: bigint;             // uint256
  isResolved: boolean;           // bool
  isCorrect: boolean;            // bool
}

export interface ReputationContractData {
  reputationPoints: bigint;
  lastUpdated: bigint;
  totalPredictions: bigint;
  correctPredictions: bigint;
  tier: bigint;
  tierName: string;
  accuracy: bigint;
}

export interface StakeContractData {
  amount: bigint;
  position: boolean;
  timestamp: bigint;
  isWithdrawn: boolean;
}

export interface PoolStakeStatsContractData {
  total: bigint;
  agree: bigint;
  disagree: bigint;
  stakerCount: bigint;
}

