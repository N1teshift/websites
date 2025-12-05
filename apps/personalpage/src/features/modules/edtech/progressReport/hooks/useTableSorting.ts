import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

interface UseTableSortingOptions<T> {
    data: T[];
    defaultSortField: string;
    defaultDirection?: SortDirection;
    comparators: Record<string, (a: T, b: T) => number>;
}

interface UseTableSortingReturn<T> {
    sortedData: T[];
    sortBy: string;
    sortDirection: SortDirection;
    handleSort: (field: string) => void;
    getSortIcon: (field: string) => string;
}

export function useTableSorting<T>({
    data,
    defaultSortField,
    defaultDirection = 'asc',
    comparators
}: UseTableSortingOptions<T>): UseTableSortingReturn<T> {
    const [sortBy, setSortBy] = useState<string>(defaultSortField);
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection);

    const sortedData = useMemo(() => {
        const comparator = comparators[sortBy];
        if (!comparator) return data;

        const sorted = [...data].sort(comparator);
        return sortDirection === 'asc' ? sorted : sorted.reverse();
    }, [data, sortBy, sortDirection, comparators]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string): string => {
        if (sortBy !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    return {
        sortedData,
        sortBy,
        sortDirection,
        handleSort,
        getSortIcon
    };
}




