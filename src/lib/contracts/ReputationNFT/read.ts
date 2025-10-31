/**
 * REPUTATION NFT CONTRACT - READ FUNCTIONS
 *
 * All read-only contract calls for ReputationNFT.sol
 */

import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { Address } from '@/types/contracts';
import type { ReputationData } from '@/types';
import type { ReputationContractData } from '../types';
import { mapContractToReputation } from './mappers';

/**
 * Get user reputation
 */
export async function getUserReputation(address: Address): Promise<ReputationData | null> {
  try {
    console.log('[ReputationNFT/read] Fetching reputation for:', address);

    const data = await readContract(wagmiConfig, {
      address: contracts.reputationNFT.address,
      abi: contracts.reputationNFT.abi,
      functionName: 'getUserReputation',
      args: [address],
    }) as unknown as [bigint, bigint, bigint, bigint, bigint, string, bigint];

    console.log('[ReputationNFT/read] Raw contract data (array):', data);

    if (!data) {
      console.warn('[ReputationNFT/read] No data returned from contract');
      return null;
    }

    // BUGFIX: Contract returns TUPLE array, not object!
    // Function returns: (reputationPoints, lastUpdated, totalPredictions, correctPredictions, tier, tierName, accuracy)
    const [
      reputationPoints,
      lastUpdated,
      totalPredictions,
      correctPredictions,
      tier,
      tierName,
      accuracy
    ] = data;

    // Convert array to object format
    const contractData: ReputationContractData = {
      reputationPoints,
      lastUpdated,
      totalPredictions,
      correctPredictions,
      tier,
      tierName,
      accuracy
    };

    console.log('[ReputationNFT/read] Converted to object:', contractData);

    const mapped = mapContractToReputation(contractData, address);
    console.log('[ReputationNFT/read] Mapped reputation:', mapped);

    return mapped;
  } catch (error) {
    console.error('[ReputationNFT/read] getUserReputation failed:', error);
    return null;
  }
}

/**
 * Get total number of NFT holders (analysts)
 */
export async function getTotalAnalysts(): Promise<number> {
  try {
    const totalSupply = await readContract(wagmiConfig, {
      address: contracts.reputationNFT.address,
      abi: contracts.reputationNFT.abi,
      functionName: 'totalSupply',
    }) as bigint;

    return Number(totalSupply);
  } catch (error) {
    console.error('[ReputationNFT/read] getTotalAnalysts failed:', error);
    return 0;
  }
}

/**
 * Get user address by token ID
 */
export async function getUserByTokenId(tokenId: bigint): Promise<Address | null> {
  try {
    const userAddress = await readContract(wagmiConfig, {
      address: contracts.reputationNFT.address,
      abi: contracts.reputationNFT.abi,
      functionName: 'tokenIdToUser',
      args: [tokenId],
    }) as Address;

    return userAddress;
  } catch (error) {
    console.error('[ReputationNFT/read] getUserByTokenId failed:', error);
    return null;
  }
}

/**
 * Get all analysts (NFT holders) from contract
 *
 * This function iterates through all NFT token IDs and fetches
 * the reputation data for each holder.
 *
 * Note: For large numbers of analysts (>100), consider using:
 * - Event indexing (The Graph)
 * - Multicall for batch reading
 * - Pagination
 */
export async function getAllAnalystsFromContract(): Promise<ReputationData[]> {
  try {
    const totalSupply = await getTotalAnalysts();

    if (totalSupply === 0) {
      return [];
    }

    // Fetch all user addresses
    const addressPromises: Promise<Address | null>[] = [];
    for (let i = 1; i <= totalSupply; i++) {
      addressPromises.push(getUserByTokenId(BigInt(i)));
    }

    const addresses = await Promise.all(addressPromises);
    const validAddresses = addresses.filter(Boolean) as Address[];

    if (validAddresses.length === 0) {
      return [];
    }

    // Fetch reputation data for each address
    const reputationPromises = validAddresses.map(address => getUserReputation(address));
    const reputations = await Promise.all(reputationPromises);

    // Filter out null values
    return reputations.filter(Boolean) as ReputationData[];

  } catch (error) {
    console.error('[ReputationNFT/read] getAllAnalystsFromContract failed:', error);
    return [];
  }
}
