import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  secondary: 'bg-bg-tertiary text-text-primary hover:bg-border',
  ghost: 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-border text-text-primary hover:bg-bg-tertiary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2',
};

const Button = forwardRef(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
