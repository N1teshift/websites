import React from 'react';
import { UsePaginationReturn } from './types';
import { useFallbackTranslation } from '@/features/infrastructure/i18n';

export interface PageSizeControlsProps {
  pagination: Pick<UsePaginationReturn, 'pageSize' | 'totalItems' | 'handlePageSizeChange' | 'handleShowAll'>;
  pageSizeOptions: number[];
}

/**
 * Renders controls for changing the number of items displayed per page.
 * Includes buttons for predefined page sizes and an optional "Show All" button.
 *
 * @param props The component props.
 * @param props.pagination A subset of the pagination state and handlers, specifically `pageSize`, `totalItems`, `handlePageSizeChange`, and optionally `handleShowAll`.
 * @param props.pageSizeOptions An array of numbers representing the available page size options (e.g., [10, 50, 100]).
 * @returns A React element containing the page size control buttons.
 */
export const PageSizeControls: React.FC<PageSizeControlsProps> = ({
  pagination,
  pageSizeOptions,
}) => {
  const { t } = useFallbackTranslation();

  const {
    pageSize,
    totalItems,
    handlePageSizeChange,
    handleShowAll
  } = pagination;

  // Determine if the "All" option is currently active
  // This happens if handleShowAll is defined, pageSize is greater than or equal to totalItems, and totalItems is positive.
  const isShowingAll = handleShowAll ? pageSize >= totalItems && totalItems > 0 : false;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-text-secondary">{t('show')}:</span>
      {pageSizeOptions.map(size => (
        <button
          key={size}
          type="button"
          className={`px-2 py-1 text-xs rounded ${pageSize === size && !isShowingAll
              ? 'bg-brand-primary text-text-inverse font-medium'
              : 'bg-surface-button text-text-primary hover:bg-surface-button-hover'
            }`}
          onClick={() => handlePageSizeChange(size)}
          // Disable the button if "All" is active and this button's size matches the current pageSize
          disabled={isShowingAll && size === pageSize}
        >
          {size}
        </button>
      ))}
      {handleShowAll && (
        <button
          type="button"
          className={`px-2 py-1 text-xs rounded ${isShowingAll
              ? 'bg-brand-primary text-text-inverse font-medium'
              : 'bg-surface-button text-text-primary hover:bg-surface-button-hover'
            }`}
          onClick={handleShowAll}
        >
          {t('all')}
        </button>
      )}
    </div>
  );
}; 



