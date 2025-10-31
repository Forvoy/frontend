/**
 * FORTER CONTRACT - WRITE FUNCTIONS
 *
 * All write/transaction contract calls for Forter.sol
 */

import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { config as wagmiConfig } from '@/lib/wagmi';
import { contracts } from '@/config/contracts';
import type { Hash } from '@/types/contracts';
import type { TransactionResult } from '../types';
import { parseUSDC, dateToTimestamp, stringToPosition, convertToBigInt } from '../utils';

/**
 * Create news
 */
export async function createNews(
  title: string,
  description: string,
  category: string,
  resolutionCriteria: string,
  resolveTime: Date
): Promise<TransactionResult> {
  try {
    const hash = await writeContract(wagmiConfig, {
      address: contracts.forter.address,
      abi: contracts.forter.abi,
      functionName: 'createNews',
      args: [
        title,
        description,
        category,
        resolutionCriteria,
        dateToTimestamp(resolveTime),
      ],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Forter/write] createNews failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Create pool (requires USDC approval first)
 */
export async function createPool(
  newsId: string,
  reasoning: string,
  evidenceLinks: string[],
  imageUrl: string,
  imageCaption: string,
  position: 'YES' | 'NO',
  creatorStake: number
): Promise<TransactionResult> {
  try {
    // Convert string ID to BigInt safely
    const newsIdBigInt = convertToBigInt(newsId);

    // Reset any existing approval to prevent conflicts
    console.log('[Forter/write] Resetting existing USDC approvals...');
    try {
      const resetHash = await writeContract(wagmiConfig, {
        address: contracts.token.address,
        abi: contracts.token.abi,
        functionName: 'approve',
        args: [contracts.forter.address, BigInt(0)], // Reset old approval
      }) as Hash;

      console.log('[Forter/write] Reset approval transaction:', resetHash);
      await waitForTransactionReceipt(wagmiConfig, { hash: resetHash });
      console.log('[Forter/write] Reset approval confirmed');
    } catch (error) {
      console.warn('[Forter/write] Failed to reset old approval:', error);
    }

    // Approve USDC to both addresses to handle any contract requirements
    console.log('[Forter/write] Approving USDC to both forter and stakingPool addresses...');

    // First approve to forter contract (in case contract logic requires it)
    const forterApproveHash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'approve',
      args: [contracts.forter.address, parseUSDC(creatorStake)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash: forterApproveHash });
    console.log('[Forter/write] Forter approval confirmed:', forterApproveHash);

    // Then approve to stakingPool contract
    const stakingPoolApproveHash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'approve',
      args: [contracts.stakingPool.address, parseUSDC(creatorStake)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash: stakingPoolApproveHash });
    console.log('[Forter/write] StakingPool approval confirmed:', stakingPoolApproveHash);

    // Use the stakingPool hash for tracking

    // Then create pool
    const hash = await writeContract(wagmiConfig, {
      address: contracts.forter.address,
      abi: contracts.forter.abi,
      functionName: 'createPool',
      args: [
        newsIdBigInt,
        reasoning,
        evidenceLinks,
        imageUrl,
        imageCaption,
        stringToPosition(position), // Pool position - CORRECT
        parseUSDC(creatorStake),
      ],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Forter/write] createPool failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Stake on pool (requires USDC approval first)
 *
 * IMPORTANT: userPosition parameter represents whether user agrees with pool creator's position
 * - true = user agrees with pool creator's position (regardless of whether pool is YES or NO)
 * - false = user disagrees with pool creator's position
 *
 * Examples:
 * - Pool position: YES, user chooses "agree" → userPosition = true
 * - Pool position: NO, user chooses "agree" → userPosition = false
 * - Pool position: YES, user chooses "disagree" → userPosition = false
 * - Pool position: NO, user chooses "disagree" → userPosition = true
 */
export async function stakeOnPool(
  newsId: string,
  poolId: string,
  amount: number,
  userAgreesWithPool: boolean // true = user agrees with pool creator, false = user disagrees
): Promise<TransactionResult> {
  try {
    // Convert string IDs to BigInt safely
    const newsIdBigInt = convertToBigInt(newsId);
    const poolIdBigInt = convertToBigInt(poolId);

    console.log('[Forter/write] staking with IDs:', { newsId, poolId, newsIdBigInt, poolIdBigInt });

    // Reset any existing approval to prevent conflicts
    console.log('[Forter/write] Resetting existing USDC approvals for staking...');
    try {
      await writeContract(wagmiConfig, {
        address: contracts.token.address,
        abi: contracts.token.abi,
        functionName: 'approve',
        args: [contracts.forter.address, BigInt(0)], // Reset old approval
      }) as Hash;
    } catch (error) {
      console.warn('[Forter/write] Failed to reset old approval:', error);
    }

    // Approve USDC to both addresses to handle any contract requirements
    console.log('[Forter/write] Approving USDC to both forter and stakingPool addresses for staking...');

    // First approve to forter contract (in case contract logic requires it)
    const forterApproveHash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'approve',
      args: [contracts.forter.address, parseUSDC(amount)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash: forterApproveHash });
    console.log('[Forter/write] Forter staking approval confirmed:', forterApproveHash);

    // Then approve to stakingPool contract
    const stakingPoolApproveHash = await writeContract(wagmiConfig, {
      address: contracts.token.address,
      abi: contracts.token.abi,
      functionName: 'approve',
      args: [contracts.stakingPool.address, parseUSDC(amount)],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash: stakingPoolApproveHash });
    console.log('[Forter/write] StakingPool staking approval confirmed:', stakingPoolApproveHash);

    // Use the stakingPool hash for tracking

    // Log what we're sending to contract
    console.log('[Forter/write] 📤 FIXED Sending to contract stake():', {
      newsId: newsIdBigInt,
      poolId: poolIdBigInt,
      amount: parseUSDC(amount),
      userAgreesWithPool,
      userAgreesWithPoolType: typeof userAgreesWithPool,
      note: 'true = user agrees with pool creator, false = user disagrees'
    });

    // FIXED: Flip the parameter to match contract expectations
    // Frontend: userAgreesWithPool (true=agrees, false=disagrees)
    // Contract expects: userAgreesWithPool flipped due to logic confusion
    const contractUserPosition = !userAgreesWithPool;

    console.log('[Forter/write] 🔧 FIXED Flipping parameter for contract:', {
      frontendLogic: userAgreesWithPool,
      contractParameter: contractUserPosition,
      explanation: 'Flipping due to contract logic confusion'
    });

    // Then stake
    const hash = await writeContract(wagmiConfig, {
      address: contracts.forter.address,
      abi: contracts.forter.abi,
      functionName: 'stake',
      args: [newsIdBigInt, poolIdBigInt, parseUSDC(amount), contractUserPosition],
    }) as Hash;

    const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

    // Debug: Parse Staked event from receipt
    console.log('[Forter/write] 📋 Transaction receipt:', {
      status: receipt.status,
      logs: receipt.logs.length,
      blockNumber: receipt.blockNumber
    });

    // Try to find and parse Staked event
    if (receipt.logs && receipt.logs.length > 0) {
      try {
        // Log all events for debugging
        console.log('[Forter/write] 📄 All events:', receipt.logs.map((log: unknown) => {
          const logEvent = log as { address?: string; topics?: string[]; data?: string };
          return {
            address: logEvent.address,
            topics: logEvent.topics,
            data: logEvent.data
          };
        }));

        // Staked event signature: Staked(uint256 indexed newsId, uint256 indexed poolId, address indexed user, uint256 amount, bool position)
        // Event signature hash: keccak256("Staked(uint256,uint256,address,uint256,bool)")
        const stakedEventTopic = '0x9e71bc8eea02a63969f509818f2dafb9254532904319f9dbda79b67bd34a5f3d';

        const stakedLog = receipt.logs.find((log: unknown) => {
          const logEvent = log as { topics?: string[] };
          return logEvent.topics && logEvent.topics[0] === stakedEventTopic;
        });

        if (stakedLog) {
          console.log('[Forter/write] 🎯 Found Staked event:', {
            topics: stakedLog.topics,
            data: stakedLog.data,
            dataLength: stakedLog.data.length
          });

          // Decode event data
          // topics[0] = event signature
          // topics[1] = newsId (indexed)
          // topics[2] = poolId (indexed)
          // topics[3] = user address (indexed)
          // data = abi.encode(amount, userAgreesWithPool) - non-indexed parameters

          if (stakedLog.data && stakedLog.data.length > 2) {
            // Remove '0x' prefix and split into 64-char chunks (32 bytes each)
            const dataWithoutPrefix = stakedLog.data.slice(2);
            const amount = BigInt('0x' + dataWithoutPrefix.slice(0, 64));
            const userAgreesWithPool = BigInt('0x' + dataWithoutPrefix.slice(64, 128)) !== BigInt(0);

            console.log('[Forter/write] 🔍 FIXED Decoded Staked event:', {
              newsId: stakedLog.topics[1],
              poolId: stakedLog.topics[2],
              user: stakedLog.topics[3],
              amount: amount.toString(),
              userAgreesWithPool,
              interpretation: userAgreesWithPool ? 'User agrees with pool creator' : 'User disagrees with pool creator'
            });
          }
        } else {
          console.warn('[Forter/write] ⚠️ Staked event not found in logs');
        }
      } catch (err) {
        console.warn('[Forter/write] Could not parse event:', err);
      }
    }

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Forter/write] stakeOnPool failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Resolve news (Admin/Owner only)
 */
export async function resolveNews(
  newsId: string,
  outcome: 0 | 1 | 2, // 0 = None, 1 = YES, 2 = NO
  resolutionSource: string,
  resolutionNotes: string
): Promise<TransactionResult> {
  try {
    // Convert string ID to BigInt safely
    const newsIdBigInt = convertToBigInt(newsId);

    const hash = await writeContract(wagmiConfig, {
      address: contracts.forter.address,
      abi: contracts.forter.abi,
      functionName: 'resolveNews',
      args: [newsIdBigInt, outcome, resolutionSource, resolutionNotes],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Forter/write] resolveNews failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}

/**
 * Emergency resolve news (Admin/Owner only) - bypasses time restrictions
 */
export async function emergencyResolve(
  newsId: string,
  outcome: 0 | 1 | 2, // 0 = None, 1 = YES, 2 = NO
  resolutionSource: string,
  resolutionNotes: string
): Promise<TransactionResult> {
  try {
    // Convert string ID to BigInt safely
    const newsIdBigInt = convertToBigInt(newsId);

    const hash = await writeContract(wagmiConfig, {
      address: contracts.forter.address,
      abi: contracts.forter.abi,
      functionName: 'emergencyResolve',
      args: [newsIdBigInt, outcome, resolutionSource, resolutionNotes],
    }) as Hash;

    await waitForTransactionReceipt(wagmiConfig, { hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error('[Forter/write] emergencyResolve failed:', error);
    return {
      hash: '0x' as Hash,
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}
