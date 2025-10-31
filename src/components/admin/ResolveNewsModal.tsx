'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { News } from '@/types';
import FloatingIndicator from '@/components/shared/FloatingIndicator';
import { useTransactionFeedback } from '@/lib/hooks/useTransactionFeedback';
import { newsService } from '@/lib/services';

interface ResolveNewsModalProps {
  news: News;
  onClose: () => void;
  onResolve: (outcome: 'YES' | 'NO', source: string, notes: string) => void;
}

export default function ResolveNewsModal({ news, onClose, onResolve }: ResolveNewsModalProps) {
  const { address, isConnected } = useAccount();
  const { feedback, executeTransaction, showError } = useTransactionFeedback();

  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);
  const [resolutionSource, setResolutionSource] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return;
    }

    if (!selectedOutcome || !resolutionSource) {
      showError('Please select an outcome and provide a data source');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await executeTransaction(
        async () => {
          const resolveResult = await newsService.resolve(
            news.id,
            selectedOutcome,
            resolutionSource,
            resolutionNotes
          );

          return {
            success: resolveResult.success,
            hash: resolveResult.txHash,
            error: resolveResult.error
          };
        },
        'Resolving NEWS on blockchain...',
        `NEWS resolved as ${selectedOutcome}! Rewards auto-distributed.`,
        selectedOutcome === 'YES' ? 'primary' : 'destructive'
      );

      if (result !== null) {
        // Call parent callback
        onResolve(selectedOutcome, resolutionSource, resolutionNotes);

        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to resolve news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Floating Indicator */}
      <FloatingIndicator {...feedback} />

      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50 bg-background shadow-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Resolve News</h2>
              <p className="text-sm text-muted-foreground">
                Admin action: Determine the final outcome for this news
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* News Info */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{news.category}</Badge>
              <Badge variant="secondary">{news.status}</Badge>
            </div>
            <h3 className="font-semibold mb-2">{news.title}</h3>
            <div className="text-sm text-muted-foreground">
              <div className="mb-1">
                <span className="font-medium">Resolution Criteria:</span> {news.resolutionCriteria}
              </div>
              <div>
                <span className="font-medium">Resolution Date:</span> {new Date(news.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Outcome Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Select Final Outcome <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedOutcome('YES')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOutcome === 'YES'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <div className="text-3xl mb-2">✅</div>
                <div className="font-semibold">YES</div>
                <div className="text-xs text-muted-foreground mt-1">
                  The prediction came true
                </div>
              </button>
              <button
                onClick={() => setSelectedOutcome('NO')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOutcome === 'NO'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-border hover:border-red-500/50'
                }`}
              >
                <div className="text-3xl mb-2">❌</div>
                <div className="font-semibold">NO</div>
                <div className="text-xs text-muted-foreground mt-1">
                  The prediction did not come true
                </div>
              </button>
            </div>
          </div>

          {/* Resolution Source */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Data Source URL <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              placeholder="https://www.coingecko.com/..."
              value={resolutionSource}
              onChange={(e) => setResolutionSource(e.target.value)}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide a verifiable link to the data source (e.g., CoinGecko, official announcement, etc.)
            </p>
          </div>

          {/* Optional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Resolution Notes (Optional)
            </label>
            <Textarea
              placeholder="Add any additional context or explanation..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          {/* Warning */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <div className="flex gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-yellow-600 mb-1">Important</div>
                <div className="text-muted-foreground">
                  This action will resolve ALL pools under this news and distribute rewards accordingly. This cannot be undone.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedOutcome || !resolutionSource || isSubmitting || !isConnected}
              className={`flex-1 ${
                selectedOutcome === 'YES'
                  ? 'bg-green-500 hover:bg-green-600'
                  : selectedOutcome === 'NO'
                  ? 'bg-red-500 hover:bg-red-600'
                  : ''
              }`}
            >
              {!isConnected
                ? 'Connect Wallet First'
                : isSubmitting
                ? 'Resolving...'
                : `Resolve as ${selectedOutcome || '...'}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
