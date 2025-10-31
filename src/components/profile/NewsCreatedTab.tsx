'use client';

import { News } from '@/types';
import NewsCard from '@/components/news/NewsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NewsCreatedTabProps {
  news: News[];
  isOwnProfile: boolean;
}

export default function NewsCreatedTab({ news, isOwnProfile }: NewsCreatedTabProps) {
  const activeNews = news.filter(n => n.status === 'active');
  const resolvedNews = news.filter(n => n.status === 'resolved');

  if (news.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="text-xl font-semibold mb-2">No News Created</h3>
          <p className="text-muted-foreground mb-6">
            {isOwnProfile
              ? "You haven't created any news yet. Create your first prediction and let analysts analyze it!"
              : "This user hasn't created any news yet."}
          </p>
          {isOwnProfile && (
            <Link href="/news/create">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Create First News
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active News */}
      {activeNews.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Active News ({activeNews.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeNews.map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </div>
        </div>
      )}

      {/* Resolved News */}
      {resolvedNews.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Resolved News ({resolvedNews.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedNews.map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
