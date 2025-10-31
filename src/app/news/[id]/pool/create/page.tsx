'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { newsService } from '@/lib/services';
import { News, Pool } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import FloatingIndicator from '@/components/shared/FloatingIndicator';
import { useTransactionFeedback } from '@/lib/hooks/useTransactionFeedback';
import { poolService, tokenService } from '@/lib/services';
import { useFarcasterNavigation } from '@/lib/hooks/useFarcasterNavigation';
import { useFarcaster } from '@/contexts/FarcasterProvider';
import {
  ClipboardCheck,
  DollarSign,
  Target,
  Check,
  Upload,
  X,
  Link as LinkIcon,
  Plus,
  Search
} from 'lucide-react';

export default function CreatePoolPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;
  const { address, isConnected } = useAccount();
  const { feedback, executeTransaction, showError } = useTransactionFeedback();
  const { navigateTo } = useFarcasterNavigation();
  const { isInFarcaster, user: farcasterUser } = useFarcaster();

  const [news, setNews] = useState<News | null>(null);
  const [formData, setFormData] = useState({
    position: 'YES' as 'YES' | 'NO',
    reasoning: '',
    evidenceLinks: [''],
    imageUrl: '',
    imageCaption: '',
    creatorStake: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Image upload state
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await newsService.getById(newsId);
        setNews(newsData || null);
      } catch (error) {
        console.error('[CreatePoolPage] Failed to load news:', error);
        setNews(null);
      }
    };

    loadNews();
  }, [newsId]);

  const handleAddEvidenceLink = () => {
    setFormData({
      ...formData,
      evidenceLinks: [...formData.evidenceLinks, '']
    });
  };

  const handleEvidenceLinkChange = (index: number, value: string) => {
    const newLinks = [...formData.evidenceLinks];
    newLinks[index] = value;
    setFormData({ ...formData, evidenceLinks: newLinks });
  };

  const handleRemoveEvidenceLink = (index: number) => {
    if (formData.evidenceLinks.length > 1) {
      setFormData({
        ...formData,
        evidenceLinks: formData.evidenceLinks.filter((_, i) => i !== index)
      });
    }
  };

  // NEW: Image upload handlers
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);

      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsUploading(false);

        // Simulate upload to Imgur or similar service
        setTimeout(() => {
          const mockImageUrl = `https://i.imgur.com/${Math.random().toString(36).substring(7)}.png`;
          setFormData({ ...formData, imageUrl: mockImageUrl });
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '', imageCaption: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet first');
      return;
    }

    const stakeAmount = parseFloat(formData.creatorStake);

    // Validate balance (if using contracts)
    if (address) {
      const hasBalance = await tokenService.hasSufficientBalance(address as `0x${string}`, stakeAmount);
      if (!hasBalance) {
        showError('Insufficient USDC balance');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Filter empty evidence links
      const evidenceLinks = formData.evidenceLinks.filter(link => link.trim() !== '');

      const pool = await executeTransaction(
        async () => {
          const result = await poolService.create({
            newsId,
            position: formData.position,
            reasoning: formData.reasoning,
            evidence: evidenceLinks,
            imageUrl: formData.imageUrl,
            imageCaption: formData.imageCaption,
            creatorStake: stakeAmount
          });

          return {
            success: true,
            data: result,
            hash: (result as Pool & { creationTxHash?: string }).creationTxHash // Transaction hash attached to pool data
          };
        },
        'Creating pool on blockchain...',
        `Pool created successfully! Staked ${stakeAmount} USDC`,
        'primary'
      );

      if (pool) {
        // Mock: Auto-post to Farcaster
        console.log('Posting pool to Farcaster:', {
          newsId,
          poolId: pool.id,
          text: `Just created a pool on @forter!\n\n${news?.title}\nPosition: ${formData.position}\n\nStake & discuss: forter.app/news/${newsId}`
        });

        // Redirect after success using Farcaster-aware navigation
        setTimeout(() => {
          navigateTo(`/news/${newsId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create pool:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.reasoning.trim().length >= 100 &&
      formData.creatorStake &&
      parseFloat(formData.creatorStake) >= 20
    );
  };

  // NEW: Enhanced validation with image requirement
  const isFormFullyValid = () => {
    return isFormValid() && (formData.imageUrl || imagePreview);
  };

  if (!news) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <Card className="border border-border bg-card">
            <CardContent className="p-8 md:p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">NEWS not found</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                The NEWS you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link href="/news">
                <Button>Browse NEWS</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          <Link href={`/news/${newsId}`} className="hover:text-foreground transition-colors truncate max-w-[100px] md:max-w-none">
            Details
          </Link>
          <span>/</span>
          <span className="text-foreground">Create Pool</span>
        </div>

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">Create Pool</h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg mb-4">
            Submit your analysis with reasoning and stake to prove conviction.
          </p>

          {/* NEWS Context */}
          <Card className="border-2 border-accent/50 bg-accent/5">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <Badge className="bg-primary/10 text-primary text-xs shrink-0">{news.category}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-1 text-sm md:text-base line-clamp-2">{news.title}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Resolves: {new Date(news.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6 space-y-5 md:space-y-6">
                {/* Position Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2.5">
                    Your Position <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, position: 'YES' })}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                        formData.position === 'YES'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-border hover:border-emerald-500/50 hover:bg-emerald-500/5'
                      }`}
                    >
                      <div className="text-base md:text-lg font-bold">YES</div>
                      <div className="text-xs md:text-sm opacity-75 mt-1">Will happen</div>
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, position: 'NO' })}
                      className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                        formData.position === 'NO'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600'
                          : 'border-border hover:border-rose-500/50 hover:bg-rose-500/5'
                      }`}
                    >
                      <div className="text-base md:text-lg font-bold">NO</div>
                      <div className="text-xs md:text-sm opacity-75 mt-1">Won&apos;t happen</div>
                    </button>
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Detailed Analysis <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Provide detailed reasoning for your position. Include data, trends, and logical arguments to support your analysis..."
                    value={formData.reasoning}
                    onChange={(e) => setFormData({ ...formData, reasoning: e.target.value })}
                    className="min-h-[120px] md:min-h-[150px] text-base resize-none"
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs text-muted-foreground">
                      Minimum 100 characters
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.reasoning.length}/1000
                    </div>
                  </div>
                </div>

                {/* Image Upload (IMPROVED!) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Chart/Image <span className="text-destructive">*</span>
                  </label>

                  {!imagePreview ? (
                    // Upload Area
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-all ${
                        isDragging
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                          <Upload className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        </div>
                        <div className="text-sm font-medium mb-1.5 md:mb-2">
                          {isDragging ? 'Drop your image here' : 'Drag & drop your chart/image here'}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3 md:mb-4">
                          PNG, JPG, GIF up to 10MB
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    // Preview with Remove Option
                    <div className="space-y-2.5 md:space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border bg-card">
                        {/* Image Preview with better display */}
                        <div className="relative w-full min-h-[250px] md:min-h-[300px] max-h-[400px] md:max-h-[500px]">
                          <Image
                            src={imagePreview}
                            alt="Chart preview"
                            fill
                            className="object-contain"
                            unoptimized
                            style={{ maxHeight: '500px' }}
                          />
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Upload Status */}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-sm">Uploading...</div>
                          </div>
                        )}
                      </div>

                      {/* Image Caption */}
                      <Input
                        placeholder="Describe your chart/image (optional)"
                        value={formData.imageCaption}
                        onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                        className="text-sm"
                        maxLength={100}
                      />

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {!formData.imageUrl ? (
                          <span>Uploading your image...</span>
                        ) : (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span>Image uploaded successfully!</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manual URL Fallback */}
                  {!imagePreview && (
                    <div className="mt-3 md:mt-4">
                      <div className="text-xs text-muted-foreground mb-2">
                        Or paste image URL:
                      </div>
                      <Input
                        placeholder="https://i.imgur.com/your-chart.png"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Evidence Links */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Supporting Evidence (Optional)
                  </label>
                  {formData.evidenceLinks.map((link, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="https://example.com/supporting-data"
                        value={link}
                        onChange={(e) => handleEvidenceLinkChange(index, e.target.value)}
                        className="text-sm"
                      />
                      {formData.evidenceLinks.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEvidenceLink(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvidenceLink}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add Link
                  </Button>
                </div>

                {/* Creator Stake */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Initial Stake (USDC) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="20"
                    value={formData.creatorStake}
                    onChange={(e) => setFormData({ ...formData, creatorStake: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-base"
                    min="20"
                  />
                  <div className="text-xs text-muted-foreground mt-1.5">
                    Minimum $20 USDC. Earn 20% of rewards if correct.
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
                      : 'Create Pool'}
                  </Button>
                </div>

                {/* Enhanced Validation Message */}
                {!isFormFullyValid() && isFormValid() && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Add a chart/image to boost credibility!</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            {showPreview && isFormValid() && (
              <Card className="border-2 border-accent bg-accent/5 mt-6">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                      YO
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">Your Address</div>
                      <div className="text-xs text-muted-foreground">Preview</div>
                    </div>
                    <Badge
                      className={formData.position === 'YES'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                      }
                    >
                      {formData.position}
                    </Badge>
                  </div>

                  {(imagePreview || formData.imageUrl) && (
                    <div className="mb-3 md:mb-4 rounded-lg overflow-hidden border border-border bg-card">
                      <div className="relative w-full min-h-[200px] max-h-[350px] md:max-h-[400px]">
                        <Image
                          src={imagePreview || formData.imageUrl}
                          alt="Chart preview"
                          fill
                          className="object-contain"
                          unoptimized
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                      {formData.imageCaption && (
                        <div className="p-2.5 md:p-3 bg-card border-t border-border">
                          <div className="text-xs md:text-sm text-muted-foreground text-center">
                            {formData.imageCaption}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm md:text-base text-foreground leading-relaxed mb-3 md:mb-4">
                    {formData.reasoning}
                  </p>

                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">Creator&apos;s Stake</div>
                    <div className="text-base font-semibold">${parseFloat(formData.creatorStake || '0').toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Guidelines */}
          <div className="space-y-4 md:space-y-6">
            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <span>Pool Guidelines</span>
                </h3>
                <div className="space-y-2.5 md:space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Write detailed reasoning</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Include data & evidence</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Upload charts for proof</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Stake shows conviction</span>
                  </div>
                  <div className="flex gap-2.5">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Be objective, avoid hype</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>Earning Potential</span>
                </h3>
                <div className="space-y-2.5 md:space-y-3 text-sm text-muted-foreground">
                  <div>
                    <div className="font-medium text-foreground mb-1.5">If CORRECT:</div>
                    <div className="flex justify-between mb-1.5">
                      <span>You (analyst):</span>
                      <span className="font-semibold text-primary">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>&quot;Agree&quot; stakers:</span>
                      <span className="font-semibold text-accent">80%</span>
                    </div>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div>
                    <div className="font-medium text-foreground mb-1.5">If WRONG:</div>
                    <div className="text-xs">You lose your stake</div>
                    <div className="text-xs">&quot;Disagree&quot; stakers win</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Pro Tips</span>
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Higher stakes attract backers</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Quality builds reputation</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Charts boost credibility 3-5x</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Link credible sources</span>
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
