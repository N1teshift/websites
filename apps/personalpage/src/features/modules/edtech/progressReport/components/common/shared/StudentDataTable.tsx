import React from 'react';
import { Tooltip } from 'react-tooltip';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { StudentData } from '../../../types/ProgressReportTypes';
import { getStudentFullName } from '../../../utils/progressReportUtils';
import { ColumnConfig } from '../../../hooks/useColumnVisibility';
import { CellEdit } from '../../../hooks/useInlineEditing';
import AssessmentCell from './AssessmentCell';
import { parseAssessmentColumnId, ScoreType } from '../../../utils/processing/studentSortComparators';

interface StudentDataTableProps {
    students: StudentData[];
    allStudents: StudentData[];
    visibleColumns: ColumnConfig[];
    searchQuery: string;
    getSortIcon: (field: string) => string;
    onSort: (field: string) => void;
    onStudentClick: (student: StudentData) => void;
    inlineEditing: {
        getCellValue: (student: StudentData, assessmentId: string, scoreType: ScoreType) => string;
        editingCell: string | null;
        pendingEdits: Map<string, CellEdit>;
        setEditingCell: (key: string | null) => void;
        handleCellEdit: (studentKey: string, assessmentId: string, scoreType: ScoreType, value: string) => void;
    };
}

const StudentDataTable: React.FC<StudentDataTableProps> = ({
    students,
    allStudents: _allStudents,
    visibleColumns,
    searchQuery,
    getSortIcon,
    onSort,
    onStudentClick,
    inlineEditing
}) => {
    const { t } = useFallbackTranslation();

    // Format tooltip content for column headers
    const formatTooltipContent = (column: ColumnConfig): string => {
        if (!column.tooltip) return '';
        
        let content = `<strong>${column.tooltip.fullTitle}</strong>`;
        
        if (column.tooltip.date) {
            const formattedDate = new Date(column.tooltip.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            content += `<br><span style="color: #9ca3af;">📅 ${formattedDate}</span>`;
        }
        
        if (column.tooltip.description && column.tooltip.description !== column.tooltip.fullTitle) {
            content += `<br><br>${column.tooltip.description}`;
        }
        
        return content;
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {visibleColumns.map(column => {
                            const tooltipId = `column-tooltip-${column.id}`;
                            const hasTooltip = column.tooltip && column.tooltip.fullTitle;
                            const isNameColumn = column.id === 'name';
                            
                            return (
                                <th
                                    key={column.id}
                                    onClick={() => onSort(column.id)}
                                    data-tooltip-id={hasTooltip ? tooltipId : undefined}
                                    data-tooltip-html={hasTooltip ? formatTooltipContent(column) : undefined}
                                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 ${
                                        isNameColumn ? 'sticky left-0 bg-gray-50 z-20' : ''
                                    }`}
                                    style={isNameColumn ? { boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)' } : undefined}
                                >
                                    {column.label} {getSortIcon(column.id)}
                                    
                                    {hasTooltip && (
                                        <Tooltip
                                            id={tooltipId}
                                            place="top"
                                            className="max-w-sm sm:max-w-md"
                                            style={{
                                                backgroundColor: '#1f2937',
                                                color: 'white',
                                                fontSize: '0.875rem',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                zIndex: 50,
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                                lineHeight: '1.6'
                                            }}
                                            delayShow={200}
                                            delayHide={100}
                                        />
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.length > 0 ? (
                        students.map(student => {
                            const studentKey = `${student.first_name}-${student.last_name}`;
                            
                            return (
                                <tr
                                    key={studentKey}
                                    className="group hover:bg-blue-50 transition-colors"
                                >
                                    {visibleColumns.map(column => {
                                        if (column.id === 'name') {
                                            return (
                                                <td 
                                                    key="name" 
                                                    className="px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline sticky left-0 bg-white group-hover:bg-blue-50 z-10 transition-colors"
                                                    style={{ boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)' }}
                                                    onClick={() => onStudentClick(student)}
                                                >
                                                    {getStudentFullName(student)}
                                                </td>
                                            );
                                        }
                                        
                                        if (column.id === 'assessments') {
                                            return (
                                                <td key="assessments" className="px-4 py-3 text-sm text-gray-600">
                                                    {student.assessments?.length || 0}
                                                </td>
                                            );
                                        }
                                        
                                        // Assessment columns with inline editing (includes English tests)
                                        const { assessmentId, scoreType } = parseAssessmentColumnId(column.id);
                                        
                                        const cellKey = `${studentKey}-${assessmentId}-${scoreType || 'default'}`;
                                        const displayValue = inlineEditing.getCellValue(student, assessmentId, scoreType);
                                        const isEditing = inlineEditing.editingCell === cellKey;
                                        const hasEdit = inlineEditing.pendingEdits.has(cellKey);
                                        
                                        return (
                                            <AssessmentCell
                                                key={column.id}
                                                student={student}
                                                column={column}
                                                displayValue={displayValue}
                                                isEditing={isEditing}
                                                hasEdit={hasEdit}
                                                studentKey={studentKey}
                                                onEdit={(value) => inlineEditing.handleCellEdit(studentKey, assessmentId, scoreType, value)}
                                                onStartEdit={() => inlineEditing.setEditingCell(cellKey)}
                                                onEndEdit={() => inlineEditing.setEditingCell(null)}
                                                onCancel={() => {
                                                    const newEdits = new Map(inlineEditing.pendingEdits);
                                                    newEdits.delete(cellKey);
                                                    inlineEditing.setEditingCell(null);
                                                }}
                                            />
                                        );
                                    })}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={visibleColumns.length} className="px-4 py-8 text-center text-gray-500">
                                {searchQuery ? t('no_students') : t('no_data')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentDataTable;




