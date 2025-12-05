import React from 'react';

export type CardColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'indigo';

export interface StatCard {
    label: string;
    value: string | number;
    color: CardColor;
    icon?: string;
    subtitle?: string;
}

interface StatisticsCardsProps {
    cards: StatCard[];
    columns?: 2 | 3 | 4;
}

const colorClasses: Record<CardColor, { bg: string; border: string; text: string; valueText: string }> = {
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        valueText: 'text-blue-900'
    },
    green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        valueText: 'text-green-900'
    },
    purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        valueText: 'text-purple-900'
    },
    orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        valueText: 'text-orange-900'
    },
    red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-600',
        valueText: 'text-red-900'
    },
    teal: {
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        text: 'text-teal-600',
        valueText: 'text-teal-900'
    },
    indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-600',
        valueText: 'text-indigo-900'
    }
};

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ cards, columns = 4 }) => {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {cards.map((card, index) => {
                const colors = colorClasses[card.color];
                return (
                    <div
                        key={index}
                        className={`${colors.bg} border-2 ${colors.border} rounded-lg p-4 flex flex-col justify-between`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`text-sm ${colors.text} font-medium capitalize`}>
                                {card.label}
                            </div>
                            {card.icon && <span className="text-2xl">{card.icon}</span>}
                        </div>
                        <div className={`text-3xl font-bold ${colors.valueText}`}>
                            {card.value}
                        </div>
                        {card.subtitle && (
                            <div className={`text-xs ${colors.text} mt-1`}>
                                {card.subtitle}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StatisticsCards;




