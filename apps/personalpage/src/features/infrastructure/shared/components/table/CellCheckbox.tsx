import React from 'react';

export interface CellCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Function called when the checkbox is clicked */
  onChange: () => void;
  /** Tooltip text */
  title?: string;
  /** Optional className for custom styling (e.g., indeterminate state) */
  className?: string;
}

/**
 * Renders a custom styled checkbox, typically used within table cells for row selection.
 *
 * @param props The component props.
 * @returns A React element representing the custom checkbox.
 */
const CellCheckbox: React.FC<CellCheckboxProps> = ({
  checked,
  disabled = false,
  onChange,
  title,
  className
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className || ''}`}>
      <div
        onClick={() => {
          if (!disabled) {
            onChange();
          }
        }}
        className={`
          w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center
          ${checked
            ? 'bg-brand-primary border-brand-primary text-text-inverse'
            : 'bg-surface-card border-border-default hover:border-brand-primary'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        title={title}
        style={{ fontWeight: 'bold', fontSize: '14px' }}
      >
        {checked && "✓"}
      </div>
    </div>
  );
};

export default CellCheckbox; 



