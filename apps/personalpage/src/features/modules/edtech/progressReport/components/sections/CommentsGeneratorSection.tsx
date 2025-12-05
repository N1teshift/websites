import React, { useState, useMemo, useEffect } from 'react';
import { StudentData } from '../../types/ProgressReportTypes';
import { CommentTemplate } from '../../types/CommentTemplateTypes';
import { useCommentTemplates } from '../../hooks/useCommentTemplates';
import { useStudentCommentData, useGeneratedComments } from '../../hooks/useStudentCommentData';
import CollapsibleSection from '../common/CollapsibleSection';
import ClassSelectorWithSearch from '../common/shared/ClassSelectorWithSearch';
import TemplateEditor from '../common/TemplateEditor';
import { CommentTemplateSelector } from '../comments/CommentTemplateSelector';
import { MissingDataWarning } from '../comments/MissingDataWarning';
import { GeneratedCommentsList } from '../comments/GeneratedCommentsList';

interface CommentsGeneratorSectionProps {
    students: StudentData[];
    teacherType?: string;
}

const CommentsGeneratorSection: React.FC<CommentsGeneratorSectionProps> = ({ students, teacherType = 'main' }) => {
    const [regenerateKey, setRegenerateKey] = useState(0);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const {
        templates: allTemplates,
        activeTemplate,
        activeTemplateId,
        setActiveTemplateId,
        updateTemplate
    } = useCommentTemplates();

    // Filter templates based on teacher type
    const templates = useMemo(() => {
        const isEnglishTeacher = teacherType === 'J' || teacherType === 'A';
        
        if (isEnglishTeacher) {
            // English teachers: only show English templates
            return allTemplates.filter(t => 
                t.id === 'english-diagnostic-1' || t.id === 'english-unit-1'
            );
        } else {
            // Main teachers: only show Math templates
            return allTemplates.filter(t => 
                t.id === 'default-unit1'
            );
        }
    }, [allTemplates, teacherType]);

    // Auto-switch to first available template if current one is not in filtered list
    useEffect(() => {
        if (templates.length > 0 && !templates.find(t => t.id === activeTemplateId)) {
            setActiveTemplateId(templates[0].id);
        }
    }, [templates, activeTemplateId, setActiveTemplateId]);

    // Get unique classes
    const classes = useMemo(() => {
        const classSet = new Set(students.map(s => s.class_name));
        return Array.from(classSet).sort();
    }, [students]);

    // Filter students by class and search
    const filteredStudents = useMemo(() => {
        let filtered = students;

        if (selectedClass && selectedClass !== 'all') {
            filtered = filtered.filter(student => student.class_name === selectedClass);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(student => 
                student.first_name.toLowerCase().includes(query) ||
                student.last_name.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [students, selectedClass, searchQuery]);

    // Extract comment data
    const { studentCommentData, studentsWithMissingData } = useStudentCommentData(
        filteredStudents,
        activeTemplateId
    );

    // Generate comments
    const generatedComments = useGeneratedComments(
        studentCommentData,
        activeTemplate,
        regenerateKey
    );

    const handleTemplateUpdate = (updates: Partial<CommentTemplate>) => {
        updateTemplate(activeTemplateId, updates);
    };

    const handleCopyComment = (comment: string) => {
        navigator.clipboard.writeText(comment);
    };

    const handleRegenerateComments = () => {
        setRegenerateKey(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Comments Generator</h2>
                <p className="text-purple-100">
                    Generate personalized student comments based on assessment data
                </p>
            </div>

            {/* Class Selector */}
            <ClassSelectorWithSearch
                classes={classes}
                selectedClass={selectedClass}
                onClassChange={setSelectedClass}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Template Selector */}
            <CommentTemplateSelector
                templates={templates}
                activeTemplateId={activeTemplateId}
                onTemplateChange={setActiveTemplateId}
            />

            {/* Template Editor */}
            <CollapsibleSection title="Customize Template" defaultOpen={false}>
                <TemplateEditor
                    template={activeTemplate}
                    onUpdate={handleTemplateUpdate}
                    onRegenerate={handleRegenerateComments}
                />
            </CollapsibleSection>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleRegenerateComments}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Regenerate Comments
                </button>
            </div>

            {/* Missing Data Warning */}
            <MissingDataWarning studentsWithMissingData={studentsWithMissingData} />

            {/* Statistics */}
            {generatedComments.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                            Generated {generatedComments.length} comment{generatedComments.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* Generated Comments */}
            {generatedComments.length > 0 ? (
                <GeneratedCommentsList
                    comments={generatedComments}
                    activeTemplateId={activeTemplateId}
                    onCopyComment={handleCopyComment}
                />
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-gray-400 text-lg mb-2">📝</div>
                    <p className="text-gray-600">
                        {studentsWithMissingData.length > 0
                            ? 'No students with complete data to generate comments'
                            : 'No students match the current filters'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default CommentsGeneratorSection;



