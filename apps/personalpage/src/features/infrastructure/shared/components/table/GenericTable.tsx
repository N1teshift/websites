import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ColumnDefinition, FilterDefinition, SortState, ActiveFilters, PaginationOptions, PaginationState
} from './types';
import { GenericTableHeader } from './GenericTableHeader';
import { GenericTableRow } from './GenericTableRow';
import { GenericTableControls } from './GenericTableControls';
import { GenericTableFilters } from './GenericTableFilters';
import { GenericTableRowEmpty } from './GenericTableRowEmpty';
import { GenericTableTopControls } from './GenericTableTopControls';
import { GenericTableLoadingRow } from './GenericTableLoadingRow';
import { PageNavigation } from './PageNavigation';
import { createComponentLogger } from '@websites/infrastructure/logging';


// --- Default Hooks (can be overridden via props) ---

/**
 * Default pagination hook for the GenericTable.
 * Manages page state, page size, and navigation logic.
 *
 * @param totalItems The total number of items to paginate.
 * @param options Optional pagination configuration.
 * @returns Pagination state and handlers.
 */
// Default usePagination Hook (simplified example)
// Define the return type expected by GenericPaginationControls
export type UsePaginationReturn = PaginationState & {
    pageInputValue: string;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
    handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleShowAll?: () => void; // Make optional if not always provided
};

/**
 * Default pagination logic hook used by GenericTable.
 * Provides state and handlers for page navigation, page size changes, and input-based page jumps.
 *
 * @param totalItems Total number of items to paginate.
 * @param options Optional configuration for pagination (e.g., defaultPageSize).
 * @returns An object containing pagination state (currentPage, pageSize, etc.) and handler functions.
 */
const useDefaultPagination = (
    totalItems: number,
    options?: PaginationOptions
): UsePaginationReturn => {
    const defaultPageSize = options?.defaultPageSize ?? 50;

    // Always start with default page size to avoid SSR hydration issues
    const [pageSizeState, setPageSizeState] = useState(defaultPageSize);

    // Load page size from localStorage after component mounts (client-side only)
    useEffect(() => {
        if (!options?.localStorageKey || typeof window === 'undefined') {
            return;
        }

        try {
            const stored = localStorage.getItem(options.localStorageKey);
            if (stored) {
                const parsed = parseInt(stored, 10);
                // Validate the stored value is a reasonable page size
                if (!isNaN(parsed) && parsed > 0 && parsed <= 1000) {
                    setPageSizeState(parsed);
                }
            }
        } catch (e) {
            // Note: This is a localStorage error, not critical enough for structured logging
            console.warn('Failed to load page size from localStorage:', e);
        }
    }, [options?.localStorageKey]);

    // Save page size to localStorage when it changes
    const setPageSize = useCallback((newPageSize: number) => {
        setPageSizeState(newPageSize);

        if (options?.localStorageKey && typeof window !== 'undefined') {
            try {
                localStorage.setItem(options.localStorageKey, newPageSize.toString());
            } catch (e) {
                // Note: This is a localStorage error, not critical enough for structured logging
                console.warn('Failed to save page size to localStorage:', e);
            }
        }
    }, [options?.localStorageKey]);

    const pageSize = pageSizeState;

    const [currentPage, setCurrentPage] = useState(1);
    const [pageInputValue, setPageInputValue] = useState('1');

    // Recalculate based on totalItems or pageSize changes
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    useEffect(() => {
        // Adjust current page if it becomes invalid due to data changes
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
            setPageInputValue(totalPages.toString());
        }
    }, [totalPages, currentPage]);

    const handlePageChange = useCallback((page: number) => {
        const newPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(newPage);
        setPageInputValue(newPage.toString());
    }, [totalPages]);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to page 1 when size changes
        setPageInputValue('1');
    }, [setPageSize]);

    const handleShowAll = useCallback(() => {
        setPageSize(totalItems > 0 ? totalItems : 1); // Show all, ensure pageSize is at least 1
        setCurrentPage(1);
        setPageInputValue('1');
    }, [totalItems, setPageSize]);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInputValue(e.target.value);
    };

    const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const inputPage = parseInt(pageInputValue, 10);
            if (!isNaN(inputPage)) {
                handlePageChange(inputPage);
            }
        }
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        startIndex,
        endIndex,
        pageInputValue,
        handlePageChange,
        handlePageSizeChange,
        handlePageInputChange,
        handlePageInputKeyDown,
        handleShowAll,
    };
};

/**
 * Default sorting function for the GenericTable.
 * Sorts items based on a specified key and direction (ascending/descending).
 * 
 * @template T The type of items being sorted.
 * @param items The array of items to sort.
 * @param sortState The current sort state (key and direction).
 * @returns A new array with the items sorted.
 */
// Default Sorting Logic (can be extended for complex types)
const defaultSortFunction = <T,>(
    items: T[],
    sortState: SortState<T>
): T[] => {
    if (!sortState.key) return items;

    const sorted = [...items].sort((a, b) => {
        const valA = a[sortState.key as keyof T];
        const valB = b[sortState.key as keyof T];

        // Basic comparison, might need refinement for different data types
        if (valA < valB) return sortState.ascending ? -1 : 1;
        if (valA > valB) return sortState.ascending ? 1 : -1;
        return 0;
    });
    return sorted;
};

/**
 * Default filtering function for the GenericTable.
 * Filters items based on active filter values for specified keys.
 *
 * @template T The type of items being filtered.
 * @param items The array of items to filter.
 * @param activeFilters An object mapping filter keys to arrays of active filter values.
 * @returns A new array with the items filtered.
 */
// Default Filtering Logic
const defaultFilterFunction = <T,>(
    items: T[],
    activeFilters: ActiveFilters<T>
): T[] => {
    let filteredItems = items;
    Object.entries(activeFilters).forEach(([key, values]) => {
        // Ensure values array exists and is not empty or just ['all']
        if (values && values.length > 0 && !(values.length === 1 && values[0] === 'all')) {
            filteredItems = filteredItems.filter(item => {
                const itemValue = item[key as keyof T];
                // Convert itemValue to string for consistent comparison
                const itemValueString = String(itemValue).toLowerCase();
                // Convert all filter values to lowercase strings for comparison
                const filterValStrings = values.map(fv => String(fv).toLowerCase());
                // Check if the stringified item value is included in the processed filter values
                return filterValStrings.includes(itemValueString);
            });
        }
    });
    return filteredItems;
};

// --- GenericTable Props ---

export interface GenericTableProps<T> {
    /** Unique ID for the table, useful for aria attributes or targeting. */
    tableId: string;
    /** The raw data items to display in the table. */
    items: T[];
    /** Definitions for each column in the table. */
    columns: ColumnDefinition<T>[];
    /** Optional: Definitions for filter controls. */
    filterDefinitions?: FilterDefinition<T>[];
    /** Optional: Configuration for pagination. */
    paginationOptions?: PaginationOptions;
    /** Optional: Configuration for row selection. */
    selectionOptions?: {
        selectedItems: T[];
        onToggleItem: (item: T) => void;
        onSelectAll: (items: T[], select: boolean) => void;
        itemKey: keyof T;
        isDisabled?: boolean;
    };
    /** Optional: Initial sort state. */
    initialSort?: SortState<T>;
    /** Optional: Initial active filters. */
    initialFilters?: ActiveFilters<T>;
    /** Optional: Provide a custom sorting function. */
    customSortFunction?: (items: T[], sortState: SortState<T>) => T[];
    /** Optional: Provide a custom filtering function. */
    customFilterFunction?: (items: T[], activeFilters: ActiveFilters<T>) => T[];
    /** Optional: Provide a custom pagination hook result. */
    customPagination?: UsePaginationReturn; // Use the exported type
    /** Optional: Display a loading indicator overlay. */
    isLoading?: boolean;
    /** Optional: Function to generate row class names. */
    rowClassName?: (item: T) => string;
    /** 
     * Optional: Key or function to generate unique row keys.
     * 
     * @important For optimal performance and stable React rendering, 
     * prefer using selectionOptions.itemKey instead of this prop.
     * This prop is mainly for cases where selection is not used.
     * 
     * @warning If neither selectionOptions.itemKey nor rowKey is provided,
     * the table will use array indices as keys, which may cause
     * unnecessary re-renders and lost state when items change.
     */
    rowKey?: keyof T | ((item: T) => string | number);
    /** Optional: Configuration for a status column. */
    statusOptions?: {
        getStatusKey: (item: T) => string | undefined;
        getStatusTitle?: (item: T) => string | undefined;
    };
    /** Optional: Control whether filter controls are shown */
    showFilters?: boolean;
    /** Optional: Control whether table controls (column visibility, select all) are shown */
    showControls?: boolean;
    /** Optional: Control whether top pagination is shown */
    showTopPagination?: boolean;
    /** Optional: Control whether bottom pagination is shown */
    showBottomPagination?: boolean;
}

// --- GenericTable Component ---

/**
 * A reusable and configurable table component.
 * Supports features like sorting, filtering, pagination, row selection, and column visibility.
 * It can be customized with custom data processing functions and various display options.
 *
 * @template T The type of data items displayed in the table.
 * @param props The properties for configuring the GenericTable.
 * @returns A React element representing the configured table.
 */
export function GenericTable<T>(props: GenericTableProps<T>): React.ReactElement {
    const {
        tableId,
        items,
        columns,
        filterDefinitions = [],
        paginationOptions = { defaultPageSize: 50, pageSizeOptions: [10, 50, 100] },
        selectionOptions,
        initialSort = { key: null, ascending: true },
        initialFilters = {},
        customSortFunction = defaultSortFunction,
        customFilterFunction = defaultFilterFunction,
        customPagination,
        isLoading = false,
        rowClassName,
        rowKey,
        statusOptions,
        showFilters = true,
        showControls = true,
        showTopPagination = true,
        showBottomPagination = true,
    } = props;

    // --- State Management ---
    const [sortState, setSortState] = useState<SortState<T>>(initialSort);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters<T>>(initialFilters);
    const [visibleColumns, setVisibleColumns] = useState<(keyof T | string)[]>(() =>
        columns.filter(c => c.initialVisible !== false).map(c => c.key)
    );

    // --- Data Processing Pipeline ---

    // 1. Filtering
    const filteredItems = useMemo(() =>
        customFilterFunction(items, activeFilters),
        [items, activeFilters, customFilterFunction]);

    // 2. Sorting
    const sortedItems = useMemo(() =>
        customSortFunction(filteredItems, sortState),
        [filteredItems, sortState, customSortFunction]);

    // 3. Pagination
    // Call the default hook unconditionally
    const defaultPaginationResult = useDefaultPagination(sortedItems.length, paginationOptions);
    // Use the custom pagination if provided, otherwise use the default
    const pagination = customPagination ?? defaultPaginationResult;

    const currentPageItems = useMemo(() =>
        sortedItems.slice(pagination.startIndex, pagination.endIndex),
        [sortedItems, pagination.startIndex, pagination.endIndex]);

    const logger = createComponentLogger('GenericTable');

    // Development warning for missing stable keys
    if (process.env.NODE_ENV === 'development' && !selectionOptions?.itemKey && !rowKey) {
        logger.warn('No stable row key provided. Consider providing selectionOptions.itemKey or rowKey prop for better performance and stable React rendering.', {
            hasSelectionOptions: !!selectionOptions,
            hasRowKey: !!rowKey,
            tableId
        });
    }

    // --- Handlers ---
    const handleSortChange = useCallback((key: keyof T | string) => {
        setSortState(prev => ({
            key,
            ascending: prev.key === key ? !prev.ascending : true,
        }));
    }, []);

    const handleFilterChange = useCallback((filterKey: keyof ActiveFilters<T>, values: string[]) => {
        setActiveFilters(prev => ({
            ...prev,
            [filterKey]: values,
        }));
        // Reset pagination to page 1 when filters change
        pagination.handlePageChange(1);
    }, [pagination]); // Dependency array includes pagination object

    const handleVisibilityChange = useCallback((key: keyof T | string, isVisible: boolean) => {
        setVisibleColumns(prev =>
            isVisible ? [...prev, key] : prev.filter(k => k !== key)
        );
    }, []);

    const handleSelectAll = useCallback((select: boolean) => {
        if (selectionOptions) {
            // Pass the currently visible page items to the callback
            selectionOptions.onSelectAll(currentPageItems, select);
        }
    }, [selectionOptions, currentPageItems]);

    // --- Render Logic ---

    // Calculate colSpan for the empty row message
    const colSpan = visibleColumns.length + (selectionOptions ? 1 : 0) + (statusOptions ? 1 : 0);

    // --- Selection logic for select-all checkbox ---
    let selectionState = undefined;
    if (selectionOptions) {
        // Determine which current page items are selected
        const selectedKeys = new Set(selectionOptions.selectedItems.map(item => item[selectionOptions.itemKey]));
        const currentPageKeys = currentPageItems.map(item => item[selectionOptions.itemKey]);
        const selectedCount = currentPageKeys.filter(key => selectedKeys.has(key)).length;
        const allSelected = currentPageItems.length > 0 && selectedCount === currentPageItems.length;
        const someSelected = selectedCount > 0 && !allSelected;
        selectionState = {
            allSelected,
            someSelected,
            onSelectAll: (select: boolean) => selectionOptions.onSelectAll(currentPageItems, select),
            isDisabled: selectionOptions.isDisabled || isLoading,
        };
    }

    return (
        <div className="space-y-4">
            {/* Optional Filters */}
            {showFilters && filterDefinitions.length > 0 && (
                <GenericTableFilters
                    allItems={items} // Pass original items for dynamic options
                    filterDefinitions={filterDefinitions}
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                />
            )}

            {/* Table container */}
            <div className="relative">
                {/* Sticky Controls/Header Area */}
                <div className="sticky top-0 z-10 bg-surface-card shadow-sm border border-border-default rounded-t-lg">
                    {/* Optional Controls (Now only selection-related) */}
                    {showControls && (
                        <GenericTableControls
                            selectionProps={selectionOptions ? {
                                currentItemCount: currentPageItems.length,
                                selectedCount: selectionOptions.selectedItems.length,
                                onSelectAll: handleSelectAll,
                                isDisabled: selectionOptions.isDisabled || isLoading,
                            } : undefined}
                        />
                    )}

                    {/* Optional Top Pagination (Now includes column settings) */}
                    {showTopPagination && (
                        <GenericTableTopControls<T>
                            pagination={pagination}
                            pageSizeOptions={paginationOptions?.pageSizeOptions ?? [10, 50, 100]}
                            itemLabelKey="items"
                            columns={columns}
                            visibleColumns={visibleColumns.map(String)}
                            onVisibilityChange={handleVisibilityChange}
                        />
                    )}
                </div>

                {/* Table Body Area */}
                <div className={`bg-surface-card rounded-b-lg shadow-sm border border-t-0 border-border-default ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full divide-y divide-border-default text-sm table-fixed" aria-labelledby={`${tableId}-title`}>
                            <GenericTableHeader
                                columns={columns}
                                visibleColumns={visibleColumns}
                                sortState={sortState}
                                onSortChange={handleSortChange}
                                includeSelection={!!selectionOptions}
                                includeStatus={!!statusOptions}
                                selectionState={selectionState}
                            />
                            <tbody className="bg-surface-card divide-y divide-border-default">
                                {isLoading && (
                                    <GenericTableLoadingRow colSpan={colSpan} messageKey="loading" />
                                )}
                                {!isLoading && currentPageItems.length > 0 && (
                                    currentPageItems.map((item, index) => {
                                        const isSelected = selectionOptions ? selectionOptions.selectedItems.some(selected => item[selectionOptions.itemKey] === selected[selectionOptions.itemKey]) : false;

                                        const itemStatusKey = statusOptions?.getStatusKey(item);
                                        const itemStatusTitle = statusOptions?.getStatusTitle ? statusOptions.getStatusTitle(item) : undefined;

                                        return (
                                            <GenericTableRow
                                                key={selectionOptions?.itemKey
                                                    ? item[selectionOptions.itemKey] as string | number
                                                    : (rowKey ? (typeof rowKey === 'function' ? rowKey(item) : item[rowKey] as string | number) : index)
                                                }
                                                item={item}
                                                columns={columns}
                                                visibleColumns={visibleColumns}
                                                selectionOptions={selectionOptions ? {
                                                    isSelected,
                                                    onToggleItem: selectionOptions.onToggleItem,
                                                    isDisabled: selectionOptions.isDisabled || isLoading,
                                                } : undefined}
                                                statusOptions={statusOptions ? {
                                                    statusKey: itemStatusKey,
                                                    statusTitle: itemStatusTitle,
                                                } : undefined}
                                                rowClassName={rowClassName}
                                                rowKey={selectionOptions?.itemKey
                                                    ? (item: T) => item[selectionOptions!.itemKey] as string | number
                                                    : rowKey
                                                }
                                                rowIndex={index}
                                            />
                                        );
                                    })
                                )}
                                {!isLoading && currentPageItems.length === 0 && (
                                    <GenericTableRowEmpty colSpan={colSpan} messageKey="no_items_match" />
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Optional Bottom Pagination */}
            {showBottomPagination && (
                // Use PageNavigation directly, wrapped in a div for layout consistency
                <div className="flex justify-center items-center py-2 px-2 space-x-2 flex-wrap">
                    <PageNavigation
                        pagination={pagination}
                        showItemsCount={true} // Explicitly true for bottom pagination in GenericTable
                        itemLabelKey="items_lowercase" // Consistent with previous itemLabelKey for bottom
                    />
                </div>
            )}
        </div>
    );
} 



