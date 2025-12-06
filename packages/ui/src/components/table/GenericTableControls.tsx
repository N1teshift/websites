import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n';

// Simplified Props: Removed column visibility related props
interface GenericTableControlsProps {
  /** Optional configuration for row selection controls. */
  selectionProps?: {
    currentItemCount: number;
    selectedCount: number;
    onSelectAll: (select: boolean) => void;
    isDisabled?: boolean;
  };
  /** Optional: Whether to show the "Show Selected Only" filter toggle. */
  showFilterSelectedToggle?: {
    isActive: boolean;
    onToggle: (active: boolean) => void;
  };
}

/**
 * Renders controls for the `GenericTable`, currently focused on a "Show Selected Only" filter toggle.
 * Other controls like select/deselect all have been moved to more contextually appropriate locations
 * (e.g., select-all checkbox in the table header).
 *
 * @param props The component props.
 * @returns A React element containing the available table controls, or null if no controls are active.
 */
export const GenericTableControls = ({
  selectionProps,
  showFilterSelectedToggle,
}: GenericTableControlsProps): React.ReactElement | null => {
  const { t } = useFallbackTranslation();

  // Only show the filter toggle if present
  const hasFilterToggle = !!showFilterSelectedToggle;

  // If no controls are enabled, render nothing
  if (!hasFilterToggle) {
    return null;
  }

  return (
    <div className="bg-surface-card p-2 border-b border-border-default flex items-center justify-start flex-wrap gap-y-2 gap-x-2">
      {/* Only left side: Show Selected Only toggle */}
      {showFilterSelectedToggle && (
        <button
          type="button"
          className={`px-1.5 py-0.5 text-xs rounded ${showFilterSelectedToggle.isActive ? 'bg-brand-primary text-text-inverse' : 'bg-surface-button text-text-primary hover:bg-surface-button-hover'
            }`}
          onClick={() => showFilterSelectedToggle.onToggle(!showFilterSelectedToggle.isActive)}
          disabled={selectionProps?.isDisabled}
        >
          {showFilterSelectedToggle.isActive ? t('showing_selected') : t('show_selected')}
        </button>
      )}
    </div>
  );
}; 

