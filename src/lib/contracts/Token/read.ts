/**
 * TOKEN (USDC) CONTRACT - READ FUNCTIONS
 *
 * All read-only contract calls for MockToken.sol (USDC)
 */

import { readContract } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { Address } from '@/types/contracts';
import { formatUSDC } from '../utils';

/**
 * Get USDC balance
 */
export async function getUSDCBalance(address: Address): Promise<number> {
  try {
    const balance = await readContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'balanceOf',
      args: [address],
    }) as bigint;

    return Number(formatUSDC(balance));
  } catch (error) {
    console.error('[Token/read] getUSDCBalance failed:', error);
    return 0;
  }
}

/**
 * Get USDC allowance
 */
export async function getUSDCAllowance(
  ownerAddress: Address,
  spenderAddress: Address
): Promise<number> {
  try {
    const allowance = await readContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'allowance',
      args: [ownerAddress, spenderAddress],
    }) as bigint;

    return Number(formatUSDC(allowance));
  } catch (error) {
    console.error('[Token/read] getUSDCAllowance failed:', error);
    return 0;
  }
}
