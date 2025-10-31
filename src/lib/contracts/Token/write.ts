/**
 * TOKEN (USDC) CONTRACT - WRITE FUNCTIONS
 *
 * All write/transaction contract calls for MockToken.sol (USDC)
 */

import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { Hash, Address } from '@/types/contracts';
import type { TransactionResult } from '../types';
import { parseUSDC } from '../utils';

/**
 * Approve USDC spending
 */
export async function approveUSDC(
  spenderAddress: Address,
  amount: number
): Promise<TransactionResult> {
  try {
    const hash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'approve',
      args: [spenderAddress, parseUSDC(amount)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Token/write] approveUSDC failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Transfer USDC
 */
export async function transferUSDC(
  toAddress: Address,
  amount: number
): Promise<TransactionResult> {
  try {
    const hash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'transfer',
      args: [toAddress, parseUSDC(amount)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Token/write] transferUSDC failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}
