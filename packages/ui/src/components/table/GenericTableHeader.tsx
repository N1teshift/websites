import React from 'react';
import { ColumnDefinition, SortState } from './types';
import CellCheckbox from './CellCheckbox';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

interface GenericTableHeaderProps<T> {
  /** Array of all column definitions for the table. */
  columns: ColumnDefinition<T>[];
  /** Array of keys for the columns that are currently visible. */
  visibleColumns: (keyof T | string)[];
  /** Current sort state (column key and direction). */
  sortState: SortState<T>;
  /** Callback function invoked when a sortable header is clicked. */
  onSortChange: (key: keyof T | string) => void;
  /** Whether to include a checkbox column for selection. */
  includeSelection?: boolean;
  /** Whether to include a status/indicator column. */
  includeStatus?: boolean; // Example: Could be used for row status indicators
  // Add selectionState for select-all checkbox
  selectionState?: {
    allSelected: boolean;
    someSelected: boolean;
    onSelectAll: (select: boolean) => void;
    isDisabled?: boolean;
  };
}

/**
 * Renders the header row (`<thead>`) for the `GenericTable`.
 * Displays column headers based on visibility and includes optional elements like
 * a select-all checkbox and a status indicator column.
 * Provides sorting functionality by clicking on sortable column headers.
 *
 * @template T The type of data items in the table.
 * @param props The component props.
 * @returns A React element representing the table header (`<thead>`).
 */
export function GenericTableHeader<T>(props: GenericTableHeaderProps<T>): React.ReactElement {
  const {
    columns,
    visibleColumns,
    sortState,
    onSortChange,
    includeSelection = false, // Default to false
    includeStatus = false,    // Default to false
    selectionState,
  } = props;

  const { t } = useFallbackTranslation();

  /**
   * Returns a sort indicator arrow ('↑' or '↓') if the column is the currently sorted column,
   * otherwise returns an empty string.
   *
   * @param key The key of the column to check.
   * @returns The sort indicator string or an empty string.
   */
  const getSortIndicator = (key: keyof T | string): string => {
    if (sortState.key === key) {
      return sortState.ascending ? ' ↑' : ' ↓';
    }
    return '';
  };

  /**
   * Filters the full list of column definitions to include only those marked as visible,
   * preserving their original order.
   */
  const visibleColumnDefs = columns.filter(col => visibleColumns.includes(col.key));

  return (
    <thead className="bg-surface-button">
      <tr>
        {/* Optional: Checkbox column for row selection */}
        {includeSelection && (
          <th scope="col" className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
            {/* Select-all checkbox for row selection */}
            {selectionState ? (
              <CellCheckbox
                checked={selectionState.allSelected}
                onChange={() => selectionState.onSelectAll(!selectionState.allSelected)}
                disabled={selectionState.isDisabled}
                title={selectionState.allSelected ? t('deselect_all') : t('select_all')}
                // Add a visual cue for indeterminate state using className
                className={selectionState.someSelected && !selectionState.allSelected ? 'ring-2 ring-blue-300' : ''}
              />
            ) : (
              <span />
            )}
          </th>
        )}

        {/* Optional: Status indicator column */}
        {includeStatus && (
          <th scope="col" className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-2 text-center text-xs font-medium text-text-secondary uppercase tracking-wider" title={t('status_column_title')}>
            {/* Icon or indicator can be placed here */}
            ⚡
          </th>
        )}

        {/* Render headers for visible columns */}
        {visibleColumnDefs.map((column) => {
          const isSortable = column.sortable ?? false; // Default sortable to false
          // Translate column.header if it's a string (assumed to be a key)
          const headerText = typeof column.header === 'string' ? t(column.header) : column.header;
          const sortIndicator = isSortable ? getSortIndicator(column.key) : '';

          // Basic styling, can be customized further via column definition if needed
          const className = `px-2 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${isSortable ? 'cursor-pointer' : ''} ${column.className || ''}`;

          return (
            <th
              key={column.key.toString()}
              scope="col"
              className={className}
              onClick={isSortable ? () => onSortChange(column.key) : undefined}
            >
              {headerText}
              {sortIndicator}
            </th>
          );
        })}
      </tr>
    </thead>
  );
} 

