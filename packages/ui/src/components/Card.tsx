import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {

        const baseStyles = "rounded-xl border text-text-primary shadow-sm transition-all";

        const variants = {
            default: "bg-surface-card border-border-default",
            glass: "bg-surface-glass border-border-default/50 backdrop-blur-md"
        };

        const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`.trim();

        return (
            <div
                ref={ref}
                className={combinedClassName}
                {...props}
            />
        );
    }
);

Card.displayName = "Card";

export default Card;

