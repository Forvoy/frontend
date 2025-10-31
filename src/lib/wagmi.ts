import { createConfig } from '@privy-io/wagmi';
import { http, fallback } from "viem";
import { baseSepolia } from "viem/chains";

// Multiple RPC endpoints for reliability
const baseSepoliaRPCs = [
  "https://sepolia.base.org",
  "https://base-sepolia.blockpi.network/v1/rpc/public",
  "https://base-sepolia-rpc.publicnode.com",
];

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: fallback(
      baseSepoliaRPCs.map((url) => http(url, {
        timeout: 10_000, // 10 seconds
        retryCount: 3,
        retryDelay: 1000, // 1 second
      }))
    ),
  },
});
