import { News } from '@/types';

/**
 * MOCK NEWS DATA
 *
 * This file contains mock data for NEWS entities.
 * When integrating with smart contracts, replace this with contract calls.
 *
 * Contract Integration Point:
 * - Replace with: await readContract({ address: newsFactory, functionName: 'getAllNews' })
 * - Map contract struct to News interface (see types/index.ts)
 */

export const MOCK_NEWS: News[] = [
  {
    id: '1',
    title: 'BTC will reach $150,000 before end of 2025',
    description: 'Bitcoin continues its institutional adoption with multiple countries adding BTC to reserves. ETF inflows remain strong and halving effects from 2024 are still driving price momentum. Considering MicroStrategy expansions and corporate treasury adoption.',
    category: 'Crypto',
    endDate: new Date('2025-12-31'),
    resolutionCriteria: 'BTC price >= $150,000 on CoinGecko at Dec 31, 2025 23:59 UTC',
    creatorAddress: '0xabc...123',
    createdAt: new Date('2025-10-15'),
    status: 'active',
    totalPools: 8,
    totalStaked: 45200
  },
  {
    id: '2', 
    title: 'Solana will flip Ethereum by market cap in 2026',
    description: 'Solana ecosystem growth accelerating with major DeFi protocols migrating due to lower fees and faster throughput. Mobile adoption through Saga phones and Jupiter DEX expansion driving massive user growth.',
    category: 'Crypto',
    endDate: new Date('2026-12-31'),
    resolutionCriteria: 'SOL market cap > ETH market cap on CoinGecko',
    creatorAddress: '0xdef...456',
    createdAt: new Date('2025-10-18'),
    status: 'active',
    totalPools: 12,
    totalStaked: 67800
  },
  {
    id: '3',
    title: 'OpenAI will achieve AGI before 2027',
    description: 'Following GPT-5 release and breakthrough reasoning capabilities, OpenAI is reportedly close to achieving Artificial General Intelligence. Considering current o1 model performance and scaling laws.',
    category: 'Tech',
    endDate: new Date('2026-12-31'),
    resolutionCriteria: 'OpenAI officially announces AGI achievement or passes comprehensive AGI benchmarks',
    creatorAddress: '0x789...abc',
    createdAt: new Date('2025-10-20'),
    status: 'active',
    totalPools: 15,
    totalStaked: 89000
  },
  {
    id: '4',
    title: 'US will launch Central Bank Digital Currency (CBDC) in 2026',
    description: 'Fed Chair Powell signals serious CBDC consideration following China and EU digital currency adoption. Digital dollar pilot programs expanding and Congress showing bipartisan support.',
    category: 'Macro',
    endDate: new Date('2026-12-31'),
    resolutionCriteria: 'Official US CBDC launched for public use',
    creatorAddress: '0x321...def',
    createdAt: new Date('2025-10-21'),
    status: 'active',
    totalPools: 6,
    totalStaked: 23400
  },
  {
    id: '5',
    title: 'Tesla will reach $500 per share by Q2 2026',
    description: 'Tesla FSD achieving true autonomy and robotaxi network launch driving massive revenue growth. Energy storage business expanding globally with Megapack deployments accelerating.',
    category: 'Tech',
    endDate: new Date('2026-06-30'),
    resolutionCriteria: 'TSLA stock price >= $500 on any trading day in Q2 2026',
    creatorAddress: '0x654...987',
    createdAt: new Date('2025-10-19'),
    status: 'active',
    totalPools: 9,
    totalStaked: 34500
  },
  {
    id: '6',
    title: 'Ethereum Layer 2s will process 100M+ transactions daily',
    description: 'Arbitrum, Optimism, Polygon, and Base collectively processing massive transaction volumes as DeFi and NFT adoption reaches mainstream levels with sub-cent transaction costs.',
    category: 'Crypto',
    endDate: new Date('2026-03-31'),
    resolutionCriteria: 'Combined daily transactions across major L2s >= 100 million',
    creatorAddress: '0x111...222',
    createdAt: new Date('2025-10-16'),
    status: 'active',
    totalPools: 7,
    totalStaked: 28900
  },
  {
    id: '10',
    title: 'Apple Vision Pro 2 will launch before WWDC 2026',
    description: 'Second generation Apple Vision Pro with improved resolution, lighter weight, and longer battery life. Considering supply chain reports and Apple development cycles.',
    category: 'Tech',
    endDate: new Date('2026-06-01'),
    resolutionCriteria: 'Apple officially announces Vision Pro 2 before WWDC 2026',
    creatorAddress: '0x444...555',
    createdAt: new Date('2025-10-20'),
    status: 'active',
    totalPools: 4,
    totalStaked: 16800
  },
  {
    id: '11',
    title: 'Polymarket will reach $10B in annual volume by 2026',
    description: 'Prediction market growth following mainstream adoption and regulatory clarity in key jurisdictions. Political betting and financial events driving massive engagement.',
    category: 'Crypto',
    endDate: new Date('2026-12-31'),
    resolutionCriteria: 'Polymarket annual trading volume >= $10 billion in 2026',
    creatorAddress: '0x666...777',
    createdAt: new Date('2025-10-17'),
    status: 'active',
    totalPools: 13,
    totalStaked: 78500
  },
  {
    id: '12',
    title: 'SpaceX will successfully land humans on Mars by 2028',
    description: 'Starship development progressing rapidly with successful orbital flights and refueling tests. NASA Artemis partnership and private funding accelerating Mars mission timeline.',
    category: 'Tech',
    endDate: new Date('2028-12-31'),
    resolutionCriteria: 'SpaceX successfully lands human crew on Mars surface',
    creatorAddress: '0x888...999',
    createdAt: new Date('2025-10-21'),
    status: 'active',
    totalPools: 18,
    totalStaked: 156000
  },

  // ============================================
  // RESOLVED NEWS (for testing)
  // ============================================
  {
    id: '7',
    title: 'ETH will reach $4,500 before October 2025',
    description: 'Ethereum price prediction following ETF approval momentum and Layer 2 scaling improvements. Considering DeFi protocol upgrades and institutional staking growth.',
    category: 'Crypto',
    endDate: new Date('2025-10-15'),
    resolutionCriteria: 'ETH price >= $4,500 on CoinGecko',
    creatorAddress: '0xabc...123',
    createdAt: new Date('2025-07-01'),
    status: 'resolved',
    totalPools: 8,
    totalStaked: 34800,
    outcome: 'YES',
    resolvedAt: new Date('2025-09-28'),
    resolvedBy: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    resolutionSource: 'https://www.coingecko.com/en/coins/ethereum',
    resolutionNotes: 'ETH reached $4,620 on Sep 28, 2025 following ETF approval and strong DeFi TVL growth'
  },
  {
    id: '8',
    title: 'ChatGPT will reach 1 billion weekly active users by Q3 2025',
    description: 'OpenAI user growth prediction following GPT-4.5 release and enterprise adoption acceleration. Considering mobile app improvements and API usage expansion.',
    category: 'Tech',
    endDate: new Date('2025-09-30'),
    resolutionCriteria: 'OpenAI officially announces 1B+ weekly active users',
    creatorAddress: '0xdef...456',
    createdAt: new Date('2025-06-15'),
    status: 'resolved',
    totalPools: 5,
    totalStaked: 18200,
    outcome: 'NO',
    resolvedAt: new Date('2025-09-30'),
    resolvedBy: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    resolutionSource: 'https://openai.com/blog/usage-statistics',
    resolutionNotes: 'ChatGPT reached 950M weekly active users by Q3 end, falling short of 1B target'
  },
  {
    id: '9',
    title: 'Base will become top 3 blockchain by TVL in 2025',
    description: 'Coinbase L2 growth prediction based on user onboarding, dApp ecosystem development, and institutional adoption through Coinbase integration.',
    category: 'Crypto',
    endDate: new Date('2025-10-01'),
    resolutionCriteria: 'Base blockchain ranks top 3 by Total Value Locked (TVL)',
    creatorAddress: '0x789...abc',
    createdAt: new Date('2025-03-15'),
    status: 'resolved',
    totalPools: 11,
    totalStaked: 52400,
    outcome: 'YES',
    resolvedAt: new Date('2025-09-28'),
    resolvedBy: '0x580B01f8CDf7606723c3BE0dD2AaD058F5aECa3d',
    resolutionSource: 'https://defillama.com/chains',
    resolutionNotes: 'Base reached #3 ranking with $15.2B TVL, surpassing Polygon and Avalanche'
  }
];
