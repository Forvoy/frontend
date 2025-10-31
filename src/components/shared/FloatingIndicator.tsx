'use client';

export type IndicatorType = 'loading' | 'success' | 'error';
export type IndicatorVariant = 'primary' | 'accent' | 'destructive' | 'default';

interface FloatingIndicatorProps {
  show: boolean;
  type: IndicatorType;
  message: string;
  variant?: IndicatorVariant;
  position?: 'top';
  txHash?: string; // Optional transaction hash for blockchain operations
}

const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  </div>
);

const getIcon = (type: IndicatorType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
};

const FloatingIndicator = ({
  show,
  type,
  message,
  variant = 'default',
  txHash
}: FloatingIndicatorProps) => {
  if (!show) return null;

  const getPositionStyles = () => {
    return 'fixed top-4 left-1/2 -translate-x-1/2 z-[2000]';
  };

  const getColorScheme = () => {
    if (type === 'loading') {
      return {
        bg: 'bg-card border-border',
        text: 'text-foreground',
        icon: 'text-muted-foreground',
      };
    }

    if (type === 'error') {
      return {
        bg: 'bg-red-500/10 border-red-500/50',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-600 dark:text-red-400',
      };
    }

    // Success state - variant-based colors
    switch (variant) {
      case 'destructive':
        return {
          bg: 'bg-red-500/10 border-red-500/50',
          text: 'text-red-600 dark:text-red-400',
          icon: 'text-red-600 dark:text-red-400',
        };
      case 'accent':
        return {
          bg: 'bg-accent/10 border-accent/50',
          text: 'text-accent',
          icon: 'text-accent',
        };
      case 'primary':
        return {
          bg: 'bg-primary/10 border-primary/50',
          text: 'text-primary',
          icon: 'text-primary',
        };
      case 'default':
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/50',
          text: 'text-emerald-600 dark:text-emerald-400',
          icon: 'text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className={`${getPositionStyles()} animate-in fade-in slide-in-from-top-2 duration-300`}>
      <div
        className={`
          flex flex-col gap-2
          ${colors.bg}
          rounded-lg px-4 py-3
          border shadow-lg shadow-black/10
          backdrop-blur-sm
          transition-all duration-300
          min-w-[320px] max-w-[500px]
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 ${colors.icon}`}>
            {type === 'loading' ? <Spinner /> : getIcon(type)}
          </div>

          <span className={`${colors.text} text-sm font-medium flex-1`}>{message}</span>
        </div>

        {/* Transaction Hash Link */}
        {txHash && type === 'success' && (
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-7 flex items-center gap-1"
          >
            View on BaseScan
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default FloatingIndicator;
