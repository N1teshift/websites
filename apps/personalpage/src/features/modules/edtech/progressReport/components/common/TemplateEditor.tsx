import React, { useState, useEffect } from 'react';
import { CommentTemplate, TEMPLATE_VARIABLE_DESCRIPTIONS } from '../../types/CommentTemplateTypes';
import CollapsibleSection from './CollapsibleSection';

interface TemplateEditorProps {
    template: CommentTemplate;
    onUpdate: (updates: Partial<CommentTemplate>) => void;
    onRegenerate: () => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onUpdate, onRegenerate }) => {
    const [editedTemplate, setEditedTemplate] = useState<CommentTemplate>(template);
    const [hasChanges, setHasChanges] = useState(false);

    // Update editedTemplate when template prop changes
    useEffect(() => {
        setEditedTemplate(template);
        setHasChanges(false);
    }, [template]);

    const handleSectionChange = (field: keyof CommentTemplate['sections'], value: string) => {
        setEditedTemplate(prev => ({
            ...prev,
            sections: {
                ...prev.sections,
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleTopicDescriptionChange = (field: keyof CommentTemplate['topicDescriptions'], value: string) => {
        setEditedTemplate(prev => ({
            ...prev,
            topicDescriptions: {
                ...prev.topicDescriptions,
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleGrammarRuleChange = (
        category: 'singular' | 'plural',
        field: 'topic' | 'subtopic',
        value: string
    ) => {
        setEditedTemplate(prev => ({
            ...prev,
            grammarRules: {
                ...prev.grammarRules,
                [category]: {
                    ...prev.grammarRules[category],
                    [field]: value
                }
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(editedTemplate);
        setHasChanges(false);
        onRegenerate();
    };

    const handleDiscard = () => {
        setEditedTemplate(template);
        setHasChanges(false);
    };

    return (
        <CollapsibleSection
            title="Template Constructor"
            icon="🛠️"
            defaultOpen={false}
            id="comment-template-editor"
        >
            <div className="space-y-6">
                {/* Info Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Available Variables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(TEMPLATE_VARIABLE_DESCRIPTIONS).map(([variable, description]) => (
                            <div key={variable} className="flex gap-2">
                                <code className="bg-white px-2 py-0.5 rounded text-blue-700 font-mono text-xs">
                                    {variable}
                                </code>
                                <span className="text-gray-700">{description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Template Sections */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Main Template Sections</h4>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Intro Text
                        </label>
                        <textarea
                            value={editedTemplate.sections.intro}
                            onChange={(e) => handleSectionChange('intro', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Context Text
                            <span className="text-gray-500 text-xs ml-2">(Use {'{Name}'} for student name)</span>
                        </label>
                        <textarea
                            value={editedTemplate.sections.context}
                            onChange={(e) => handleSectionChange('context', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assessment Text
                        </label>
                        <textarea
                            value={editedTemplate.sections.assessment}
                            onChange={(e) => handleSectionChange('assessment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Achievement Text
                            <span className="text-gray-500 text-xs ml-2">(Use {'{Name}'} and {'{MYP_Level}'})</span>
                        </label>
                        <textarea
                            value={editedTemplate.sections.achievement}
                            onChange={(e) => handleSectionChange('achievement', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weak Sections - Intro
                            <span className="text-gray-500 text-xs ml-2">(Use {'{Name}'})</span>
                        </label>
                        <textarea
                            value={editedTemplate.sections.weakIntro}
                            onChange={(e) => handleSectionChange('weakIntro', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weak Sections - Ending
                            <span className="text-gray-500 text-xs ml-2">(Use {'{Subtopic_Word}'} and {'{Name_Kam}'})</span>
                        </label>
                        <textarea
                            value={editedTemplate.sections.weakEnding}
                            onChange={(e) => handleSectionChange('weakEnding', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            rows={2}
                        />
                    </div>
                </div>

                {/* Topic Descriptions */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Topic Descriptions</h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section 1.1
                            </label>
                            <input
                                type="text"
                                value={editedTemplate.topicDescriptions.section_1_1}
                                onChange={(e) => handleTopicDescriptionChange('section_1_1', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section 1.2
                            </label>
                            <input
                                type="text"
                                value={editedTemplate.topicDescriptions.section_1_2}
                                onChange={(e) => handleTopicDescriptionChange('section_1_2', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section 1.3
                            </label>
                            <input
                                type="text"
                                value={editedTemplate.topicDescriptions.section_1_3}
                                onChange={(e) => handleTopicDescriptionChange('section_1_3', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* Grammar Rules */}
                <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 text-lg">Grammar Rules</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h5 className="font-medium text-gray-700">Singular Forms</h5>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Topic Word (singular)
                                </label>
                                <input
                                    type="text"
                                    value={editedTemplate.grammarRules.singular.topic}
                                    onChange={(e) => handleGrammarRuleChange('singular', 'topic', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                                    placeholder="e.g., temą"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Subtopic Word (singular)
                                </label>
                                <input
                                    type="text"
                                    value={editedTemplate.grammarRules.singular.subtopic}
                                    onChange={(e) => handleGrammarRuleChange('singular', 'subtopic', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                                    placeholder="e.g., tos potėmės"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h5 className="font-medium text-gray-700">Plural Forms</h5>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Topic Word (plural)
                                </label>
                                <input
                                    type="text"
                                    value={editedTemplate.grammarRules.plural.topic}
                                    onChange={(e) => handleGrammarRuleChange('plural', 'topic', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                                    placeholder="e.g., temas"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Subtopic Word (plural)
                                </label>
                                <input
                                    type="text"
                                    value={editedTemplate.grammarRules.plural.subtopic}
                                    onChange={(e) => handleGrammarRuleChange('plural', 'subtopic', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-gray-900"
                                    placeholder="e.g., tų potemių"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {hasChanges && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleDiscard}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Save & Regenerate Comments
                        </button>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

export default TemplateEditor;




