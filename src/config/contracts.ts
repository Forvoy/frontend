import ForterABI from '../abis/Forter.json';
import ReputationNFTABI from '../abis/ReputationNFT.json';
import StakingPoolABI from '../abis/StakingPool.json';
import ForterGovernanceABI from '../abis/ForterGovernance.json';
import MockTokenABI from '../abis/MockToken.json';
import type { Address, ContractAddresses, ContractConfig, IntegrationConfig } from '../types/contracts';

/**
 * Contract addresses from environment variables
 */
export const contractAddresses: ContractAddresses = {
  forter: process.env.NEXT_PUBLIC_FORTER_ADDRESS as Address,
  reputationNFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS as Address,
  stakingPool: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS as Address,
  governance: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
  token: process.env.NEXT_PUBLIC_TOKEN_ADDRESS as Address,
};

/**
 * Contract configurations with addresses and ABIs
 * Ready to use with wagmi/viem
 */
export const contracts = {
  forter: {
    address: contractAddresses.forter,
    abi: ForterABI,
  } as ContractConfig,
  reputationNFT: {
    address: contractAddresses.reputationNFT,
    abi: ReputationNFTABI,
  } as ContractConfig,
  stakingPool: {
    address: contractAddresses.stakingPool,
    abi: StakingPoolABI,
  } as ContractConfig,
  governance: {
    address: contractAddresses.governance,
    abi: ForterGovernanceABI,
  } as ContractConfig,
  token: {
    address: contractAddresses.token,
    abi: MockTokenABI,
  } as ContractConfig,
};

/**
 * Integration configuration
 */
export const config: IntegrationConfig = {
  // Toggle contracts on/off
  USE_CONTRACTS: process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true',
  
  // Protocol parameters
  USDC_DECIMALS: 6,
  MIN_STAKE_AMOUNT: 10, // $10 USDC minimum (matches contract)
  NEWS_DEPOSIT: 10, // $10 USDC deposit for creating news
  PLATFORM_FEE_PERCENT: 2, // 2% platform fee
  
  // Network configuration
  CHAIN_ID: 84532, // Base Sepolia
  BLOCK_EXPLORER: 'https://sepolia.basescan.org',
  
  // Contract interaction settings
  DEFAULT_GAS_LIMIT: BigInt(500000),
  TRANSACTION_TIMEOUT: 60000, // 60 seconds
};

/**
 * Validation helper to ensure all contracts are properly configured
 */
export function validateContractConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!contractAddresses.forter) missing.push('NEXT_PUBLIC_FORTER_ADDRESS');
  if (!contractAddresses.reputationNFT) missing.push('NEXT_PUBLIC_REPUTATION_NFT_ADDRESS');
  if (!contractAddresses.stakingPool) missing.push('NEXT_PUBLIC_STAKINGPOOL_ADDRESS');
  if (!contractAddresses.governance) missing.push('NEXT_PUBLIC_GOVERNANCE_ADDRESS');
  if (!contractAddresses.token) missing.push('NEXT_PUBLIC_TOKEN_ADDRESS');

  const isValid = missing.length === 0;

  if (!isValid) {
    console.warn('[Contracts] Missing environment variables:', missing);
  }

  return { isValid, missing };
}

/**
 * Helper to check if contracts are enabled and properly configured
 */
export function isContractsEnabled(): boolean {
  const { isValid } = validateContractConfig();
  return config.USE_CONTRACTS && isValid;
}

// Re-export ABIs for direct access
export { ForterABI, ReputationNFTABI, StakingPoolABI, ForterGovernanceABI, MockTokenABI };
