import React, { useState, useRef, useEffect } from 'react';
import { ColumnDefinition } from './types';
import { FiSettings } from 'react-icons/fi';
import { useFallbackTranslation } from '@/features/infrastructure/i18n';

export interface GenericColumnVisibilityControlsProps<T> {
  columns: ColumnDefinition<T>[];
  visibleColumns: string[];
  onVisibilityChange: (key: keyof T | string, isVisible: boolean) => void;
}

/**
 * Renders a dropdown menu allowing users to toggle the visibility of table columns.
 *
 * @template T The type of data items in the table.
 * @param props The component props.
 * @returns A React element containing the column visibility toggle button and dropdown menu.
 */
export function GenericColumnVisibilityControls<T>(props: GenericColumnVisibilityControlsProps<T>): React.ReactElement {
  const {
    columns,
    visibleColumns,
    onVisibilityChange,
  } = props;

  const { t } = useFallbackTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleColumnToggle = (key: keyof T | string) => {
    const keyString = String(key);
    const isVisible = visibleColumns.includes(keyString);
    onVisibilityChange(key, !isVisible);
  };

  return (
    <div className="relative ml-2" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggleMenu}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        title={t('toggle_columns')}
      >
        <FiSettings className="h-4 w-4" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-20">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-700 uppercase">
              {t('visible_columns')}
            </div>
            {columns.map((column) => {
              if (!column.header) return null;
              const keyString = String(column.key);
              const isVisible = visibleColumns.includes(keyString);
              const displayHeader = typeof column.header === 'string' ? t(column.header) : column.header;

              return (
                <label 
                  key={keyString}
                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="truncate" title={typeof displayHeader === 'string' ? displayHeader : keyString}>
                    {displayHeader}
                  </span>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => handleColumnToggle(column.key)}
                    className="form-checkbox h-4 w-4 text-blue-600 ml-2"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 



