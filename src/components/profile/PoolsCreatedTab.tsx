'use client';

import { Pool } from '@/types';
import PoolCard from '@/components/pools/PoolCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PoolsCreatedTabProps {
  pools: Pool[];
  isOwnProfile: boolean;
}

export default function PoolsCreatedTab({ pools, isOwnProfile }: PoolsCreatedTabProps) {
  const activePools = pools.filter(p => p.status === 'active');
  const resolvedPools = pools.filter(p => p.status === 'resolved');

  if (pools.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">🏊</div>
          <h3 className="text-xl font-semibold mb-2">No Pools Created</h3>
          <p className="text-muted-foreground mb-6">
            {isOwnProfile
              ? "You haven't created any analysis pools yet. Start building your reputation by creating your first pool!"
              : "This user hasn't created any analysis pools yet."}
          </p>
          {isOwnProfile && (
            <Link href="/news">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Browse News & Create Pool
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Pools */}
      {activePools.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Active Pools ({activePools.length})</h3>
          <div className="space-y-4">
            {activePools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved Pools */}
      {resolvedPools.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Resolved Pools ({resolvedPools.length})</h3>
          <div className="space-y-4">
            {resolvedPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
