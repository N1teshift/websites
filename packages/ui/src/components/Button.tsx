import React from 'react';

type BaseButtonProps = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'subliminal' | 'success' | 'danger';
    size?: 'sm' | 'md' | 'lg';
};

type ButtonAsButton = BaseButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
};

type ButtonAsLink = BaseButtonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
    as: 'a';
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({ className = '', variant = 'subliminal', size = 'md', as: Component = 'button', ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-accent disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

        const variants = {
            primary: "bg-brand text-text-inverse hover:bg-brand-hover shadow-sm font-bold",
            secondary: "bg-surface-card border border-border-default text-text-primary hover:bg-surface-button-hover shadow-sm",
            ghost: "hover:bg-surface-button-hover hover:text-text-primary",
            subliminal: "bg-surface-button border border-brand/30 text-brand hover:bg-surface-button-hover hover:border-brand/60 backdrop-blur-sm shadow-sm",
            success: "bg-success-500 text-white hover:bg-success-600 shadow-sm",
            danger: "bg-danger-500 text-white hover:bg-danger-600 shadow-sm",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-9 px-4 py-2 text-sm",
            lg: "h-10 px-8 text-base"
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        return (
            <Component
                ref={ref as any}
                className={combinedClassName}
                {...(props as any)}
            />
        );
    }
);

Button.displayName = "Button";

export default Button;

