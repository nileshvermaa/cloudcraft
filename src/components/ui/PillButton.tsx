'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PillVariant = 'primary' | 'secondary' | 'danger';
type PillSize = 'sm' | 'md' | 'lg';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant;
  size?: PillSize;
  icon?: React.ReactNode;
  loading?: boolean;
  /** Stretch the button to fill its container (for menu stacks). */
  block?: boolean;
}

/**
 * PillButton — the candy 3D button (UI spec §PillButton).
 * A darker rounded "edge" wrapper with a lighter "face" offset up 6px.
 * Lifts on hover, presses on active. The only depth trick used; no blur shadows.
 */
export function PillButton({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  block = false,
  children,
  className,
  ...props
}: PillButtonProps) {
  return (
    <span
      className="pill"
      data-variant={variant}
      data-size={size}
      style={block ? { display: 'flex', width: '100%' } : undefined}
    >
      <button
        disabled={disabled || loading}
        className={cn('font-display', block && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'lg' ? 18 : 15} />
        ) : (
          icon
        )}
        {children}
      </button>
    </span>
  );
}
