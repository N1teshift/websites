import React from 'react';
import { UsePaginationReturn } from './types';
import { useFallbackTranslation } from '@/features/infrastructure/i18n';

export interface PageNavigationProps {
  pagination: UsePaginationReturn;
  showItemsCount?: boolean;
  itemLabelKey?: string;
}

/**
 * Renders pagination controls (First, Previous, Page Input, Next, Last) and optionally displays item count.
 *
 * @param props The component props.
 * @param props.pagination The pagination state and handlers obtained from a pagination hook (like `useDefaultPagination`).
 * @param props.showItemsCount Optional. If true, displays the count of items being shown (e.g., "Showing 1-10 of 50 items"). Defaults to false.
 * @param props.itemLabelKey Optional. Translation key for the item label used in the item count display (e.g., 'items_lowercase'). Defaults to 'items_lowercase'.
 * @returns A React element containing the page navigation controls.
 */
export const PageNavigation: React.FC<PageNavigationProps> = ({
  pagination,
  showItemsCount = false, // Default to false, parent can override
  itemLabelKey = 'items_lowercase',
}) => {
  const { t } = useFallbackTranslation();

  const {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    pageInputValue,
    handlePageChange,
    handlePageInputChange,
    handlePageInputKeyDown,
    handleShowAll,
  } = pagination;

  // Determine if "Show All" is active
  const isShowingAll = handleShowAll ? pageSize >= totalItems && totalItems > 0 : false;

  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1 || totalPages === 0}
        className="px-2 py-1 text-xs text-text-primary bg-surface-button rounded hover:bg-surface-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo; {t('first')}
      </button>
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
        className="px-2 py-1 text-xs text-text-primary bg-surface-button rounded hover:bg-surface-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lsaquo; {t('previous')}
      </button>
      <span className="text-sm text-text-secondary">{t('page')}</span>
      <input
        type="text"
        value={pageInputValue}
        onChange={handlePageInputChange}
        onKeyDown={handlePageInputKeyDown}
        className="w-12 px-2 py-1 text-xs border border-border-default rounded text-center bg-surface-card text-text-primary"
        aria-label={t('page_number_aria_label')}
        disabled={totalPages === 0}
      />
      <span className="text-sm text-gray-600">
        {t('of_lowercase')} {totalPages === 0 ? 1 : totalPages}
        {showItemsCount && totalItems > 0 && !isShowingAll &&
          ` | ${t('showing')} ${startIndex + 1}-${Math.min(endIndex, totalItems)} ${t('of_lowercase')} ${totalItems} ${t(itemLabelKey)}`}
        {showItemsCount && totalItems > 0 && isShowingAll &&
          ` | ${t('showing_all')} ${totalItems} ${t(itemLabelKey)}`}
      </span>
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-2 py-1 text-xs text-text-primary bg-surface-button rounded hover:bg-surface-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('next')} &rsaquo;
      </button>
      <button
        type="button"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-2 py-1 text-xs text-text-primary bg-surface-button rounded hover:bg-surface-button-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('last')} &raquo;
      </button>
    </div>
  );
}; 



