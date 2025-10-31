/**
 * REPUTATION NFT CONTRACT - WRITE FUNCTIONS
 *
 * All write/transaction contract calls for ReputationNFT.sol
 */

import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { Hash, Address } from '@/types/contracts';
import type { TransactionResult } from '../types';

/**
 * Mint reputation NFT (Soulbound Token)
 * Note: Usually auto-minted when user creates first pool
 */
export async function mintReputationNFT(address: Address): Promise<TransactionResult> {
  try {
    const hash = await writeContract(wagmiConfig, {
      address: contracts.reputationNFT.address,
      abi: contracts.reputationNFT.abi,
      functionName: 'mint',
      args: [address],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[ReputationNFT/write] mintReputationNFT failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Update reputation (called after pool resolution)
 * Note: This should be called by the contract itself (internal function)
 * when a pool is resolved, not directly by frontend.
 */
export async function updateReputation(
  userAddress: Address,
  qualityScore: number,
  wasCorrect: boolean,
  amountStaked: bigint
): Promise<TransactionResult> {
  try {
    const hash = await writeContract(wagmiConfig, {
      address: contracts.reputationNFT.address,
      abi: contracts.reputationNFT.abi,
      functionName: 'updateReputation',
      args: [userAddress, qualityScore, wasCorrect, amountStaked],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[ReputationNFT/write] updateReputation failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}
