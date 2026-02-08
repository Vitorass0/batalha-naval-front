/**
 * Input Component - Naval Design System
 * 
 * Custom styled input with dark background and explicit borders.
 * Supports error state visualization with red border.
 */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Display error state with red border */
  error?: boolean;
  /** Error message to display below the input */
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            // Base styles
            'flex h-11 w-full rounded-md border px-4 py-2 text-sm',
            // Naval Design System colors
            'bg-naval-bg border-naval-border text-white',
            'placeholder:text-naval-text-muted',
            // Focus state
            'focus:outline-none focus:ring-2 focus:ring-naval-action focus:border-transparent',
            // Transition
            'transition-colors duration-200',
            // Disabled state
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Error state
            error && 'border-naval-error focus:ring-naval-error',
            className
          )}
          ref={ref}
          aria-invalid={error}
          {...props}
        />
        {errorMessage && (
          <p className="mt-1.5 text-sm text-naval-error">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
