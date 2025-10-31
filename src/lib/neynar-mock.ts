// Mock Neynar API functions for development
// Replace with actual Neynar SDK integration in production

interface FarcasterCastInput {
  text: string;
  embeds?: string[];
}

interface FarcasterCastResponse {
  castHash: string;
  success: boolean;
  url: string;
}

interface FarcasterUserProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  followerCount: number;
  followingCount: number;
  bio: string;
}

/**
 * Mock function to post a cast to Farcaster
 * In production, replace with actual Neynar API call
 */
export async function postToFarcaster(content: FarcasterCastInput): Promise<FarcasterCastResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Mock Farcaster post:', content);

  const castHash = `mock-cast-${Date.now()}`;

  return {
    castHash,
    success: true,
    url: `https://warpcast.com/~/conversations/${castHash}`
  };
}

/**
 * Mock function to get user profile from Farcaster
 * In production, replace with actual Neynar API call
 */
export async function getUserProfile(fid: number): Promise<FarcasterUserProfile> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Mock Farcaster profile fetch:', fid);

  return {
    fid,
    username: `user_${fid}`,
    displayName: `Mock User ${fid}`,
    pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
    followerCount: Math.floor(Math.random() * 1000),
    followingCount: Math.floor(Math.random() * 500),
    bio: 'Mock Farcaster user profile'
  };
}

/**
 * Mock function to link wallet to Farcaster account
 * In production, use Neynar's authentication flow
 */
export async function linkWalletToFarcaster(
  walletAddress: string
): Promise<{ fid: number; success: boolean }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Mock wallet linking:', walletAddress);

  // Generate mock FID based on wallet address
  const mockFid = parseInt(walletAddress.slice(2, 8), 16) % 100000;

  return {
    fid: mockFid,
    success: true
  };
}

/**
 * Mock function to check if wallet is linked to Farcaster
 */
export async function checkWalletLinked(walletAddress: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log('Mock wallet link check:', walletAddress);

  // For demo purposes, return true randomly
  return Math.random() > 0.5;
}

/**
 * Production implementation guide:
 *
 * 1. Install Neynar SDK:
 *    npm install @neynar/nodejs-sdk
 *
 * 2. Initialize Neynar client:
 *    import { NeynarAPIClient } from "@neynar/nodejs-sdk";
 *    const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
 *
 * 3. Replace postToFarcaster:
 *    const result = await client.publishCast({
 *      signerUuid: userSignerUuid,
 *      text: content.text,
 *      embeds: content.embeds?.map(url => ({ url }))
 *    });
 *
 * 4. Replace getUserProfile:
 *    const user = await client.fetchBulkUsers([fid]);
 *    return user.users[0];
 *
 * 5. Implement authentication flow:
 *    - Use Neynar's Auth Kit for wallet linking
 *    - Store signer UUID securely
 *    - Handle session management
 *
 * Reference: https://docs.neynar.com/
 */

// Export mock function to simulate cast embedding
export function generateCastEmbedUrl(
  newsId: string,
  poolId?: string
): string {
  const baseUrl = 'https://forter.app';
  if (poolId) {
    return `${baseUrl}/news/${newsId}?pool=${poolId}`;
  }
  return `${baseUrl}/news/${newsId}`;
}

// Mock function to format cast text with proper length
export function formatCastText(
  text: string,
  maxLength: number = 320
): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Truncate and add ellipsis
  return text.slice(0, maxLength - 3) + '...';
}
