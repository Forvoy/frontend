import { Pool } from '@/types';

/**
 * MOCK POOLS DATA - UPDATED FOR OCT 2025
 *
 * This file contains mock data for POOL entities with 20/80 reward split logic:
 * - Creator gets 20% of remaining pool (after 2% fee)
 * - Winning stakers get 80% of remaining pool
 * - Creator excluded from staker pool calculations
 * - Rewards auto-distributed on resolution
 *
 * Contract Integration Point:
 * - Replace with: await readContract({ address: poolFactory, functionName: 'getPoolsByNews', args: [newsId] })
 * - Map contract struct to Pool interface (see types/index.ts)
 */

export const MOCK_POOLS: Pool[] = [
  // Pools for NEWS 1: "BTC will reach $150,000 before end of 2025"
  {
    id: 'pool-1',
    newsId: '1',
    creatorAddress: '0x1234...5678',
    position: 'YES',
    reasoning: 'Bitcoin institutional adoption accelerating with multiple nation-states adding BTC to reserves. MicroStrategy continues aggressive accumulation strategy. ETF inflows remain strong at $2B+ monthly. Post-halving supply shock combined with increasing demand creates perfect storm for $150K target.',
    evidence: [
      'https://example.com/institutional-btc-adoption',
      'https://example.com/nation-state-reserves',
      'https://example.com/etf-flow-data'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800',
    imageCaption: 'Bitcoin Institutional Adoption Curve',
    creatorStake: 500,
    agreeStakes: 500,    // FIXED: Creator stake in agreeStakes for YES pool
    disagreeStakes: 3200,
    totalStaked: 3700,  // FIXED: 500 (creator) + 3200 (disagree) = 3700
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-16'),
    farcasterCastHash: 'cast-btc-150k-yes-1'
  },
  {
    id: 'pool-2',
    newsId: '1',
    creatorAddress: '0xabcd...efgh',
    position: 'NO',
    reasoning: '$150K is extremely optimistic in current macro environment. Federal Reserve still hawkish on inflation. Global economic uncertainty with potential recession in 2026. Historical cycles suggest post-halving peaks take 12-18 months. Technical resistance at $120K level very strong.',
    evidence: [
      'https://example.com/fed-policy-outlook',
      'https://example.com/recession-indicators',
      'https://example.com/btc-technical-resistance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800',
    imageCaption: 'BTC Technical Resistance Analysis',
    creatorStake: 300,
    agreeStakes: 300,    // FIXED: Creator stake in agreeStakes for YES pool
    disagreeStakes: 8900,
    totalStaked: 9200,  // FIXED: 300 (creator) + 8900 (disagree) = 9200
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-17')
  },

  // Pools for NEWS 2: "Solana will flip Ethereum by market cap in 2026"
  {
    id: 'pool-3',
    newsId: '2',
    creatorAddress: '0x2222...3333',
    position: 'YES',
    reasoning: 'Solana ecosystem exploding with massive DeFi migration due to sub-penny fees. Jupiter DEX volume rivaling Uniswap. Mobile-first strategy with Saga phones driving consumer adoption. Institutional interest growing with Solana ETF filings. Developer activity at all-time highs.',
    evidence: [
      'https://example.com/solana-dex-volume',
      'https://example.com/saga-adoption',
      'https://example.com/developer-metrics'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800',
    imageCaption: 'Solana Ecosystem Growth Analysis',
    creatorStake: 800,
    agreeStakes: 800,    // FIXED: Creator stake in agreeStakes for YES pool
    disagreeStakes: 6200,
    totalStaked: 7000,  // FIXED: 800 (creator) + 6200 (disagree) = 7000
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-19'),
    farcasterCastHash: 'cast-sol-flip-yes-1'
  },
  {
    id: 'pool-4',
    newsId: '2',
    creatorAddress: '0x4444...5555',
    position: 'NO',
    reasoning: 'Ethereum still has significant advantages: largest developer ecosystem, most institutional DeFi protocols, established network effects. ETH 2.0 scaling solutions maturing rapidly. Solana still faces occasional network congestion. Market cap flip would require 10x SOL price increase - unrealistic by 2026.',
    evidence: [
      'https://example.com/eth-developer-metrics',
      'https://example.com/defi-protocol-distribution'
    ],
    creatorStake: 600,
    agreeStakes: 12800,
    disagreeStakes: 22000,
    totalStaked: 35400,
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-20')
  },

  // Pools for NEWS 3: "OpenAI will achieve AGI before 2027"
  {
    id: 'pool-5',
    newsId: '3',
    creatorAddress: '0x6666...7777',
    position: 'YES',
    reasoning: 'GPT-5 showing breakthrough reasoning capabilities approaching human-level performance. OpenAI recently achieved AGI internally according to leaks. Scaling laws suggest next model iteration will cross AGI threshold. Competition driving faster development cycles.',
    evidence: [
      'https://example.com/gpt5-benchmarks',
      'https://example.com/agi-scaling-laws',
      'https://example.com/openai-leaks'
    ],
    creatorStake: 1200,
    agreeStakes: 1200,   // FIXED: Creator stake in agreeStakes for YES pool
    disagreeStakes: 18000,
    totalStaked: 19200, // FIXED: 1200 (creator) + 18000 (disagree) = 19200
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-21')
  },
  {
    id: 'pool-6',
    newsId: '3',
    creatorAddress: '0x8888...9999',
    position: 'NO',
    reasoning: 'AGI is still years away despite recent advances. Current AI models lack true understanding and reasoning. Safety concerns will slow development significantly. Regulatory oversight increasing globally. True AGI requires breakthrough innovations not just scaling current architectures.',
    evidence: [
      'https://example.com/agi-limitations',
      'https://example.com/safety-concerns',
      'https://example.com/regulatory-oversight'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    imageCaption: 'AGI Development Timeline Analysis',
    creatorStake: 800,
    agreeStakes: 15000,
    disagreeStakes: 29200,
    totalStaked: 45000,
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-21')
  },

  // Pools for NEWS 4: "US will launch Central Bank Digital Currency (CBDC) in 2026"
  {
    id: 'pool-7',
    newsId: '4',
    creatorAddress: '0xaaaa...bbbb',
    position: 'YES',
    reasoning: 'Fed Chair Powell increasingly positive on digital dollar. China CBDC success creating competitive pressure. EU digital euro moving forward rapidly. Congressional bipartisan support growing. Pilot programs expanding nationwide.',
    evidence: [
      'https://example.com/fed-cbdc-pilots',
      'https://example.com/congress-support',
      'https://example.com/global-cbdc-trends'
    ],
    creatorStake: 400,
    agreeStakes: 8000,
    disagreeStakes: 5600,
    totalStaked: 14000,
    status: 'active',
    outcome: null,
    createdAt: new Date('2025-10-22')
  },

  // ============================================
  // RESOLVED POOLS (for testing)
  // ============================================
  
  // Pools for NEWS 7: "ETH will reach $4,500 before October 2025" - RESOLVED YES
  {
    id: 'pool-8',
    newsId: '7',
    creatorAddress: '0x1234...5678',
    position: 'YES',
    reasoning: 'Ethereum ETF approval creating sustained buying pressure. Layer 2 adoption accelerating with Arbitrum and Optimism seeing record TVL. DeFi protocols showing strong growth. Technical analysis supports breakout above $4,000 resistance.',
    evidence: [
      'https://example.com/eth-etf-inflows',
      'https://example.com/l2-tvl-growth',
      'https://example.com/defi-metrics'
    ],
    creatorStake: 400,
    agreeStakes: 12000,
    disagreeStakes: 3200,
    totalStaked: 15600,
    status: 'resolved',
    outcome: 'creator_correct',
    resolvedAt: new Date('2025-09-28'),
    createdAt: new Date('2025-07-02'),
    autoDistributed: true,
    rewardTxHash: '0xabc123...789xyz',
    creatorReward: 3058, // 20% of remaining pool (15600 - 312 fee = 15288, ×20% = 3058)
    stakerRewardsDistributed: 12230 // 80% of remaining pool
  },
  {
    id: 'pool-9',
    newsId: '7',
    creatorAddress: '0xabcd...efgh',
    position: 'NO',
    reasoning: 'Macro environment still challenging with high interest rates. Strong resistance at $4,200 level historically difficult to break. Market cycle suggests consolidation phase through Q3.',
    evidence: [
      'https://example.com/macro-analysis',
      'https://example.com/eth-resistance-levels'
    ],
    creatorStake: 300,
    agreeStakes: 5000,
    disagreeStakes: 13900,
    totalStaked: 19200,
    status: 'resolved',
    outcome: 'creator_wrong',
    resolvedAt: new Date('2025-09-28'),
    createdAt: new Date('2025-07-05'),
    autoDistributed: true,
    rewardTxHash: '0xdef456...123abc',
    creatorReward: 0, // Creator gets nothing when wrong
    stakerRewardsDistributed: 18816 // 98% of pool (19200 - 384 fee = 18816) goes to disagree stakers
  },

  // Pools for NEWS 9: "Base will become top 3 blockchain by TVL in 2025" - RESOLVED YES
  {
    id: 'pool-10',
    newsId: '9',
    creatorAddress: '0x9999...1111',
    position: 'YES',
    reasoning: 'Coinbase integration driving massive user onboarding. Major DeFi protocols deploying on Base. Low fees attracting retail users. Institutional adoption through Coinbase Prime.',
    evidence: [
      'https://example.com/base-growth',
      'https://example.com/coinbase-integration'
    ],
    creatorStake: 800,
    agreeStakes: 18000,
    disagreeStakes: 8400,
    totalStaked: 27200,
    status: 'resolved',
    outcome: 'creator_correct',
    resolvedAt: new Date('2025-09-28'),
    createdAt: new Date('2025-03-16'),
    autoDistributed: true,
    rewardTxHash: '0x123abc...456def',
    creatorReward: 5320, // 20% of remaining pool
    stakerRewardsDistributed: 21280 // 80% of remaining pool
  }
];