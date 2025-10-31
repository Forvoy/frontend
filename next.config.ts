import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', 'viem']
  },
  webpack: config => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      '@react-native-async-storage/async-storage': false
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Handle React Native modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    
    return config;
  },
};

export default nextConfig;
