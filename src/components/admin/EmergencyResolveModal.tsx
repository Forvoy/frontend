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

interface EmergencyResolveModalProps {
  news: News;
  onClose: () => void;
  onEmergencyResolve: (outcome: 'YES' | 'NO', source: string, notes: string) => void;
}

export default function EmergencyResolveModal({ news, onClose, onEmergencyResolve }: EmergencyResolveModalProps) {
  const { address, isConnected } = useAccount();
  const { feedback, executeTransaction, showError } = useTransactionFeedback();

  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null);
  const [resolutionSource, setResolutionSource] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return;
    }

    if (!selectedOutcome || !resolutionSource) {
      showError('Please select an outcome and provide a data source');
      return;
    }

    if (!confirmed) {
      showError('Please confirm you understand this is an emergency action');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await executeTransaction(
        async () => {
          const resolveResult = await newsService.emergencyResolve(
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
        'Emergency resolving NEWS on blockchain...',
        `NEWS emergency resolved as ${selectedOutcome}! Rewards auto-distributed.`,
        selectedOutcome === 'YES' ? 'primary' : 'destructive'
      );

      if (result !== null) {
        // Call parent callback
        onEmergencyResolve(selectedOutcome, resolutionSource, resolutionNotes);

        // Close modal after short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to emergency resolve news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Floating Indicator */}
      <FloatingIndicator {...feedback} />

      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-red-500/50 bg-background shadow-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">⚡ Emergency Resolve</h2>
              <p className="text-sm text-muted-foreground">
                Admin emergency action: Bypass time restrictions and immediately resolve this news
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Emergency Warning */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-6">
            <div className="flex gap-3">
              <div className="text-red-600 text-xl">🚨</div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-red-600 mb-1">Emergency Resolution</div>
                <div className="text-muted-foreground">
                  This bypasses the normal 7-day waiting period and allows immediate resolution.
                  Use only for urgent situations requiring immediate intervention (e.g., market manipulation,
                  clear outcomes, security issues, etc.).
                </div>
              </div>
            </div>
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
                <span className="font-medium">Normal Resolution Date:</span> {new Date(news.endDate).toLocaleDateString()}
              </div>
              <div className="text-red-600 font-medium">
                ⚠️ Bypassing waiting period for immediate resolution
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

          {/* Emergency Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Emergency Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Explain why emergency resolution is necessary..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Explain why this requires emergency resolution instead of waiting for the normal period.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-medium mb-1">Emergency Action Confirmation</div>
                <div className="text-muted-foreground">
                  I understand this is an emergency action that bypasses normal waiting periods.
                  This should only be used in urgent situations requiring immediate resolution.
                </div>
              </div>
            </label>
          </div>

          {/* Final Warning */}
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-6">
            <div className="flex gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-yellow-600 mb-1">Final Warning</div>
                <div className="text-muted-foreground">
                  This action will immediately resolve ALL pools under this news and distribute rewards accordingly.
                  This cannot be undone and will bypass the normal 7-day waiting period.
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
              disabled={!selectedOutcome || !resolutionSource || !confirmed || isSubmitting || !isConnected}
              className={`flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700`}
            >
              {!isConnected
                ? 'Connect Wallet First'
                : isSubmitting
                ? 'Emergency Resolving...'
                : `⚡ Emergency Resolve as ${selectedOutcome || '...'}`
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}