/**
 * REPUTATION NFT CONTRACT - DATA MAPPERS
 *
 * Functions to map contract data structures to frontend types
 */

import type { ReputationData } from '@/types';
import type { ReputationContractData } from '../types';

/**
 * Map tier number to string
 */
function mapTierNumberToString(tier: number): ReputationData['tier'] {
  const tiers: ReputationData['tier'][] = ['Novice', 'Analyst', 'Expert', 'Master', 'Legend'];
  return tiers[tier] || 'Novice';
}

/**
 * Map contract reputation data to frontend ReputationData interface
 */
export function mapContractToReputation(
  contractData: ReputationContractData,
  address: string
): ReputationData {
  // BUGFIX: Safe access for all BigInt fields
  const totalPools = contractData.totalPredictions ? Number(contractData.totalPredictions) : 0;
  const correctPools = contractData.correctPredictions ? Number(contractData.correctPredictions) : 0;
  const wrongPools = totalPools - correctPools;
  const reputationPoints = contractData.reputationPoints ? Number(contractData.reputationPoints) : 0;
  const lastUpdated = contractData.lastUpdated ? Number(contractData.lastUpdated) : 0;

  // BUGFIX: Handle accuracy BigInt properly with safe access
  // Contract returns accuracy as percentage * 100 (e.g., 10000 = 100%)
  // Or it might be 0-100 range directly depending on contract implementation
  let accuracy = 0;

  try {
    // Safe access - contractData.accuracy might be undefined
    const rawAccuracy = contractData.accuracy ? Number(contractData.accuracy) : 0;

    // If accuracy > 100, it's likely in basis points (divide by 100)
    if (rawAccuracy > 100) {
      accuracy = Math.round(rawAccuracy / 100);
    } else {
      accuracy = rawAccuracy;
    }

    // Fallback: Calculate from pools if accuracy is 0 or NaN or undefined
    if (!accuracy || isNaN(accuracy)) {
      const resolvedPools = correctPools + wrongPools;
      if (resolvedPools > 0) {
        accuracy = Math.round((correctPools / resolvedPools) * 100);
      }
    }
  } catch (error) {
    console.warn('[ReputationMapper] Failed to parse accuracy:', error);
    // Fallback calculation
    const resolvedPools = correctPools + wrongPools;
    accuracy = resolvedPools > 0 ? Math.round((correctPools / resolvedPools) * 100) : 0;
  }

  console.log('[ReputationMapper] Mapped data:', {
    address: address.slice(0, 10) + '...',
    rawAccuracy: contractData.accuracy ? contractData.accuracy.toString() : 'undefined',
    parsedAccuracy: accuracy,
    totalPools,
    correctPools,
    wrongPools,
    calculatedAccuracy: wrongPools + correctPools > 0 ? Math.round((correctPools / (correctPools + wrongPools)) * 100) : 0
  });

  return {
    address,
    accuracy,
    totalPools,
    correctPools,
    wrongPools,
    activePools: 0,
    tier: mapTierNumberToString(Number(contractData.tier)),
    nftTokenId: undefined,
    categoryStats: {},
    reputationPoints,
    lastActive: lastUpdated > 0 ? new Date(lastUpdated * 1000) : undefined,
  };
}
