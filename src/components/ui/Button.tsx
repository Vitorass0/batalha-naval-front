/**
 * Button Component - Naval Design System
 * 
 * High contrast button with loading state support.
 * Adheres to flat/deep naval aesthetic.
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  /** Size preset */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show loading spinner and disable interactions */
  isLoading?: boolean;
}

/**
 * Loading spinner component
 */
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium',
      'rounded-md transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-naval-bg',
      'disabled:pointer-events-none disabled:opacity-50'
    );

    const variants = {
      default: cn(
        'bg-naval-action text-naval-bg',
        'hover:bg-naval-action-hover',
        'focus:ring-naval-action'
      ),
      destructive: cn(
        'bg-naval-error text-white',
        'hover:bg-naval-error-hover',
        'focus:ring-naval-error'
      ),
      outline: cn(
        'border border-naval-border bg-transparent text-white',
        'hover:bg-naval-surface',
        'focus:ring-naval-action'
      ),
      ghost: cn(
        'bg-transparent text-white',
        'hover:bg-naval-surface',
        'focus:ring-naval-action'
      ),
      link: cn(
        'text-naval-action underline-offset-4',
        'hover:underline',
        'focus:ring-naval-action'
      ),
    };

    const sizes = {
      default: 'h-11 px-6 py-2 text-sm',
      sm: 'h-9 px-4 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
