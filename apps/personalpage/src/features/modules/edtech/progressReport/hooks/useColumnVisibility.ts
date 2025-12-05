import { useState, useMemo, useEffect } from 'react';

export interface ColumnConfig {
    id: string;
    label: string;
    visible: boolean;
    tooltip?: {
        fullTitle: string;
        date?: string;
        description?: string;
    };
}

interface UseColumnVisibilityReturn {
    columns: ColumnConfig[];
    visibleColumns: ColumnConfig[];
    setColumns: (columns: ColumnConfig[]) => void;
    updateColumns: (newColumns: ColumnConfig[]) => void;
    toggleColumn: (id: string) => void;
    showAllColumns: () => void;
    isColumnVisible: (id: string) => boolean;
}

interface UseColumnVisibilityOptions {
    storageKey?: string;
}

export function useColumnVisibility(
    initialColumns: ColumnConfig[],
    options: UseColumnVisibilityOptions = {}
): UseColumnVisibilityReturn {
    const { storageKey = 'progress-report-column-visibility' } = options;

    // Load initial state from localStorage
    const getInitialColumns = (): ColumnConfig[] => {
        if (typeof window === 'undefined') return initialColumns;
        
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const savedVisibility: Record<string, boolean> = JSON.parse(saved);
                // Merge saved visibility with initial columns
                return initialColumns.map(col => ({
                    ...col,
                    visible: savedVisibility[col.id] !== undefined ? savedVisibility[col.id] : col.visible
                }));
            }
        } catch (error) {
            console.error('Failed to load column visibility from localStorage:', error);
        }
        return initialColumns;
    };

    const [columns, setColumnsState] = useState<ColumnConfig[]>(getInitialColumns);

    // Save to localStorage whenever columns change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        try {
            const visibility: Record<string, boolean> = {};
            columns.forEach(col => {
                visibility[col.id] = col.visible;
            });
            localStorage.setItem(storageKey, JSON.stringify(visibility));
        } catch (error) {
            console.error('Failed to save column visibility to localStorage:', error);
        }
    }, [columns, storageKey]);

    // Wrapper for setColumns that updates state
    const setColumns = (newColumns: ColumnConfig[]) => {
        setColumnsState(newColumns);
    };

    // Update columns while preserving visibility from saved state
    const updateColumns = (newColumns: ColumnConfig[]) => {
        setColumnsState(prev => {
            // Create a map of current visibility states
            const visibilityMap = new Map(prev.map(col => [col.id, col.visible]));
            
            // Apply saved visibility to new columns
            return newColumns.map(col => ({
                ...col,
                visible: visibilityMap.has(col.id) ? visibilityMap.get(col.id)! : col.visible
            }));
        });
    };

    const visibleColumns = useMemo(() => {
        return columns.filter(c => c.visible);
    }, [columns]);

    const toggleColumn = (id: string) => {
        setColumnsState(prev => prev.map(col =>
            col.id === id ? { ...col, visible: !col.visible } : col
        ));
    };

    const showAllColumns = () => {
        setColumnsState(prev => prev.map(col => ({ ...col, visible: true })));
    };

    const isColumnVisible = (id: string): boolean => {
        return columns.find(c => c.id === id)?.visible ?? false;
    };

    return {
        columns,
        visibleColumns,
        setColumns,
        updateColumns,
        toggleColumn,
        showAllColumns,
        isColumnVisible
    };
}




