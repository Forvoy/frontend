'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_USE_CONTRACTS: process.env.NEXT_PUBLIC_USE_CONTRACTS,
    NEXT_PUBLIC_FORTER_ADDRESS: process.env.NEXT_PUBLIC_FORTER_ADDRESS,
    NEXT_PUBLIC_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS,
    NODE_ENV: process.env.NODE_ENV,
  };

  // Test the actual config function
  const config = {
    USE_CONTRACTS: process.env.NEXT_PUBLIC_USE_CONTRACTS === 'true',
  };

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

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Environment Debug</h1>
          <p className="text-muted-foreground">System environment and configuration status</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Environment Variables */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary rounded-lg p-4">
                <pre className="text-sm text-secondary-foreground font-mono overflow-x-auto">
                  {JSON.stringify(envVars, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Config Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary rounded-lg p-4">
                  <pre className="text-sm text-secondary-foreground font-mono">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      config.USE_CONTRACTS ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium">Contracts Enabled</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {config.USE_CONTRACTS ? 'Using Smart Contracts' : 'Using Mock Data'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="default">
                  <Link href="/debug/contracts">Contract Details</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/news">Test News Page</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Home Page</Link>
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}