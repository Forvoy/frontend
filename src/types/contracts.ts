/**
 * Contract Types and Interfaces
 * Public interfaces for smart contract integration
 */

// Basic blockchain types
export type Hash = `0x${string}`;
export type Address = `0x${string}`;

// Contract configuration
export interface ContractConfig {
  address: Address;
  abi: readonly unknown[];
}

// Contract addresses configuration
export interface ContractAddresses {
  forter: Address;
  reputationNFT: Address;
  stakingPool: Address;
  governance: Address;
  token: Address;
}

// Integration configuration
export interface IntegrationConfig {
  USE_CONTRACTS: boolean;
  USDC_DECIMALS: number;
  MIN_STAKE_AMOUNT: number;
  NEWS_DEPOSIT: number;
  PLATFORM_FEE_PERCENT: number;
  CHAIN_ID: number;
  BLOCK_EXPLORER: string;
  DEFAULT_GAS_LIMIT: bigint;
  TRANSACTION_TIMEOUT: number;
}

// Contract function result types
export interface NewsContractData {
  creator: Address;
  title: string;
  description: string;
  category: string;
  resolutionCriteria: string;
  createdAt: bigint;
  resolveTime: bigint;
  isResolved: boolean;
  outcome: boolean;
  totalPools: bigint;
  totalStaked: bigint;
}

export interface PoolContractData {
  creator: Address;
  reasoning: string;
  evidenceLinks: string[];
  imageUrl: string;
  imageCaption: string;
  position: boolean; // true = YES, false = NO
  creatorStake: bigint;
  totalStaked: bigint;
  agreeStakes: bigint;
  disagreeStakes: bigint;
  createdAt: bigint;
  isResolved: boolean;
  isCorrect: boolean;
}

export interface ReputationContractData {
  score: bigint;
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

// Transaction types
export interface TransactionResult {
  hash: Hash;
  success: boolean;
  error?: string;
}

export interface ContractCall<T = unknown> {
  address: Address;
  abi: readonly unknown[];
  functionName: string;
  args?: unknown[];
  result?: T;
}

// Contract validation
export interface ContractValidation {
  isValid: boolean;
  missing: string[];
  errors: string[];
}