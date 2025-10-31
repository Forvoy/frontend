import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  format?: 'number' | 'currency' | 'percentage' | 'custom';
  prefix?: string;
  suffix?: string;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
}

/**
 * STAT CARD COMPONENT
 *
 * Reusable statistic display card used throughout the app.
 * Previously duplicated 10+ times across news, pools, profile pages.
 *
 * Features:
 * - Consistent styling with hover effects
 * - Optional icon display
 * - Number formatting (currency, percentage, etc.)
 * - Optional trend indicator
 * - Responsive design
 *
 * Usage:
 * ```tsx
 * <StatCard
 *   value={1234}
 *   label="Total Staked"
 *   format="currency"
 *   icon={DollarSign}
 *   iconClassName="text-green-500"
 * />
 * ```
 *
 * Why Extracted:
 * - DRY principle (Don't Repeat Yourself)
 * - Consistent UI across app
 * - Easier to update styling globally
 * - Reduces bundle size
 */
export function StatCard({
  value,
  label,
  icon: Icon,
  iconClassName,
  valueClassName,
  labelClassName,
  format = 'custom',
  prefix,
  suffix,
  description,
  trend,
}: StatCardProps) {
  // Format value based on type
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'number':
        return val.toLocaleString();
      case 'percentage':
        return `${val}%`;
      default:
        return prefix ? `${prefix}${val}` : suffix ? `${val}${suffix}` : String(val);
    }
  };

  const formattedValue = formatValue(value);

  return (
    <Card className="border border-border bg-card hover:bg-secondary transition-all duration-300 hover:scale-105 hover:shadow-md">
      <CardContent className="p-6 text-center">
        {/* Optional Icon */}
        {Icon && (
          <div className="flex justify-center mb-2">
            <Icon className={iconClassName || 'w-5 h-5 text-muted-foreground'} />
          </div>
        )}

        {/* Value */}
        <div className={valueClassName || 'text-2xl font-bold text-primary mb-1'}>
          {formattedValue}
        </div>

        {/* Label */}
        <div className={labelClassName || 'text-sm text-muted-foreground'}>
          {label}
        </div>

        {/* Optional Description */}
        {description && (
          <div className="text-xs text-muted-foreground/80 mt-1">
            {description}
          </div>
        )}

        {/* Optional Trend */}
        {trend && (
          <div className={`text-xs mt-2 font-medium ${
            trend.value > 0 ? 'text-green-600 dark:text-green-400' :
            trend.value < 0 ? 'text-red-600 dark:text-red-400' :
            'text-muted-foreground'
          }`}>
            {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}{' '}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * STAT GRID COMPONENT
 *
 * Grid container for multiple StatCards with responsive layout.
 *
 * Usage:
 * ```tsx
 * <StatGrid>
 *   <StatCard value={100} label="Active News" />
 *   <StatCard value={500} label="Total Pools" />
 *   <StatCard value={10000} label="Total Staked" format="currency" />
 * </StatGrid>
 * ```
 */
export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}
