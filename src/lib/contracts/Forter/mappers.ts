/**
 * FORTER CONTRACT - DATA MAPPERS
 *
 * Functions to map contract data structures to frontend types
 */

import type { News, Pool } from '@/types';
import type { NewsContractData, PoolContractData } from '../types';
import { formatUSDC, timestampToDate } from '../utils';

/**
 * Map contract news data to frontend News interface
 * Contract getNewsInfo() returns array format with 11 fields
 */
export function mapContractToNews(contractData: NewsContractData | unknown[], newsId: string): News {
  // Handle both array and object formats
  if (Array.isArray(contractData)) {
    // Contract returns array format
    const [
      creator,
      title,
      description,
      category,
      resolutionCriteria,
      createdAt,
      resolveTime,
      status,
      outcome,
      totalPools,
      totalStaked
    ] = contractData as [string, string, string, string, string, bigint, bigint, number, number, bigint, bigint];

    const mappedNews = {
      id: newsId,
      title: title || '',
      description: description || '',
      category: category || '',
      endDate: timestampToDate(resolveTime),
      resolutionCriteria: resolutionCriteria || '',
      creatorAddress: creator || '0x0',
      createdAt: timestampToDate(createdAt),
      status: status === 0 ? 'active' : 'resolved', // NewsStatus enum: 0=Active, 1=Resolved
      totalPools: Number(totalPools || BigInt(0)),
      totalStaked: Number(formatUSDC(totalStaked)),
      outcome: status !== 0 ? mapOutcomeToYesNo(outcome) : undefined,
    } as News;

    console.log('[Forter/mappers] Array mapping result:', {
      newsId,
      title,
      description,
      category,
      status,
      outcome,
      totalPools,
      totalStaked,
      resolvedAt: resolveTime,
      mappedNews
    });

    return mappedNews;
  } else {
    // Object format (future compatibility)
    return {
      id: newsId,
      title: contractData.title || '',
      description: contractData.description || '',
      category: contractData.category || '',
      endDate: timestampToDate(contractData.resolveTime),
      resolutionCriteria: contractData.resolutionCriteria || '',
      creatorAddress: contractData.creator || '0x0',
      createdAt: timestampToDate(contractData.createdAt),
      status: contractData.status === 0 ? 'active' : 'resolved',
      totalPools: Number(contractData.totalPools || BigInt(0)),
      totalStaked: Number(formatUSDC(contractData.totalStaked)),
      outcome: contractData.status !== 0 ? mapOutcomeToYesNo(contractData.outcome) : undefined,
    };
  }
}

/**
 * Map contract outcome enum to frontend string
 */
function mapOutcomeToYesNo(outcome: number): 'YES' | 'NO' | undefined {
  switch (outcome) {
    case 1: return 'YES';  // Outcome.YES
    case 2: return 'NO';   // Outcome.NO
    case 0:
    default: return undefined; // Outcome.None or invalid
  }
}

/**
 * Map contract pool data to frontend Pool interface
 */
export function mapContractToPool(
  contractData: PoolContractData | unknown[],
  poolId: string,
  newsId: string
): Pool {
  // Handle both array and object formats
  if (Array.isArray(contractData)) {
    // Contract returns array format
    const [
      creator,
      reasoning,
      evidenceLinks,
      imageUrl,
      imageCaption,
      position,
      creatorStake,
      totalStaked,
      agreeStakes,
      disagreeStakes,
      createdAt,
      isResolved,
      isCorrect
    ] = contractData as [string, string, string[], string, string, boolean, bigint, bigint, bigint, bigint, bigint, boolean, boolean];

    return {
      id: poolId,
      newsId: newsId,
      creatorAddress: creator || '0x0',
      position: position ? 'YES' : 'NO', // Boolean position (true=YES, false=NO)
      reasoning: reasoning || '',
      evidence: evidenceLinks || [],
      imageUrl: imageUrl || undefined,
      imageCaption: imageCaption || undefined,
      creatorStake: Number(formatUSDC(creatorStake)),
      agreeStakes: Number(formatUSDC(agreeStakes)),
      disagreeStakes: Number(formatUSDC(disagreeStakes)),
      totalStaked: Number(formatUSDC(totalStaked)),
      status: isResolved ? 'resolved' : 'active',
      outcome: isResolved
        ? (isCorrect ? 'creator_correct' : 'creator_wrong')
        : null,
      createdAt: timestampToDate(createdAt),
    };
  } else {
    // Object format (future compatibility)
    return {
      id: poolId,
      newsId: newsId,
      creatorAddress: contractData.creator || '0x0',
      position: contractData.position ? 'YES' : 'NO', // Boolean position (true=YES, false=NO)
      reasoning: contractData.reasoning || '',
      evidence: contractData.evidenceLinks || [],
      imageUrl: contractData.imageUrl || undefined,
      imageCaption: contractData.imageCaption || undefined,
      creatorStake: Number(formatUSDC(contractData.creatorStake)),
      agreeStakes: Number(formatUSDC(contractData.agreeStakes)),
      disagreeStakes: Number(formatUSDC(contractData.disagreeStakes)),
      totalStaked: Number(formatUSDC(contractData.totalStaked)),
      status: contractData.isResolved ? 'resolved' : 'active',
      outcome: contractData.isResolved
        ? (contractData.isCorrect ? 'creator_correct' : 'creator_wrong')
        : null,
      createdAt: timestampToDate(contractData.createdAt),
    };
  }
}
