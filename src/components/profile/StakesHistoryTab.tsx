'use client';

import { PoolStake } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getPoolById } from '@/lib/mock-data';

interface StakesHistoryTabProps {
  stakes: PoolStake[];
  isOwnProfile: boolean;
}

interface StakeWithPoolInfo extends PoolStake {
  poolInfo?: {
    newsId: string;
    position: 'YES' | 'NO';
    status: 'active' | 'resolved';
    outcome?: 'creator_correct' | 'creator_wrong' | null;
  };
}

export default function StakesHistoryTab({ stakes, isOwnProfile }: StakesHistoryTabProps) {
  // Enrich stakes with pool info
  const enrichedStakes: StakeWithPoolInfo[] = stakes.map(stake => {
    const pool = getPoolById(stake.poolId);
    return {
      ...stake,
      poolInfo: pool ? {
        newsId: pool.newsId,
        position: pool.position,
        status: pool.status,
        outcome: pool.outcome
      } : undefined
    };
  });

  // Group by status
  const activeStakes = enrichedStakes.filter(s => s.poolInfo?.status === 'active');
  const resolvedStakes = enrichedStakes.filter(s => s.poolInfo?.status === 'resolved');

  // Calculate win/loss for resolved
  const wins = resolvedStakes.filter(s => {
    if (!s.poolInfo?.outcome) return false;
    return (
      (s.position === 'agree' && s.poolInfo.outcome === 'creator_correct') ||
      (s.position === 'disagree' && s.poolInfo.outcome === 'creator_wrong')
    );
  }).length;

  const losses = resolvedStakes.filter(s => {
    if (!s.poolInfo?.outcome) return false;
    return (
      (s.position === 'agree' && s.poolInfo.outcome === 'creator_wrong') ||
      (s.position === 'disagree' && s.poolInfo.outcome === 'creator_correct')
    );
  }).length;

  const winRate = resolvedStakes.length > 0 ? Math.round((wins / resolvedStakes.length) * 100) : 0;

  if (stakes.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-semibold mb-2">No Stakes Yet</h3>
          <p className="text-muted-foreground mb-6">
            {isOwnProfile
              ? "You haven't staked on any pools yet. Start backing analysts or betting against pools to earn rewards!"
              : "This user hasn't staked on any pools yet."}
          </p>
          {isOwnProfile && (
            <div className="flex gap-3 justify-center">
              <Link href="/news">
                <Button variant="outline">Browse News</Button>
              </Link>
              <Link href="/analysts">
                <Button className="bg-gradient-to-r from-primary to-accent">
                  Browse Analysts
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <Card className="border border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Stakes Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-foreground">{stakes.length}</div>
              <div className="text-sm text-muted-foreground">Total Stakes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{wins}</div>
              <div className="text-sm text-muted-foreground">Won</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">{losses}</div>
              <div className="text-sm text-muted-foreground">Lost</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Stakes */}
      {activeStakes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Active Stakes ({activeStakes.length})</h3>
          <div className="space-y-3">
            {activeStakes.map((stake) => (
              <Card key={stake.id} className="border border-border bg-card hover:bg-secondary transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={stake.position === 'agree' ? 'default' : 'secondary'} className={
                          stake.position === 'agree'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border-rose-200'
                        }>
                          {stake.position === 'agree' ? 'Agree' : 'Disagree'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stake.poolInfo?.position} Pool
                        </Badge>
                      </div>
                      <Link
                        href={`/news/${stake.poolInfo?.newsId}`}
                        className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                      >
                        View Pool Details →
                      </Link>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">${stake.amount}</div>
                        <div className="text-xs text-muted-foreground">
                          {stake.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Stakes */}
      {resolvedStakes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Resolved Stakes ({resolvedStakes.length})</h3>
          <div className="space-y-3">
            {resolvedStakes.map((stake) => {
              const won =
                (stake.position === 'agree' && stake.poolInfo?.outcome === 'creator_correct') ||
                (stake.position === 'disagree' && stake.poolInfo?.outcome === 'creator_wrong');

              return (
                <Card key={stake.id} className={`border transition-colors ${
                  won
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-rose-500/50 bg-rose-500/5'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={stake.position === 'agree' ? 'default' : 'secondary'} className={
                            stake.position === 'agree'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-rose-100 text-rose-700 border-rose-200'
                          }>
                            {stake.position === 'agree' ? 'Agree' : 'Disagree'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {stake.poolInfo?.position} Pool
                          </Badge>
                        </div>
                        <Link
                          href={`/news/${stake.poolInfo?.newsId}`}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          View Pool Details →
                        </Link>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">${stake.amount}</div>
                          <div className="text-xs text-muted-foreground">
                            {stake.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={won
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                        }>
                          {won ? '✅ Won' : '❌ Lost'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
