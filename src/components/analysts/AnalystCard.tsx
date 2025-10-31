'use client';

import { ReputationData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getTierIcon } from '@/lib/mock-data';
import { Flame, Calendar } from 'lucide-react';

interface AnalystCardProps {
  analyst: ReputationData;
}

export default function AnalystCard({ analyst }: AnalystCardProps) {
  // Truncate address for display
  const displayAddress = `${analyst.address.slice(0, 6)}...${analyst.address.slice(-4)}`;

  return (
    <Link href={`/profile/${analyst.address}`} className="block h-full">
      <Card className="border border-border bg-card hover:bg-secondary/50 transition-all duration-300 hover:shadow-lg cursor-pointer h-full">
        <CardContent className="p-4 md:p-5 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-2.5 md:gap-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm text-sm md:text-base">
              {analyst.address.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm md:text-base text-foreground truncate">
                {displayAddress}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                  {getTierIcon(analyst.tier)} {analyst.tier}
                </Badge>
                <span className="text-[10px] md:text-xs font-medium text-muted-foreground">
                  {analyst.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid with Win Streak */}
          <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-foreground">{analyst.totalPools}</div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wide">Pools</div>
              </div>
              <div className="text-center border-x border-border/50">
                <div className="text-base md:text-lg font-bold text-emerald-600">
                  {analyst.correctPools || '-'}
                </div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wide">Win</div>
              </div>
              <div className="text-center">
                <div className="text-base md:text-lg font-bold text-rose-600">
                  {analyst.wrongPools || '-'}
                </div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wide">Loss</div>
              </div>
            </div>

            {/* Win Streak - Integrated */}
            {(analyst.currentStreak ?? 0) > 0 && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <div className="text-[10px] md:text-xs font-semibold text-orange-500 text-center flex items-center justify-center gap-1">
                  <Flame className="h-3 w-3" />
                  <span>{analyst.currentStreak} Win Streak</span>
                </div>
              </div>
            )}
          </div>

          {/* Specialty */}
          {analyst.specialty && (
            <div className="mb-3 md:mb-4">
              <div className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1.5 md:mb-2 uppercase tracking-wide">Specialty</div>
              <div className="flex flex-wrap gap-1 md:gap-1.5">
                {analyst.specialty.split(',').map((spec, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 bg-background/50">
                    {spec.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-grow" />

          {/* Footer */}
          {analyst.memberSince && (
            <div className="pt-2 md:pt-3 border-t border-border/50 text-center">
              <span className="text-[10px] md:text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Since {analyst.memberSince.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
