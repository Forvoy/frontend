'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import Link from 'next/link';
import FloatingIndicator from '@/components/shared/FloatingIndicator';
import { useTransactionFeedback } from '@/lib/hooks/useTransactionFeedback';
import { newsService } from '@/lib/services';
import { useFarcasterNavigation } from '@/lib/hooks/useFarcasterNavigation';
import { useFarcaster } from '@/contexts/FarcasterProvider';
import {
  ClipboardCheck,
  Lightbulb,
  AlertTriangle,
  Check
} from 'lucide-react';

const CATEGORIES = ['Crypto', 'Macro', 'Tech', 'Sports', 'Politics'];

export default function CreateNewsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { feedback, executeTransaction } = useTransactionFeedback();
  const { navigateTo } = useFarcasterNavigation();
  const { isInFarcaster, user: farcasterUser } = useFarcaster();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Crypto',
    endDate: '',
    resolutionCriteria: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      const news = await executeTransaction(
        async () => {
          const result = await newsService.create({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            endDate: new Date(formData.endDate),
            resolutionCriteria: formData.resolutionCriteria
          });

          return {
            success: true,
            data: result
          };
        },
        'Creating NEWS on blockchain...',
        'NEWS created successfully!',
        'primary'
      );

      if (news) {
        // Auto-post to Farcaster if in MiniApp
        if (isInFarcaster && farcasterUser) {
          console.log('[Farcaster] Posting to Farcaster:', {
            text: `Just created a new prediction on @forter!\n\n${formData.title}\n\nCreate pools and stake: forter.app/news/${news.id}`,
            embeds: [],
            author: farcasterUser.username || `FID:${farcasterUser.fid}`
          });
        } else {
          console.log('[Farcaster] Not in MiniApp, skipping auto-post');
        }

        // Redirect after success feedback using Farcaster-aware navigation
        setTimeout(() => {
          navigateTo('/news');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create news:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim().length >= 10 &&
      formData.description.trim().length >= 50 &&
      formData.category &&
      formData.endDate &&
      new Date(formData.endDate) > new Date() &&
      formData.resolutionCriteria.trim().length >= 20
    );
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-16">
      {/* Floating Indicator */}
      <FloatingIndicator {...feedback} />

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
          <Link href="/news" className="hover:text-foreground transition-colors">
            News
          </Link>
          <span>/</span>
          <span className="text-foreground">Create NEWS</span>
        </div>

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">Create NEWS</h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg">
            Create a permissionless prediction or statement. Anyone can then create pools with analysis under your NEWS.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g., BTC will hit $100,000 before March 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-base"
                    maxLength={120}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs text-muted-foreground">
                      Minimum 10 characters
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.title.length}/120
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide context and background for this prediction. What factors are relevant? Why is this important?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] md:min-h-[120px] text-base resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs text-muted-foreground">
                      Minimum 50 characters
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.description.length}/500
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2.5">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFormData({ ...formData, category })}
                        className={`px-3 md:px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.category === category
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Date & Criteria - Side by side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {/* Resolution Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution Date <span className="text-destructive">*</span>
                    </label>
                    <DatePicker
                      value={formData.endDate}
                      onChange={(date) => setFormData({ ...formData, endDate: date })}
                      minDate={new Date().toISOString().split('T')[0]}
                      placeholder="Select date"
                    />
                    <div className="text-xs text-muted-foreground mt-1.5">
                      When will this be resolved?
                    </div>
                  </div>

                  {/* Resolution Criteria */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Resolution Criteria <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="e.g., BTC >= $100K on CoinGecko"
                      value={formData.resolutionCriteria}
                      onChange={(e) => setFormData({ ...formData, resolutionCriteria: e.target.value })}
                      className="min-h-[80px] text-sm resize-none"
                      maxLength={300}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="text-xs text-muted-foreground">
                        Min 20 chars
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formData.resolutionCriteria.length}/300
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    disabled={!isFormValid()}
                    className="w-full sm:flex-1 order-2 sm:order-1"
                  >
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isSubmitting || !isConnected}
                    className="w-full sm:flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 order-1 sm:order-2"
                  >
                    {!isConnected
                      ? 'Connect Wallet'
                      : isSubmitting
                      ? 'Creating...'
                      : 'Create NEWS'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && isFormValid() && (
              <Card className="border-2 border-accent bg-accent/5 mt-6">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3 md:mb-4 flex-wrap">
                    <Badge className="bg-primary/10 text-primary">{formData.category}</Badge>
                    <Badge className="bg-green-500/10 text-green-600">
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{formData.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">{formData.description}</p>

                  <div className="p-3 rounded-lg bg-background border border-border mb-3 md:mb-4">
                    <div className="text-xs font-medium text-accent mb-1">Resolution Criteria:</div>
                    <div className="text-sm text-muted-foreground">{formData.resolutionCriteria}</div>
                  </div>

                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span>
                      Resolves {new Date(formData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Guidelines - Hidden on mobile, show as accordion or bottom section */}
          <div className="space-y-4 md:space-y-6">
            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <span>Guidelines</span>
                </h3>
                <div className="space-y-2.5 md:space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Be specific and clear</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Set realistic dates</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Use verifiable criteria</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Avoid ambiguous language</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Include data sources</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span>What Happens Next?</span>
                </h3>
                <div className="space-y-2.5 md:space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2.5">
                    <span className="text-primary font-semibold flex-shrink-0">1.</span>
                    <span>Published instantly</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-primary font-semibold flex-shrink-0">2.</span>
                    <span>Auto-posted to Farcaster</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-primary font-semibold flex-shrink-0">3.</span>
                    <span>Others create pools</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-primary font-semibold flex-shrink-0">4.</span>
                    <span>Stakers back pools</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-primary font-semibold flex-shrink-0">5.</span>
                    <span>Resolved at date</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-500/30 bg-orange-500/5">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Important Note</span>
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    NEWS creators don&apos;t earn rewards directly. Your contribution is creating quality predictions.
                  </p>
                  <p className="text-primary font-medium">
                    To earn rewards, create pools with your analysis and stake!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
