import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, defineChain } from 'viem';

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

export const config = getDefaultConfig({
  appName: 'Forvoy',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [flowTestnet],
  transports: {
    [flowTestnet.id]: http('https://testnet.evm.nodes.onflow.org'),
  },
  ssr: true,
});