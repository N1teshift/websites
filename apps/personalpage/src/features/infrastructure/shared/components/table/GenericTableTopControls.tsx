import React from 'react';
import { GenericColumnVisibilityControls } from './GenericColumnVisibilityControls';
import { ColumnDefinition, UsePaginationReturn } from './types';
import { PageSizeControls } from './PageSizeControls';
import { PageNavigation } from './PageNavigation';

export interface GenericTableTopControlsProps<T> {
  pagination: UsePaginationReturn;
  pageSizeOptions: number[];
  showItemsCount?: boolean;
  itemLabelKey?: string;
  columns: ColumnDefinition<T>[];
  visibleColumns: string[];
  onVisibilityChange: (key: keyof T | string, isVisible: boolean) => void;
}

/**
 * Renders the top control bar for the GenericTable.
 * Combines page size controls, page navigation, and column visibility controls.
 *
 * @template T The type of data items in the table.
 * @param props The component props.
 * @returns A React element representing the top control bar.
 */
export function GenericTableTopControls<T>(props: GenericTableTopControlsProps<T>): React.ReactElement {
  const {
    pagination,
    pageSizeOptions,
    showItemsCount = false,
    itemLabelKey = 'items_lowercase',
    columns,
    visibleColumns,
    onVisibilityChange,
  } = props;

  return (
    <div className="flex items-center justify-between py-2 px-2 flex-wrap">
      {/* Left side: Page Size Controls */}
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <PageSizeControls pagination={pagination} pageSizeOptions={pageSizeOptions} />
      </div>

      {/* Middle: Page Navigation Controls */}
      <div className="flex-1 flex items-center justify-end space-x-2 mb-2 md:mb-0">
         <PageNavigation pagination={pagination} showItemsCount={showItemsCount} itemLabelKey={itemLabelKey} />
      </div>
     
      {/* Right side: Column Visibility Controls */}
      <div className="ml-0 md:ml-2">
        <GenericColumnVisibilityControls<T>
          columns={columns}
          visibleColumns={visibleColumns}
          onVisibilityChange={onVisibilityChange}
        />
      </div>
    </div>
  );
} 



