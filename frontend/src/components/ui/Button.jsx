import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({ 
    className, 
    variant = 'primary', 
    size = 'default', 
    isLoading = false, 
    disabled, 
    children, 
    leftIcon,
    rightIcon,
    ...props 
}, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
    
    const variants = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
        secondary: 'bg-surface-elevated text-foreground hover:bg-surface-muted border border-border shadow-sm',
        outline: 'border border-border text-foreground hover:bg-surface-muted',
        ghost: 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 shadow-sm',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow-sm',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
