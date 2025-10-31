import { createConfig } from '@privy-io/wagmi';
import { http, defineChain } from "viem";

// Define Flow EVM Testnet chain
export const flowTestnet = defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'FlowScan',
      url: 'https://evm-testnet.flowscan.io'
    },
  },
  testnet: true,
});

// RPC endpoint for Flow EVM Testnet
const flowTestnetRPC = "https://testnet.evm.nodes.onflow.org";

export const config = createConfig({
  chains: [flowTestnet],
  transports: {
    [flowTestnet.id]: http(flowTestnetRPC, {
      timeout: 10_000, // 10 seconds
      retryCount: 3,
      retryDelay: 1000, // 1 second
    }),
  },
});
