import React, { useState, useMemo } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { StudentData } from '../../types/ProgressReportTypes';
import {
    getProfileDisplayValue,
    formatDate,
    formatPercentage,
    getStudentFullName,
    calculateBoardSolvingCumulative
} from '../../utils/progressReportUtils';
import ActivityTimelineChart from '../common/ActivityTimelineChart';
import DateRangeFilter, { DateRange } from '../common/DateRangeFilter';
import MultiSelectFilter from '../common/MultiSelectFilter';
import CollapsibleSection from '../common/CollapsibleSection';
import ClassSelectorWithSearch from '../common/shared/ClassSelectorWithSearch';
import StudentSelectorList from '../common/shared/StudentSelectorList';
import AssessmentTable from '../common/shared/AssessmentTable';
import { useStudentFiltering } from '../../hooks/useStudentFiltering';
import { filterAssessmentsByDateRange, sortAssessments, getAssessmentTypes } from '../../utils/progressReportUtils';

interface StudentViewSectionProps {
    students: StudentData[];
    selectedStudent: StudentData | null;
    onSelectStudent: (student: StudentData) => void;
    onDataChange?: (updatedStudents: StudentData[]) => void;
    isEnglishTeacher?: boolean;
}

const StudentViewSection: React.FC<StudentViewSectionProps> = ({
    students,
    selectedStudent,
    onSelectStudent,
    onDataChange,
    isEnglishTeacher = false
}) => {
    const { t } = useFallbackTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc'>('date_desc');
    const [hideEmptyRows, setHideEmptyRows] = useState(true);
    
    // Name variations editing state
    const [nameCases, setNameCases] = useState<{
        kas: string;
        ko: string;
        ka: string;
        kuo: string;
        kam: string;
        kur: string;
    }>({
        kas: '',
        ko: '',
        ka: '',
        kuo: '',
        kam: '',
        kur: ''
    });
    const [hasNameCasesChanges, setHasNameCasesChanges] = useState(false);
    
    // Update name cases when selected student changes
    React.useEffect(() => {
        if (selectedStudent) {
            const existingCases = selectedStudent.profile?.name_cases || {};
            setNameCases({
                kas: existingCases.kas || '',
                ko: existingCases.ko || '',
                ka: existingCases.ka || '',
                kuo: existingCases.kuo || '',
                kam: existingCases.kam || '',
                kur: existingCases.kur || ''
            });
            setHasNameCasesChanges(false);
        }
    }, [selectedStudent]);
    
    const handleNameCaseChange = (caseType: keyof typeof nameCases, value: string) => {
        setNameCases(prev => ({ ...prev, [caseType]: value }));
        setHasNameCasesChanges(true);
    };
    
    const handleSaveNameCases = () => {
        if (!selectedStudent || !onDataChange) return;
        
        const updatedStudents = students.map(student => {
            if (student.id === selectedStudent.id) {
                return {
                    ...student,
                    profile: {
                        ...student.profile,
                        name_cases: nameCases
                    }
                };
            }
            return student;
        });
        
        onDataChange(updatedStudents);
        setHasNameCasesChanges(false);
    };

    const uniqueClasses = useMemo(() => {
        const classes = new Set(students.map(s => s.class_name));
        return Array.from(classes).sort();
    }, [students]);

    const filteredStudents = useStudentFiltering({
        students,
        filters: {
            searchQuery,
            selectedClass,
            showAllClasses: selectedClass === 'all'
        }
    });

    const sortedFilteredStudents = useMemo(() => {
        return filteredStudents.sort((a, b) => 
            getStudentFullName(a).localeCompare(getStudentFullName(b))
        );
    }, [filteredStudents]);

    const assessmentTypes = useMemo(() => {
        if (!selectedStudent) return [];
        return getAssessmentTypes(selectedStudent.assessments || []);
    }, [selectedStudent]);

    const filteredAssessments = useMemo(() => {
        if (!selectedStudent) return [];
        
        let filtered = selectedStudent.assessments || [];
        
        // Filter out old experimental EXT classwork (but keep Exercise Progress Tracking)
        filtered = filtered.filter(assessment => {
            if (assessment.column?.startsWith('EXT') && 
                assessment.type === 'classwork') {
                // Keep Exercise Progress Tracking assessments (new EPT data)
                if (assessment.assessment_id?.startsWith('exercise-progress-ext')) {
                    return true;
                }
                // Filter out old experimental data and other EXT assessments
                if (assessment.date.startsWith('2025-09') || 
                    assessment.date.startsWith('2025-10') ||
                    assessment.task_name?.toLowerCase().includes('experimental')) {
                    return false;
                }
            }
            return true;
        });
        
        // Filter out cumulative records
        filtered = filtered.filter(assessment => {
            if (assessment.task_name?.toLowerCase().includes('cumulative')) {
                return false;
            }
            return true;
        });
        
        // Filter out weekly_assessment type records (legacy data)
        filtered = filtered.filter(assessment => {
            return (assessment.type as string) !== 'weekly_assessment';
        });
        
        // Apply type filter
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(a => selectedTypes.includes(a.type));
        }
        
        // Filter out LNT0 for board_solving
        if (selectedTypes.length === 1 && selectedTypes[0] === 'board_solving') {
            filtered = filtered.filter(assessment => assessment.column !== 'LNT0');
        }
        
        // Apply date range filter
        filtered = filterAssessmentsByDateRange(filtered, dateRange.startDate, dateRange.endDate);
        
        // Filter out empty rows if hideEmptyRows is enabled
        if (hideEmptyRows) {
            filtered = filtered.filter(assessment => {
                // Consider a row empty only if score is missing, "-", or empty string
                // Keep "0" as it represents "not completed" which is valid data
                const score = assessment.score?.trim();
                return score && score !== '-' && score !== '';
            });
        }
        
        // Apply sorting
        return sortAssessments(filtered, sortBy);
    }, [selectedStudent, selectedTypes, dateRange, sortBy, hideEmptyRows]);

    if (students.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">{t('no_data_loaded')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Student Selector */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{t('select_student')}</h3>
                
                <ClassSelectorWithSearch
                    classes={uniqueClasses}
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                <StudentSelectorList
                    students={sortedFilteredStudents}
                    selectedStudent={selectedStudent}
                    onSelectStudent={onSelectStudent}
                />
            </div>

            {selectedStudent && (
                <>
                    {/* Student Profile */}
                    <CollapsibleSection title={t('student_profile')} icon="👤" defaultOpen={true} id="student-view-profile">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('first_name')}:</dt>
                                <dd className="text-gray-900 font-medium">{selectedStudent.first_name}</dd>
                            </div>
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('last_name')}:</dt>
                                <dd className="text-gray-900 font-medium">{selectedStudent.last_name}</dd>
                            </div>
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('class_name')}:</dt>
                                <dd className="text-gray-900 font-medium">{selectedStudent.class_name}</dd>
                            </div>
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('writing_quality')}:</dt>
                                <dd className="text-gray-900">
                                    {(() => {
                                        const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                        const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                        return getProfileDisplayValue('writing_quality', 
                                            String(attrs?.writing_quality || profile?.writing_quality || ''));
                                    })()}
                                </dd>
                            </div>
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('notebook_quality')}:</dt>
                                <dd className="text-gray-900">
                                    {(() => {
                                        const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                        const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                        return getProfileDisplayValue('notebook_quality', 
                                            String(attrs?.notebook_organization || profile?.notebook_quality || ''));
                                    })()}
                                </dd>
                            </div>
                            <div className="flex items-center">
                                <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('reflective_practice')}:</dt>
                                <dd className="text-gray-900">
                                    {(() => {
                                        const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                        const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                        return getProfileDisplayValue('is_reflective', 
                                            String(attrs?.reflective_practice || profile?.is_reflective || ''));
                                    })()}
                                </dd>
                            </div>
                            {!isEnglishTeacher && (
                                <>
                                    <div className="flex items-center">
                                        <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('math_communication')}:</dt>
                                        <dd className="text-gray-900">
                                            {(() => {
                                                const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                                const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                                return getProfileDisplayValue('math_communication', 
                                                    String(attrs?.math_communication || profile?.math_communication || ''));
                                            })()}
                                        </dd>
                                    </div>
                                    <div className="flex items-center">
                                        <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('mandatory_consultation')}:</dt>
                                        <dd className="text-gray-900">
                                            {(() => {
                                                const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                                const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                                const value = attrs?.mandatory_consultation;
                                                return value ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                                        {t('yes')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">{t('no')}</span>
                                                );
                                            })()}
                                        </dd>
                                    </div>
                                    <div className="flex items-center">
                                        <dt className="font-medium text-gray-600 min-w-[120px] text-xs">{t('special_math_club')}:</dt>
                                        <dd className="text-gray-900">
                                            {(() => {
                                                const profile = selectedStudent.profile as unknown as Record<string, unknown> | undefined;
                                                const attrs = profile?.learning_attributes as Record<string, unknown> | undefined;
                                                const value = attrs?.special_math_club;
                                                return value ? (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                        {t('yes')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">{t('no')}</span>
                                                );
                                            })()}
                                        </dd>
                                    </div>
                                </>
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* Name Variations Section */}
                    <CollapsibleSection title="Name Variations (Lithuanian Cases)" icon="✏️" defaultOpen={false} id="student-view-name-cases">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Enter Lithuanian grammatical variations of the student&apos;s name for comment generation.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kas? (Nominative)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.kas}
                                        onChange={(e) => handleNameCaseChange('kas', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smiltė"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ko? (Genitive)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.ko}
                                        onChange={(e) => handleNameCaseChange('ko', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smiltės"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ką? (Accusative)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.ka}
                                        onChange={(e) => handleNameCaseChange('ka', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smiltę"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kuo? (Instrumental)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.kuo}
                                        onChange={(e) => handleNameCaseChange('kuo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smilte"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kam? (Dative)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.kam}
                                        onChange={(e) => handleNameCaseChange('kam', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smiltei"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kur? (Locative)
                                    </label>
                                    <input
                                        type="text"
                                        value={nameCases.kur}
                                        onChange={(e) => handleNameCaseChange('kur', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        placeholder="e.g., Smiltėje"
                                    />
                                </div>
                            </div>
                            {hasNameCasesChanges && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveNameCases}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Save Name Variations
                                    </button>
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* Results Section - Only for Math Teacher */}
                    {!isEnglishTeacher && (
                        <CollapsibleSection title={t('results')} icon="🎯" defaultOpen={true} id="student-view-results">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-3">{t('board_solving_performance')}</h4>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                            <dt className="font-medium text-gray-600">{t('cumulative_score')}:</dt>
                                            <dd className="text-2xl font-bold text-blue-600">
                                                {calculateBoardSolvingCumulative(selectedStudent)}
                                            </dd>
                                        </div>
                                        <div className="text-xs text-gray-500 italic mt-2">
                                            {t('calculated_from_lnt')}
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Filters */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <DateRangeFilter onRangeChange={setDateRange} currentRange={dateRange} />
                        {assessmentTypes.length > 0 && (
                            <MultiSelectFilter
                                options={assessmentTypes}
                                selected={selectedTypes}
                                onChange={setSelectedTypes}
                                label={t('filter_by_type')}
                            />
                        )}
                    </div>

                    {/* Activity Timeline Chart */}
                    <CollapsibleSection 
                        title={selectedTypes.length === 0 || selectedTypes.length > 1 
                            ? "Activity Timeline" 
                            : `${selectedTypes[0]} Timeline`
                        } 
                        icon="📈" 
                        defaultOpen={true}
                        id="student-view-timeline"
                    >
                        <ActivityTimelineChart 
                            student={selectedStudent} 
                            selectedTypes={selectedTypes}
                            dateRange={dateRange}
                        />
                    </CollapsibleSection>

                    {/* Assessments Table */}
                    <CollapsibleSection 
                        title={t('assessment_record')} 
                        icon="📝" 
                        defaultOpen={true}
                        id="student-view-assessment-record"
                        badge={filteredAssessments.length}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hideEmptyRows}
                                    onChange={(e) => setHideEmptyRows(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="ml-2 text-sm text-gray-700">{t('hide_empty_assessments')}</span>
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc')}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                            >
                                <option value="date_desc">{t('sort_by_date_desc')}</option>
                                <option value="date_asc">{t('sort_by_date_asc')}</option>
                                <option value="score_desc">{t('sort_by_score_desc')}</option>
                                <option value="score_asc">{t('sort_by_score_asc')}</option>
                            </select>
                        </div>

                        <AssessmentTable 
                            assessments={filteredAssessments}
                            emptyMessage={t('no_assessments')}
                        />
                    </CollapsibleSection>

                    {/* Material Completion */}
                    {(() => {
                        const student = selectedStudent as unknown as Record<string, unknown>;
                        const materialCompletion = student.curriculum_progress as Record<string, unknown> | undefined;
                        const completionData = materialCompletion?.material_completion as Record<string, { percentage: number; last_updated: string }> | undefined;
                        const legacyData = student.material_completion as Record<string, { percentage: number; last_updated: string }> | undefined;
                        const data = completionData || legacyData;
                        
                        return data && Object.keys(data).length > 0 && (
                            <CollapsibleSection 
                                title={t('material_completion')} 
                                icon="📚" 
                                defaultOpen={false}
                                badge={Object.keys(data).length}
                                id="student-view-material-completion"
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('unit')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('completion')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('last_updated')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(data).map(([unit, record]) => (
                                                <tr key={unit}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{unit}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatPercentage(record.percentage)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(record.last_updated)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CollapsibleSection>
                        );
                    })()}

                    {/* Cambridge Tests */}
                    {selectedStudent.cambridge_tests && selectedStudent.cambridge_tests.length > 0 && (
                        <CollapsibleSection 
                            title={t('cambridge_tests_history')} 
                            icon="🎓" 
                            defaultOpen={false}
                            badge={selectedStudent.cambridge_tests.length}
                            id="student-view-cambridge-tests"
                        >
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('year')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('stage')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('paper')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('marks')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('percentage')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {selectedStudent.cambridge_tests.map((test, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{test.year}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{test.stage}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{test.paper_title}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{test.marks}/{test.total_marks}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPercentage(test.percentage)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Attendance Records */}
                    {(() => {
                        const student = selectedStudent as unknown as Record<string, unknown>;
                        const engagement = student.engagement as Record<string, unknown> | undefined;
                        const attendanceRecords = (engagement?.attendance_records || student.attendance_records || []) as Array<{
                            month: string;
                            absent_lessons: number;
                            authorized_absences: number;
                        }>;
                        
                        return attendanceRecords.length > 0 && (
                            <CollapsibleSection 
                                title={t('attendance_records')} 
                                icon="📅" 
                                defaultOpen={false}
                                badge={attendanceRecords.length}
                                id="student-view-attendance"
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('month')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('absent_lessons')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('authorized_absences')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attendanceRecords.map((record, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{record.month}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{record.absent_lessons}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{record.authorized_absences}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CollapsibleSection>
                        );
                    })()}

                    {/* Mandatory Consultation Attendance */}
                    {(() => {
                        const student = selectedStudent as unknown as Record<string, unknown>;
                        const consultationAttendance = (student.mandatory_consultation_attendance || []) as Array<{
                            date: string;
                            status: 'present' | 'absent';
                            added: string;
                        }>;
                        
                        return consultationAttendance.length > 0 && (
                            <CollapsibleSection 
                                title={t('mandatory_consultation_attendance')} 
                                icon="📋" 
                                defaultOpen={true}
                                badge={consultationAttendance.length}
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attended')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {consultationAttendance.map((record, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {record.status === 'present' ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                ✓ {t('present')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                ✗ {t('absent')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CollapsibleSection>
                        );
                    })()}

                    {/* Math Club Attendance */}
                    {(() => {
                        const student = selectedStudent as unknown as Record<string, unknown>;
                        const mathClubAttendance = (student.math_club_attendance || []) as Array<{
                            date: string;
                            status: 'present' | 'absent';
                            added: string;
                        }>;
                        
                        return mathClubAttendance.length > 0 && (
                            <CollapsibleSection 
                                title={t('math_club_attendance')} 
                                icon="🎓" 
                                defaultOpen={true}
                                badge={mathClubAttendance.length}
                            >
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('date')}</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attended')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mathClubAttendance.map((record, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {record.status === 'present' ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                ✓ {t('present')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                ✗ {t('absent')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CollapsibleSection>
                        );
                    })()}
                </>
            )}

            {!selectedStudent && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">↑ {t('select_student')}</p>
                </div>
            )}
        </div>
    );
};

export default StudentViewSection;




