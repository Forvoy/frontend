'use client';

import { useEffect, useState } from 'react';
import { isContractsEnabled, validateContractConfig } from '@/config/contracts';
import { newsService } from '@/lib/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContractsDebugPage() {
  const [contractStatus, setContractStatus] = useState<{
    enabled: boolean;
    validation: { isValid: boolean; missing: string[] };
    envVars?: {
      USE_CONTRACTS?: string;
      FORTER_ADDRESS?: string;
      TOKEN_ADDRESS?: string;
      REPUTATION_NFT?: string;
      STAKING_POOL?: string;
      GOVERNANCE?: string;
    };
    error?: string;
  } | null>(null);
  const [newsData, setNewsData] = useState<{
    count?: number;
    source?: string;
    firstNews?: string;
    timestamp?: string;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkContracts() {
      try {
        // Check contract configuration
        const validation = validateContractConfig();
        const enabled = isContractsEnabled();

        setContractStatus({
          enabled,
          validation,
          envVars: {
            USE_CONTRACTS: process.env.NEXT_PUBLIC_USE_CONTRACTS,
            FORTER_ADDRESS: process.env.NEXT_PUBLIC_FORTER_ADDRESS,
            TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
            REPUTATION_NFT: process.env.NEXT_PUBLIC_REPUTATION_NFT_ADDRESS,
            STAKING_POOL: process.env.NEXT_PUBLIC_STAKINGPOOL_ADDRESS,
            GOVERNANCE: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS,
          }
        });

        // Test news service
        console.log('Testing news service...');
        const news = await newsService.getAll();
        setNewsData({
          count: news.length,
          source: enabled ? 'Smart Contracts' : 'Mock Data',
          firstNews: news[0]?.title || 'No news found',
          timestamp: new Date().toLocaleTimeString()
        });

      } catch (error) {
        console.error('Debug error:', error);
        setNewsData({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    }

    checkContracts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground">Loading contract debug info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Grid overlay */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(currentColor 1px, transparent 1px),
              linear-gradient(90deg, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px",
          }}
        />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Contract Integration Debug</h1>
          <p className="text-muted-foreground">Smart contract configuration and service integration status</p>
        </div>

        <div className="grid gap-6">
          {/* Contract Status Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className={`border-l-4 ${contractStatus?.enabled
                ? 'border-l-green-500 bg-green-500/5'
                : 'border-l-red-500 bg-red-500/5'
              }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${contractStatus?.enabled ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  Contract Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {contractStatus?.enabled ? 'ENABLED' : 'DISABLED'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {contractStatus?.enabled ? 'Using smart contracts' : 'Using mock data'}
                </p>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${contractStatus?.validation?.isValid
                ? 'border-l-blue-500 bg-blue-500/5'
                : 'border-l-orange-500 bg-orange-500/5'
              }`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${contractStatus?.validation?.isValid ? 'bg-blue-500' : 'bg-orange-500'
                    }`}></div>
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {contractStatus?.validation?.isValid ? 'VALID' : 'INCOMPLETE'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {contractStatus?.validation?.missing?.length || 0} missing variables
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-purple-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Data Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {newsData?.source || 'Unknown'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {newsData?.count || 0} items loaded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Contract Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {contractStatus?.envVars && Object.entries(contractStatus.envVars).map(([key, value]) => (
                  <div key={key} className="bg-secondary rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-secondary-foreground">{key.replace('_ADDRESS', '')}</span>
                      <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                    </div>
                    <code className="text-xs text-muted-foreground font-mono break-all">
                      {String(value) || 'Not set'}
                    </code>
                  </div>
                ))}
              </div>

              {(contractStatus?.validation?.missing?.length ?? 0) > 0 && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span className="text-sm font-medium text-destructive">Missing Environment Variables</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {contractStatus?.validation?.missing?.join(', ')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Integration Test */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                  News Service Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                {newsData?.error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      <span className="text-sm font-medium text-destructive">Service Error</span>
                    </div>
                    <code className="text-sm text-muted-foreground">{newsData.error}</code>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Data Source</span>
                      <span className="font-medium">{newsData?.source}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Items Count</span>
                      <span className="font-medium">{newsData?.count}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-muted-foreground">Sample Item</span>
                      <span className="font-medium text-right text-sm max-w-[200px] truncate">
                        {newsData?.firstNews}
                      </span>
                    </div>
                    {newsData?.timestamp && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Last Test</span>
                        <span className="font-medium text-sm">{newsData.timestamp}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button
                    variant="default"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    🔄 Refresh Debug Info
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/debug">← Environment</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/news">Test News →</Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/">Home</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href="/analysts">Analysts</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}