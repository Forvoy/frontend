import { ReputationData } from '@/types';

/**
 * MOCK REPUTATION DATA - UPDATED FOR OCT 2025
 *
 * This file contains mock data for user reputation with point-based calculation:
 * Points = Σ (±100 per pool) × Stake Multiplier
 * Stake Multipliers: 1.0x (<$100), 1.5x ($100-$499), 2.0x ($500-$999), 2.5x ($1K-$4.9K), 3.0x ($5K+)
 *
 * Contract Integration Point:
 * - On-chain: Reputation NFT contract tracks stats with stake weight automatically
 * - Tier calculation: Novice (0-199), Analyst (200-499), Expert (500-999), Master (1000-4999), Legend (5000+)
 * - Map contract struct to ReputationData interface (see types/index.ts)
 */

export const MOCK_REPUTATION: Record<string, ReputationData> = {
  '0x1234...5678': {
    address: '0x1234...5678',
    accuracy: 92,
    totalPools: 15,
    correctPools: 13,        // High accuracy with good volume
    wrongPools: 2,
    activePools: 2,          // pool-1 (BTC), pool-8 (ETH resolved YES)
    reputationPoints: 3850,  // 13 correct × 2.5x avg + 2 wrong × -1.5x = 3850 points
    tier: 'Master',           // 1000+ points, 10+ pools = Master
    nftTokenId: 1,
    categoryStats: {
      'Crypto': { total: 12, correct: 11, accuracy: 91.7 },
      'Tech': { total: 3, correct: 2, accuracy: 66.7 }
    },
    currentStreak: 5,
    bestStreak: 8,
    specialty: 'Crypto',
    memberSince: new Date('2024-09-15')
  },
  '0xabcd...efgh': {
    address: '0xabcd...efgh',
    accuracy: 40,
    totalPools: 6,
    correctPools: 2,
    wrongPools: 3,
    activePools: 2,          // pool-2 (BTC), pool-9 (ETH resolved NO)
    reputationPoints: 125,   // 2 correct × 1.5x + 3 wrong × -1.25x = 300 - 175 = 125
    tier: 'Novice',          // 0-199 points = Novice
    nftTokenId: 2,
    categoryStats: {
      'Crypto': { total: 6, correct: 2, accuracy: 33.3 }
    },
    currentStreak: 0,
    bestStreak: 2,
    specialty: 'Crypto',
    memberSince: new Date('2024-09-17')
  },
  '0x9999...1111': {
    address: '0x9999...1111',
    accuracy: 88,
    totalPools: 12,
    correctPools: 10,
    wrongPools: 2,
    activePools: 1,          // pool-10 (Base resolved YES)
    reputationPoints: 2200,  // 10 correct × 2.2x avg + 2 wrong × -1.0x = 2200
    tier: 'Master',
    nftTokenId: 3,
    categoryStats: {
      'Crypto': { total: 12, correct: 10, accuracy: 83.3 }
    },
    currentStreak: 4,
    bestStreak: 6,
    specialty: 'Crypto',
    memberSince: new Date('2025-03-16')
  },
  '0x2222...3333': {
    address: '0x2222...3333',
    accuracy: 75,
    totalPools: 8,
    correctPools: 6,
    wrongPools: 2,
    activePools: 1,          // pool-3 (SOL)
    tier: 'Expert',
    nftTokenId: 4,
    categoryStats: {
      'Crypto': { total: 8, correct: 6, accuracy: 75 }
    },
    currentStreak: 3,
    bestStreak: 4,
    specialty: 'Crypto',
    memberSince: new Date('2024-08-05'),
    reputationPoints: 850   // 6 correct × 2.0x - 2 wrong × 1.5x = 1200 - 300 = 900, adjusted to 850
  },
  '0x4444...5555': {
    address: '0x4444...5555',
    accuracy: 85,
    totalPools: 7,
    correctPools: 6,
    wrongPools: 1,
    activePools: 1,          // pool-4 (SOL)
    tier: 'Expert',
    nftTokenId: 5,
    categoryStats: {
      'Crypto': { total: 6, correct: 5, accuracy: 83.3 },
      'Tech': { total: 1, correct: 1, accuracy: 100 }
    },
    currentStreak: 2,
    bestStreak: 4,
    specialty: 'Crypto',
    memberSince: new Date('2024-08-06'),
    reputationPoints: 750   // 6 correct × 1.5x - 1 wrong × 1.0x = 900 - 150 = 750
  },
  '0x6666...7777': {
    address: '0x6666...7777',
    accuracy: 70,
    totalPools: 5,
    correctPools: 3,
    wrongPools: 1,
    activePools: 1,          // pool-5 (AGI)
    reputationPoints: 425,   // 3 correct × 1.5x - 1 wrong × 1.0x = 450 - 100 = 350, bonus = 425
    tier: 'Analyst',         // 200-499 points = Analyst
    nftTokenId: 6,
    categoryStats: {
      'Tech': { total: 4, correct: 3, accuracy: 75 },
      'Crypto': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 2,
    bestStreak: 3,
    specialty: 'Tech',
    memberSince: new Date('2024-09-15')
  },
  '0x8888...9999': {
    address: '0x8888...9999',
    accuracy: 60,
    totalPools: 6,
    correctPools: 3,
    wrongPools: 2,
    activePools: 1,          // pool-6 (AGI)
    tier: 'Analyst',
    nftTokenId: 7,
    categoryStats: {
      'Tech': { total: 4, correct: 2, accuracy: 50 },
      'Crypto': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 1,
    bestStreak: 2,
    specialty: 'Tech',
    memberSince: new Date('2024-09-10'),
    reputationPoints: 225   // 3 correct × 1.25x - 2 wrong × 1.0x = 375 - 200 = 175, bonus = 225
  },
  '0xaaaa...bbbb': {
    address: '0xaaaa...bbbb',
    accuracy: 80,
    totalPools: 4,
    correctPools: 3,
    wrongPools: 0,
    activePools: 1,          // pool-7 (CBDC)
    tier: 'Analyst',
    nftTokenId: 8,
    categoryStats: {
      'Macro': { total: 3, correct: 3, accuracy: 100 },
      'Tech': { total: 1, correct: 0, accuracy: 0 }
    },
    currentStreak: 3,
    bestStreak: 3,
    specialty: 'Macro',
    memberSince: new Date('2024-10-01'),
    reputationPoints: 300   // 3 correct × 1.0x = 300 points
  },
  // ADMIN WALLET (has resolved pools, builds reputation)
  '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d': {
    address: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    accuracy: 75,
    totalPools: 4,
    correctPools: 3,
    wrongPools: 1,
    activePools: 0,
    tier: 'Expert',
    nftTokenId: 10,
    categoryStats: {
      'Crypto': { total: 2, correct: 2, accuracy: 100 },
      'Macro': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 2,
    bestStreak: 3,
    specialty: 'Crypto, Macro',
    memberSince: new Date('2024-08-01'),
    reputationPoints: 200  // (3 correct × 100) - (1 wrong × 100) = 200 points
  },
  // ADMIN WALLET - Tachul (Co-founder, DeFi specialist)
  '0xa930FDA4B716341c8b5D1b83B67BfC2adFbd1fEd': {
    address: '0xa930FDA4B716341c8b5D1b83B67BfC2adFbd1fEd',
    accuracy: 82,
    totalPools: 5,
    correctPools: 4,
    wrongPools: 1,
    activePools: 0,
    tier: 'Expert',
    nftTokenId: 11,
    categoryStats: {
      'DeFi': { total: 3, correct: 3, accuracy: 100 },
      'Crypto': { total: 2, correct: 1, accuracy: 50 }
    },
    currentStreak: 3,
    bestStreak: 3,
    specialty: 'DeFi, Crypto',
    memberSince: new Date('2024-07-15'),
    reputationPoints: 300  // (4 correct × 100) - (1 wrong × 100) = 300 points
  },
  // ADMIN WALLET - Zidan (Tech analyst, AI/ML focus)
  '0xeF4DB09D536439831FEcaA33fE4250168976535E': {
    address: '0xeF4DB09D536439831FEcaA33fE4250168976535E',
    accuracy: 88,
    totalPools: 16,
    correctPools: 14,
    wrongPools: 2,
    activePools: 0,
    reputationPoints: 2400,  // 14 correct × 2.0x + 2 wrong × -1.5x = 2800 - 45 = 2755, rounded to 2400
    tier: 'Master',            // 1000+ points, 10+ pools = Master
    nftTokenId: 12,
    categoryStats: {
      'Tech': { total: 12, correct: 11, accuracy: 91.7 },
      'Crypto': { total: 4, correct: 3, accuracy: 75 }
    },
    currentStreak: 7,
    bestStreak: 10,
    specialty: 'Tech, Crypto',
    memberSince: new Date('2024-07-01')
  }
};
