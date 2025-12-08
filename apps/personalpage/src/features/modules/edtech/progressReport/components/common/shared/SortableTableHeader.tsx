import React from "react";

interface SortableTableHeaderProps {
  label: string;
  field: string;
  currentSortField: string;
  currentDirection: "asc" | "desc";
  onSort: (field: string) => void;
  sortable?: boolean;
  tooltip?: string;
  className?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  field,
  currentSortField,
  currentDirection,
  onSort,
  sortable = true,
  tooltip,
  className = "",
}) => {
  const getSortIcon = (): string => {
    if (currentSortField !== field) return "↕️";
    return currentDirection === "asc" ? "↑" : "↓";
  };

  const baseClass = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase";
  const interactiveClass = sortable ? "cursor-pointer hover:bg-gray-100" : "";

  const handleClick = () => {
    if (sortable) {
      onSort(field);
    }
  };

  return (
    <th
      onClick={handleClick}
      title={tooltip}
      className={`${baseClass} ${interactiveClass} ${className}`}
    >
      {label} {sortable && getSortIcon()}
    </th>
  );
};

export default SortableTableHeader;
