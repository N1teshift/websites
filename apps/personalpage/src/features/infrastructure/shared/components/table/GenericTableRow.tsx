import React from 'react';
import { ColumnDefinition } from './types';
import CellCheckbox from './CellCheckbox';
import { createComponentLogger } from '@websites/infrastructure/logging';

// Assuming StatusIndicator might be generalized or we pass a ReactNode via renderCell
// Placeholder for status indicator logic if needed directly in the row
/**
 * Placeholder component for rendering a status indicator within a table row.
 * Displays different icons based on the `statusKey`.
 *
 * @param props The component props.
 * @param props.statusKey Optional. A string key representing the status (e.g., 'running', 'passed').
 * @param props.title Optional. A title/tooltip for the status indicator.
 * @returns A span element with a status icon.
 */
const StatusIndicatorPlaceholder: React.FC<{ statusKey?: string; title?: string }> = ({ statusKey, title }) => (
  <span title={title}>{statusKey === 'running' ? '⏳' : statusKey === 'passed' ? '✅' : '-'}</span>
);

interface GenericTableRowProps<T> {
  /** The data item for the current row. */
  item: T;
  /** Array of all column definitions for the table. */
  columns: ColumnDefinition<T>[];
  /** Array of keys for the columns that are currently visible. */
  visibleColumns: (keyof T | string)[];
  /** Optional configuration for row selection. */
  selectionOptions?: {
    isSelected: boolean;
    onToggleItem: (item: T) => void;
    isDisabled?: boolean; // e.g., disable checkbox during loading states
  };
  /** Optional configuration for a status indicator column. */
  statusOptions?: {
    statusKey?: string; // Key to determine status (e.g., 'running', 'passed', 'failed')
    statusTitle?: string; // Tooltip for the status indicator
  };
  /** Optional: CSS class name for the row based on item data (e.g., highlighting). */
  rowClassName?: (item: T) => string;
  /** Optional: Key to uniquely identify the row. Prefer using selectionOptions.itemKey for better performance. */
  rowKey?: keyof T | ((item: T) => string | number);
  /** Index of the row in the current page (used as fallback for key generation). */
  rowIndex: number;
}

/**
 * Renders a single table row (`<tr>`) for the `GenericTable`.
 * It displays cells based on the visible columns and their `renderCell` definitions.
 * Includes optional cells for row selection checkboxes and status indicators.
 *
 * @template T The type of the data item for this row.
 * @param props The component props.
 * @returns A React element representing the table row (`<tr>`).
 */
export function GenericTableRow<T>(props: GenericTableRowProps<T>): React.ReactElement {
  const {
    item,
    columns,
    visibleColumns,
    selectionOptions,
    statusOptions,
    rowClassName,
    rowKey,
    rowIndex,
  } = props;

  const logger = createComponentLogger('GenericTableRow');

  // Generate stable row key with priority order
  const key = (() => {
    // Priority 1: explicit rowKey prop
    if (rowKey) {
      return typeof rowKey === 'function' ? rowKey(item) : item[rowKey] as string | number;
    }

    // Priority 2: fallback to index (stable but not ideal)
    return rowIndex;
  })();

  // Development warning for missing stable keys
  if (process.env.NODE_ENV === 'development' && !rowKey) {
    logger.warn('No stable row key provided. Consider providing rowKey prop or using selectionOptions.itemKey in GenericTable for better performance.', {
      rowIndex,
      itemType: typeof item,
      hasSelectionOptions: !!selectionOptions
    });
  }

  // Get class name for the row, applying default hover and transition
  const computedClassName = `transition-colors duration-150 hover:bg-surface-button-hover ${rowClassName ? rowClassName(item) : ''}`.trim();

  /**
   * Filters the full list of column definitions to include only those marked as visible,
   * preserving their original order.
   */
  const visibleColumnDefs = columns.filter(col => visibleColumns.includes(col.key));

  return (
    <tr key={key} className={computedClassName}>
      {/* Optional: Render selection checkbox cell */}
      {selectionOptions && (
        <td className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-2 whitespace-nowrap">
          <CellCheckbox
            checked={selectionOptions.isSelected}
            onChange={() => selectionOptions.onToggleItem(item)}
            disabled={selectionOptions.isDisabled}
            title={selectionOptions.isSelected ? "Deselect item" : "Select item"}
          />
        </td>
      )}

      {/* Optional: Render status indicator cell */}
      {statusOptions && (
        <td className="w-[40px] min-w-[40px] max-w-[40px] px-2 py-2 whitespace-nowrap text-center">
          <StatusIndicatorPlaceholder
            statusKey={statusOptions.statusKey}
            title={statusOptions.statusTitle}
          />
        </td>
      )}

      {/* Render cells for visible columns using the renderCell function */}
      {visibleColumnDefs.map((column) => (
        <td key={column.key.toString()} className={`px-2 py-2 text-sm text-text-primary ${column.className || ''}`} style={{ minWidth: '100px' }}>
          {/* Render cell content using the provided function */}
          {column.renderCell(item)}
        </td>
      ))}
    </tr>
  );
} 



