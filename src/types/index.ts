// ============================================
// MODEL B: News + Pool Architecture (NEW)
// ============================================

import type { Address } from './contracts';

// NEWS = User-created prediction/statement
export interface News {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: Date;
  resolutionCriteria: string;  // Clear outcome criteria
  creatorAddress: string;       // Who created the news
  createdAt: Date;
  status: 'active' | 'resolved' | 'disputed' | 'closed';
  totalPools: number;           // Count of pools under this news
  totalStaked: number;          // Aggregate from all pools

  // Quality metrics (calculated dynamically)
  qualityScore?: number;        // 0-100 quality score
  avgPoolQuality?: number;      // Average quality of pools

  // Resolution fields (added when resolved)
  outcome?: 'YES' | 'NO';       // Final outcome
  resolvedAt?: Date;            // When it was resolved
  resolvedBy?: string;          // Admin wallet that resolved
  resolutionSource?: string;    // URL to data source (e.g., CoinGecko)
  resolutionNotes?: string;     // Optional admin notes
}

// POOL = Analysis with independent stake pool
export interface Pool {
  id: string;
  newsId: string;               // Parent NEWS
  creatorAddress: string;
  position: 'YES' | 'NO';
  reasoning: string;
  evidence: string[];

  // Visual evidence support (MVP: URL-based)
  imageUrl?: string;            // Optional chart/image
  imageCaption?: string;        // Optional description

  creatorStake: number;         // Pool creator's initial stake

  // Independent stake pool
  agreeStakes: number;          // "Agree" total
  disagreeStakes: number;       // "Disagree" total
  totalStaked: number;          // agreeStakes + disagreeStakes + creatorStake

  // Quality metrics (calculated dynamically)
  qualityScore?: number;        // 0-100 quality score

  // Resolution
  status: 'active' | 'resolved';
  outcome: 'creator_correct' | 'creator_wrong' | null;
  resolvedAt?: Date;           // NEW: When pool was resolved
  autoDistributed?: boolean;   // NEW: Whether rewards were auto-distributed
  rewardTxHash?: string;       // NEW: Transaction hash for auto-distribute
  creatorReward?: number;      // NEW: Amount creator received (if correct)
  stakerRewardsDistributed?: number; // NEW: Total distributed to stakers

  createdAt: Date;
  farcasterCastHash?: string;
}

// POOL STAKE = User's stake on a specific pool
export interface PoolStake {
  id: string;
  poolId: string;
  userAddress: string;
  position: 'agree' | 'disagree'; // Agree or Disagree
  amount: number;
  createdAt: Date;
}

// ============================================
// Legacy types removed - using News/Pool model only
// ============================================

// ============================================
// SHARED TYPES (Used by both models)
// ============================================

// Reputation Types (calculated from pool creation performance only)
export interface ReputationData {
  address: string;
  accuracy: number;             // Percentage from pool creation (0-100)
  totalPools: number;           // Total pools created
  correctPools: number;         // Correct pools
  wrongPools: number;           // Wrong pools
  activePools: number;          // Unresolved pools
  reputationPoints: number;     // NEW! Point-based score with stake weight (used for tier calculation)
  tier: 'Novice' | 'Analyst' | 'Expert' | 'Master' | 'Legend';
  nftTokenId?: number;
  categoryStats: Record<string, { total: number; correct: number; accuracy: number }>;
  currentStreak?: number;       // Consecutive correct predictions
  bestStreak?: number;          // Best streak ever
  specialty?: string;           // Best category
  memberSince?: Date;           // First pool creation date
  lastActive?: Date;            // Last reputation update (from contract)
}

// Legacy StakePosition type removed - using PoolStake only

// User Types (universal - no role distinction)
export interface User {
  address: string;
  fid?: number;
  username?: string;
  pfpUrl?: string;
  bio?: string;

  // Reputation (from pool creation)
  reputation?: ReputationData;

  // Pool Creation Stats
  totalPoolsCreated: number;
  poolsWon: number;
  poolsLost: number;
  poolsActive: number;

  // Staking Stats (tracked separately, doesn't affect tier)
  totalStakes: number;
  stakesWon: number;
  stakesLost: number;
  stakesActive: number;

  // News Creation
  totalNewsCreated: number;

  // Earnings (private, only shown to owner)
  totalEarned: number;          // Total earnings from pools + stakes
  earningsFromPools: number;    // Earnings from pool creation
  earningsFromStakes: number;   // Earnings from staking
}

// Staking History Stats (for transparency, doesn't affect tier)
export interface StakingStats {
  totalStakes: number;
  wonStakes: number;
  lostStakes: number;
  winRate: number;              // Percentage (0-100)
  totalStaked: number;          // Total USDC staked
  totalEarnings: number;        // Total earnings from stakes
}

// ============================================
// FORM INPUT TYPES (for creation flows)
// ============================================

export interface CreateNewsInput {
  title: string;
  description: string;
  category: string;
  endDate: Date;
  resolutionCriteria: string;
}

export interface CreatePoolInput {
  newsId: string;
  position: 'YES' | 'NO';
  reasoning: string;
  evidence: string[];
  imageUrl?: string;
  imageCaption?: string;
  creatorStake: number;
}

export interface StakeInput {
  newsId: string;
  poolId: string;
  position: 'agree' | 'disagree';
  amount: number;
  userAddress: Address;
}

// Resolution Input (for admin)
export interface ResolveNewsInput {
  newsId: string;
  outcome: 'YES' | 'NO';
  resolutionSource: string;     // URL to data source
  resolutionNotes?: string;     // Optional notes
  resolvedBy: string;           // Admin wallet address
}