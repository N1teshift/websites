import React from "react";
import { StudentData } from "../../../types/ProgressReportTypes";
import { getLatestAssessmentById } from "../../../utils/assessmentColumnUtils";
import EditableCell from "./EditableCell";
import { getCellColorClass } from "../../../utils/processing/cellStyling";
import { parseAssessmentColumnId } from "../../../utils/processing/studentSortComparators";

interface AssessmentCellProps {
  student: StudentData;
  column: {
    id: string;
    label: string;
  };
  displayValue: string;
  isEditing: boolean;
  hasEdit: boolean;
  studentKey: string;
  onEdit: (value: string) => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onCancel: () => void;
}

const AssessmentCell: React.FC<AssessmentCellProps> = ({
  student,
  column,
  displayValue,
  isEditing,
  hasEdit,
  studentKey: _studentKey,
  onEdit,
  onStartEdit,
  onEndEdit,
  onCancel,
}) => {
  // Parse assessment ID and score type from column ID using the centralized parser
  const { assessmentId } = parseAssessmentColumnId(column.id);

  const hasAssessment = getLatestAssessmentById(student, assessmentId) !== null;

  // Get cell color based on value
  const cellClassName = getCellColorClass(column.label, assessmentId, displayValue);

  return (
    <EditableCell
      key={column.id}
      value={displayValue}
      isEditing={isEditing}
      hasEdit={hasEdit}
      isEditable={hasAssessment}
      cellClassName={cellClassName}
      onEdit={onEdit}
      onStartEdit={onStartEdit}
      onEndEdit={onEndEdit}
      onCancel={onCancel}
    />
  );
};

export default AssessmentCell;
