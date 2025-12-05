import React, { useState, useEffect, ReactNode } from 'react';

interface CollapsibleSectionProps {
    title: string;
    icon?: string;
    children: ReactNode;
    defaultOpen?: boolean;
    badge?: string | number;
    id?: string; // Unique identifier for persistence
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    children,
    defaultOpen = true,
    badge,
    id
}) => {
    // Generate storage key from id or title
    const storageKey = id ? `collapsible-section-${id}` : `collapsible-section-${title.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Initialize state from localStorage if available
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return defaultOpen;
        const stored = localStorage.getItem(storageKey);
        return stored !== null ? stored === 'true' : defaultOpen;
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, String(isOpen));
        }
    }, [isOpen, storageKey]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-3">
                    {icon && <span className="text-2xl">{icon}</span>}
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    {badge !== undefined && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <svg
                    className={`w-6 h-6 text-gray-500 transition-transform duration-200 ${
                        isOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            
            {isOpen && (
                <div className="px-6 py-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleSection;




