import React from "react";

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  hasEdit: boolean;
  isEditable: boolean;
  onEdit: (value: string) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onCancel: () => void;
  cellClassName?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  isEditing,
  hasEdit,
  isEditable,
  onEdit,
  onStartEdit,
  onEndEdit,
  onCancel,
  cellClassName = "",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onEndEdit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const bgClassName = hasEdit ? "bg-yellow-50" : cellClassName;

  return (
    <td
      className={`px-4 py-3 text-sm text-gray-900 ${bgClassName}`}
      onClick={(e) => {
        if (isEditable && !isEditing) {
          e.stopPropagation();
          onStartEdit();
        }
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onEdit(e.target.value)}
          onBlur={onEndEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-1 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={`${isEditable ? "cursor-pointer hover:bg-gray-100 px-1 rounded" : ""}`}>
          {value === "" ? "\u00A0" : value}
        </span>
      )}
    </td>
  );
};

export default EditableCell;
