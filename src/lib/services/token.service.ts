import { isContractsEnabled, contracts } from '@/config/contracts';
import type { Address } from '@/types/contracts';

/**
 * TOKEN SERVICE (USDC)
 *
 * ⭐ THIS IS THE INTEGRATION POINT FOR USDC TOKEN OPERATIONS ⭐
 *
 * This service handles USDC token operations:
 * - Get user balance
 * - Check allowances
 * - Display formatted balances
 *
 * Contract Integration:
 * - Function: balanceOf(address) - Get USDC balance
 * - Function: allowance(owner, spender) - Check approval amount
 */

class TokenService {
  /**
   * Get USDC balance for an address
   *
   * Contract Integration:
   * - Function: balanceOf(address)
   * - Returns: Balance in USDC (6 decimals)
   */
  async getBalance(address: string): Promise<number> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return mock balance
      return 1000; // $1000 USDC
    }

    try {
      console.log('[TokenService] Fetching USDC balance from contract:', address);

      // Import getUSDCBalance
      const { getUSDCBalance } = await import('@/lib/contracts');

      const balance = await getUSDCBalance(address as Address);

      console.log('[TokenService] USDC balance fetched:', balance);

      return balance;

    } catch (error) {
      console.error('[TokenService] Get balance failed:', error);
      return 0;
    }
  }

  /**
   * Get USDC allowance for a spender
   *
   * Contract Integration:
   * - Function: allowance(owner, spender)
   * - Returns: Approved amount in USDC
   */
  async getAllowance(ownerAddress: string, spenderAddress: string): Promise<number> {
    if (!isContractsEnabled()) {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return mock allowance
      return 0; // No allowance by default
    }

    try {
      console.log('[TokenService] Fetching USDC allowance from contract...', {
        owner: ownerAddress,
        spender: spenderAddress
      });

      // Import getUSDCAllowance
      const { getUSDCAllowance } = await import('@/lib/contracts');

      const allowance = await getUSDCAllowance(
        ownerAddress as Address,
        spenderAddress as Address
      );

      console.log('[TokenService] USDC allowance fetched:', allowance);

      return allowance;

    } catch (error) {
      console.error('[TokenService] Get allowance failed:', error);
      return 0;
    }
  }

  /**
   * Check if user has sufficient balance
   *
   * Helper function for validation before staking
   */
  async hasSufficientBalance(address: string, requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance(address);
    return balance >= requiredAmount;
  }

  /**
   * Check if user has sufficient allowance
   *
   * Helper function to determine if approval is needed
   */
  async hasSufficientAllowance(
    ownerAddress: string,
    spenderAddress: string,
    requiredAmount: number
  ): Promise<boolean> {
    const allowance = await this.getAllowance(ownerAddress, spenderAddress);
    return allowance >= requiredAmount;
  }

  /**
   * Format USDC amount for display
   *
   * Pure function, no contract call
   */
  formatBalance(amount: number, decimals: number = 2): string {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Get token information
   *
   * Returns contract-level token info
   */
  getTokenInfo(): {
    address: string;
    symbol: string;
    decimals: number;
    name: string;
  } {
    return {
      address: contracts.token.address,
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin (Mock)'
    };
  }

  /**
   * Validate stake amount
   *
   * Helper function for form validation
   */
  validateStakeAmount(amount: number, minStake: number = 20): {
    isValid: boolean;
    error?: string;
  } {
    if (amount <= 0) {
      return {
        isValid: false,
        error: 'Amount must be greater than 0'
      };
    }

    if (amount < minStake) {
      return {
        isValid: false,
        error: `Minimum stake is $${minStake} USDC`
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const tokenService = new TokenService();
