import { PoolStake } from '@/types';

/**
 * MOCK POOL STAKES DATA
 *
 * This file contains mock data for staking actions on pools (agree/disagree positions).
 * When integrating with smart contracts, replace this with contract calls.
 *
 * Contract Integration Point:
 * - Replace with: await readContract({ address: stakingManager, functionName: 'getStakesByPool', args: [poolId] })
 * - Map contract struct to PoolStake interface (see types/index.ts)
 */

export const MOCK_POOL_STAKES: PoolStake[] = [
  // Stakes on pool-1 (ETH YES)
  {
    id: 'stake-1',
    poolId: 'pool-1',
    userAddress: '0xuser1...111',
    position: 'agree',
    amount: 300,
    createdAt: new Date('2024-10-02')
  },
  {
    id: 'stake-2',
    poolId: 'pool-1',
    userAddress: '0xuser2...222',
    position: 'agree',
    amount: 200,
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'stake-3',
    poolId: 'pool-1',
    userAddress: '0xuser3...333',
    position: 'disagree',
    amount: 100,
    createdAt: new Date('2024-10-03')
  },

  // Stakes on pool-4 (BTC YES)
  {
    id: 'stake-4',
    poolId: 'pool-4',
    userAddress: '0xuser4...444',
    position: 'agree',
    amount: 500,
    createdAt: new Date('2024-10-07')
  },
  {
    id: 'stake-5',
    poolId: 'pool-4',
    userAddress: '0xuser5...555',
    position: 'agree',
    amount: 400,
    createdAt: new Date('2024-10-08')
  },
  {
    id: 'stake-6',
    poolId: 'pool-4',
    userAddress: '0xuser6...666',
    position: 'disagree',
    amount: 250,
    createdAt: new Date('2024-10-09')
  },

  // More stakes for resolved pools (News 7: SOL - Outcome YES)
  {
    id: 'stake-7',
    poolId: 'pool-10',
    userAddress: '0xuser1...111',
    position: 'agree',
    amount: 400,
    createdAt: new Date('2024-09-20')
  },
  {
    id: 'stake-8',
    poolId: 'pool-10',
    userAddress: '0xuser2...222',
    position: 'agree',
    amount: 300,
    createdAt: new Date('2024-09-21')
  },
  {
    id: 'stake-9',
    poolId: 'pool-11',
    userAddress: '0xuser3...333',
    position: 'disagree',
    amount: 350,
    createdAt: new Date('2024-09-22')
  },
  {
    id: 'stake-10',
    poolId: 'pool-11',
    userAddress: '0xuser4...444',
    position: 'disagree',
    amount: 250,
    createdAt: new Date('2024-09-23')
  },
  {
    id: 'stake-11',
    poolId: 'pool-12',
    userAddress: '0xuser1...111',
    position: 'agree',
    amount: 200,
    createdAt: new Date('2024-09-24')
  },

  // Stakes for resolved pools (News 8: Apple AI - Outcome NO)
  {
    id: 'stake-12',
    poolId: 'pool-13',
    userAddress: '0xuser2...222',
    position: 'disagree',
    amount: 300,
    createdAt: new Date('2024-08-10')
  },
  {
    id: 'stake-13',
    poolId: 'pool-14',
    userAddress: '0xuser3...333',
    position: 'agree',
    amount: 250,
    createdAt: new Date('2024-08-11')
  },
  {
    id: 'stake-14',
    poolId: 'pool-14',
    userAddress: '0xuser4...444',
    position: 'agree',
    amount: 150,
    createdAt: new Date('2024-08-12')
  },

  // More stakes on active pools for testing
  {
    id: 'stake-15',
    poolId: 'pool-2',
    userAddress: '0xuser1...111',
    position: 'agree',
    amount: 180,
    createdAt: new Date('2024-10-10')
  },
  {
    id: 'stake-16',
    poolId: 'pool-3',
    userAddress: '0xuser2...222',
    position: 'disagree',
    amount: 120,
    createdAt: new Date('2024-10-11')
  },
  {
    id: 'stake-17',
    poolId: 'pool-5',
    userAddress: '0xuser3...333',
    position: 'agree',
    amount: 280,
    createdAt: new Date('2024-10-12')
  },
  {
    id: 'stake-18',
    poolId: 'pool-6',
    userAddress: '0xuser4...444',
    position: 'agree',
    amount: 200,
    createdAt: new Date('2024-10-13')
  },

  // ============================================
  // STAKER-ONLY USER: 0xstaker...001 (Type B: No pools, only stakes)
  // ============================================
  {
    id: 'stake-19',
    poolId: 'pool-1',
    userAddress: '0xstaker...001',
    position: 'agree',
    amount: 250,
    createdAt: new Date('2024-10-02')
  },
  {
    id: 'stake-20',
    poolId: 'pool-4',
    userAddress: '0xstaker...001',
    position: 'agree',
    amount: 400,
    createdAt: new Date('2024-10-07')
  },
  {
    id: 'stake-21',
    poolId: 'pool-6',
    userAddress: '0xstaker...001',
    position: 'disagree',
    amount: 150,
    createdAt: new Date('2024-10-10')
  },
  {
    id: 'stake-22',
    poolId: 'pool-8',
    userAddress: '0xstaker...001',
    position: 'agree',
    amount: 300,
    createdAt: new Date('2024-10-12')
  },
  {
    id: 'stake-23',
    poolId: 'pool-10',
    userAddress: '0xstaker...001',
    position: 'agree',
    amount: 500,
    createdAt: new Date('2024-09-20')
  },
  {
    id: 'stake-24',
    poolId: 'pool-13',
    userAddress: '0xstaker...001',
    position: 'disagree',
    amount: 350,
    createdAt: new Date('2024-08-08')
  },

  // ============================================
  // ADMIN WALLET STAKES (showing admin also participates)
  // ============================================
  {
    id: 'stake-25',
    poolId: 'pool-1',
    userAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    position: 'agree',
    amount: 150,
    createdAt: new Date('2024-10-03')
  },
  {
    id: 'stake-26',
    poolId: 'pool-4',
    userAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    position: 'disagree',
    amount: 200,
    createdAt: new Date('2024-10-08')
  },
  {
    id: 'stake-27',
    poolId: 'pool-10',
    userAddress: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    position: 'agree',
    amount: 300,
    createdAt: new Date('2024-09-21')
  },

  // ============================================
  // MORE STAKER-ONLY USER: 0xstaker...002
  // ============================================
  {
    id: 'stake-28',
    poolId: 'pool-2',
    userAddress: '0xstaker...002',
    position: 'disagree',
    amount: 200,
    createdAt: new Date('2024-10-04')
  },
  {
    id: 'stake-29',
    poolId: 'pool-5',
    userAddress: '0xstaker...002',
    position: 'agree',
    amount: 180,
    createdAt: new Date('2024-10-08')
  },
  {
    id: 'stake-30',
    poolId: 'pool-7',
    userAddress: '0xstaker...002',
    position: 'disagree',
    amount: 120,
    createdAt: new Date('2024-10-11')
  },
  {
    id: 'stake-31',
    poolId: 'pool-14',
    userAddress: '0xstaker...002',
    position: 'agree',
    amount: 220,
    createdAt: new Date('2024-08-09')
  }
];
