import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode | string; // emoji string or React component
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };
  className?: string;
}

/**
 * EMPTY STATE COMPONENT
 *
 * Reusable empty state UI for lists, search results, etc.
 * Previously duplicated across news, pools, profile pages.
 *
 * Features:
 * - Consistent empty state styling
 * - Optional icon/emoji display
 * - Primary and secondary actions
 * - Responsive design
 * - Customizable text
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon="🔍"
 *   title="No news found"
 *   description="Try adjusting your search criteria."
 *   action={{
 *     label: "Clear Filters",
 *     onClick: () => clearFilters()
 *   }}
 * />
 * ```
 *
 * With custom icon:
 * ```tsx
 * <EmptyState
 *   icon={<Search className="w-12 h-12 text-muted-foreground" />}
 *   title="No results"
 *   description="Start typing to search..."
 * />
 * ```
 *
 * Why Extracted:
 * - DRY principle (used 5+ times in app)
 * - Consistent UX for empty states
 * - Easier to update globally
 * - Better user guidance
 */
export function EmptyState({
  title,
  description,
  icon = "📭",
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={`border border-border bg-card ${className || ""}`}>
      <CardContent className="p-12 text-center">
        {/* Icon/Emoji */}
        <div className="mb-4">
          {typeof icon === "string" ? (
            <div className="text-6xl">{icon}</div>
          ) : (
            <div className="flex justify-center">{icon}</div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
                size="lg"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
                size="lg"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * EMPTY STATE VARIANTS
 *
 * Pre-configured empty states for common scenarios.
 */

interface EmptyVariantProps {
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

export function EmptyNewsState({
  onAction,
  onSecondaryAction,
}: EmptyVariantProps) {
  return (
    <EmptyState
      icon="📰"
      title="No news found"
      description="Try adjusting your search criteria or explore different categories."
      action={
        onAction
          ? {
              label: "Clear Filters",
              onClick: onAction,
              variant: "outline",
            }
          : undefined
      }
      secondaryAction={
        onSecondaryAction
          ? {
              label: "Create NEWS",
              onClick: onSecondaryAction,
            }
          : undefined
      }
    />
  );
}

export function EmptyPoolsState({ onAction }: EmptyVariantProps) {
  return (
    <EmptyState
      icon="🏊"
      title="No pools created yet"
      description="Be the first to create an analysis pool for this news prediction."
      action={
        onAction
          ? {
              label: "Create Pool",
              onClick: onAction,
            }
          : undefined
      }
    />
  );
}

export function EmptyStakesState({ onAction }: EmptyVariantProps) {
  return (
    <EmptyState
      icon="💰"
      title="No staking history"
      description="You haven't staked on any pools yet. Start staking to build your reputation."
      action={
        onAction
          ? {
              label: "Explore Pools",
              onClick: onAction,
            }
          : undefined
      }
    />
  );
}

export function EmptySearchState({ onAction }: EmptyVariantProps) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords."
      action={
        onAction
          ? {
              label: "Clear Search",
              onClick: onAction,
              variant: "outline",
            }
          : undefined
      }
    />
  );
}

export function EmptyAnalystsState() {
  return (
    <EmptyState
      icon="👥"
      title="No analysts found"
      description="No analysts match your filter criteria. Try adjusting your filters."
    />
  );
}
