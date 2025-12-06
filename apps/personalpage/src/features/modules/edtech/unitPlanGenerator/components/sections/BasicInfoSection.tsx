import React from 'react';
import { UnitPlanData, Subject, SubunitData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import FormField from '../shared/FormField';
import LabelWithInfo from '../shared/LabelWithInfo';
import { getTranslatedSubjectName } from '../../utils/subjectTranslationUtils';
import { Dropdown } from '@websites/ui';
// InfoTooltip removed from this section per request

interface BasicInfoSectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[]) => void;
    subjects: Subject[];
    addTeacher: (teacherName: string) => void;
    removeTeacher: (teacherIndex: number) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    unitPlan,
    updateUnitPlan,
    subjects,
    addTeacher,
    removeTeacher
}) => {
    const { t } = useFallbackTranslation();
    const [newTeacherName, setNewTeacherName] = React.useState('');
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-medium">
                    <span className="text-white text-xl font-bold">ℹ️</span>
                </div>
                <h2 className="text-3xl font-bold text-text-primary">
                    {t('basic_information')}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                    label={t('school_name')}
                    value={unitPlan.schoolName}
                    onChange={(value) => updateUnitPlan('schoolName', value)}
                    placeholder={t('enter_school_name')}
                    required
                    info={t('school_name_info')}
                />

                <FormField
                    label={t('unit_title')}
                    value={unitPlan.unitTitle}
                    onChange={(value) => updateUnitPlan('unitTitle', value)}
                    placeholder={t('enter_unit_title')}
                    required
                    info={t('unit_title_info')}
                />

                <div>
                    <LabelWithInfo
                        label={t('academic_year')}
                        info={t('academic_year_info')}
                        required
                    />
                    <div className="mt-2">
                        <Dropdown
                            label=""
                            value={unitPlan.academicYear || ''}
                            onChange={(value) => updateUnitPlan('academicYear', value)}
                            options={[
                                { label: 'select_academic_year', value: '' },
                                { label: '2025-2026', value: '2025-2026' },
                                { label: '2026-2027', value: '2026-2027' },
                                { label: '2027-2028', value: '2027-2028' },
                                { label: '2028-2029', value: '2028-2029' },
                                { label: '2029-2030', value: '2029-2030' },
                            ]}
                        />
                    </div>
                </div>

                <div>
                    <LabelWithInfo
                        label={t('subject')}
                        info={t('subject_info')}
                        required
                    />
                    <div className="mt-2">
                        <Dropdown
                            label=""
                            value={unitPlan.subject || ''}
                            onChange={(newSubject) => {
                                updateUnitPlan('subject', newSubject);

                                // Clear command terms and ATL skills if switching away from mathematics
                                if (newSubject !== 'mathematics') {
                                    if (unitPlan.commandTerms.length > 0) {
                                        updateUnitPlan('commandTerms', []);
                                    }
                                    if (unitPlan.atlSkills.length > 0) {
                                        updateUnitPlan('atlSkills', []);
                                    }
                                }
                            }}
                            options={[
                                { label: 'select_subject', value: '' },
                                ...subjects.map((subject) => ({
                                    label: `subject_${subject.id}`,
                                    value: subject.id
                                }))
                            ]}
                        />
                    </div>
                </div>

                <div>
                    <LabelWithInfo
                        label="Unit Order"
                        info="Optional number to define the sequence of this unit in your year plan (e.g., 1 for first unit, 2 for second). Leave empty if order doesn't matter."
                    />
                    <input
                        type="number"
                        min="1"
                        value={unitPlan.unitOrder ?? ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            updateUnitPlan('unitOrder', value ? parseInt(value, 10) : 0);
                        }}
                        placeholder="e.g., 1, 2, 3..."
                        className="w-full px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent"
                    />
                </div>

                <div className="lg:col-span-2">
                    <LabelWithInfo
                        label={t('contributing_teachers')}
                        info={t('contributing_teachers_info')}
                    />
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTeacherName}
                                onChange={(e) => setNewTeacherName(e.target.value)}
                                placeholder={t('enter_teacher_name')}
                                className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newTeacherName.trim()) {
                                            addTeacher(newTeacherName);
                                            setNewTeacherName('');
                                        }
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (newTeacherName.trim()) {
                                        addTeacher(newTeacherName);
                                        setNewTeacherName('');
                                    }
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                            >
                                {t('add')}
                            </button>
                        </div>
                        {unitPlan.contributingTeachers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {unitPlan.contributingTeachers.map((teacher, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {teacher}
                                        <button
                                            type="button"
                                            onClick={() => removeTeacher(index)}
                                            className="text-blue-600 hover:text-blue-800 ml-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <LabelWithInfo
                        label={t('number_of_lessons')}
                        info={t('number_of_lessons_info')}
                    />
                    <div className="w-full px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary">
                        {unitPlan.lessonCount}
                    </div>
                </div>

                <div>
                    <LabelWithInfo
                        label={t('myp_year')}
                        info={t('myp_year_info')}
                        required
                    />
                    <div className="mt-2">
                        <Dropdown
                            label=""
                            value={unitPlan.mypYear ? unitPlan.mypYear.toString() : ''}
                            onChange={(value) => updateUnitPlan('mypYear', value ? parseInt(value) : 0)}
                            options={[
                                { label: 'select_myp_year', value: '' },
                                { label: 'myp_year_1', value: '1' },
                                { label: 'myp_year_2', value: '2' },
                                { label: 'myp_year_3', value: '3' },
                                { label: 'myp_year_4', value: '4' },
                                { label: 'myp_year_5', value: '5' },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoSection;



