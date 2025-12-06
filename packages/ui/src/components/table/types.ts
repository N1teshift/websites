import React from 'react';

/**
 * Defines the structure for rendering and interacting with a single table column.
 * T represents the type of the data item for a row.
 */
export interface ColumnDefinition<T> {
    /** 
     * Unique key for the column, usually corresponding to a property in T.
     * Used for internal mapping and potentially for sorting/filtering keys.
     */
    key: keyof T | string; // Allow string for potentially derived keys
    /** 
     * Content to display in the table header cell for this column.
     * Can be a simple string or a more complex React node.
     */
    header: React.ReactNode;
    /**
     * Function that takes a data item (of type T) and returns the 
     * React node to render in the table body cell for this column.
     * This encapsulates the rendering logic for the cell.
     */
    renderCell: (item: T) => React.ReactNode;
    /** 
     * Optional: Indicates if this column should be sortable.
     * Defaults to false if not provided.
     */
    sortable?: boolean;
    /**
     * Optional: Determines if the column should be visible by default.
     * Useful for columns that contain less critical information.
     * Defaults to true if not provided.
     */
    initialVisible?: boolean;
    className?: string; // Optional Tailwind or custom class for column width/style
}

/**
 * Defines the structure for a filter control associated with the table.
 * T represents the type of the data item for a row.
 */
export interface FilterDefinition<T> {
    /** 
     * Unique key for the filter, often corresponding to a property in T.
     * Used to associate the filter control with the data property it filters.
     */
    key: keyof T | string; // Allow string for potentially derived keys
    /** 
     * User-friendly label displayed for the filter section.
     */
    label: string;
    /**
     * Defines the available options for this filter.
     * Can be a static array of strings or a function that dynamically 
     * generates options based on the current table items.
     */
    options: string[] | ((items: T[]) => string[]);
    /**
     * Optional: Specifies the initially selected filter values.
     * Defaults to an empty array (no selection) if not provided.
     */
    initialValues?: string[];
}

/**
 * Represents the current sorting state of the table.
 * T represents the type of the data item for a row.
 */
export interface SortState<T> {
    /**
     * The key of the column currently being sorted.
     * Null if no sorting is applied.
     */
    key: keyof T | string | null;
    /**
     * The direction of the sort (true for ascending, false for descending).
     */
    ascending: boolean;
}

/**
 * Represents the state of active filters applied to the table.
 * T represents the type of the data item for a row.
 * The keys usually correspond to the `key` property in FilterDefinition.
 * The values are arrays of the selected options for each filter key.
 */
export type ActiveFilters<T> = Partial<Record<keyof T | string, string[]>>;

/**
 * Represents the state required for pagination.
 */
export interface PaginationState {
    /** The current page number (1-indexed). */
    currentPage: number;
    /** The number of items displayed per page. */
    pageSize: number;
    /** Total number of items across all pages. */
    totalItems: number;
    /** Total number of pages. */
    totalPages: number;
    /** Index of the first item on the current page (0-indexed). */
    startIndex: number;
    /** Index of the last item on the current page (0-indexed, exclusive). */
    endIndex: number;
}

/**
 * Represents the options for configuring pagination.
 */
export interface PaginationOptions {
    /** The default number of items per page. */
    defaultPageSize?: number;
    /** An array of available page sizes for the user to choose from. */
    pageSizeOptions?: number[];
    /** Optional local storage key to persist page size preference. */
    localStorageKey?: string; 
}

/**
 * Represents the options for configuring row selection functionality.
 * T represents the type of the data item for a row.
 */
export interface SelectionOptions<T> {
    /** The array of currently selected items. */
    selectedItems: T[];
    /** Callback function invoked when a single row's selection state is toggled. */
    onToggleItem: (item: T) => void;
    /** Callback function invoked to select or deselect all visible items. */
    onSelectAll: (items: T[], select: boolean) => void;
    /** The key within the item object T that uniquely identifies each item. */
    itemKey: keyof T;
}

export interface UsePaginationReturn extends PaginationState {
  pageInputValue: string;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handlePageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleShowAll?: () => void;
} 

