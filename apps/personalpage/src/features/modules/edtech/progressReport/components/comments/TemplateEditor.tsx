import React, { useState, useEffect } from 'react';
import { CommentTemplate, TEMPLATE_VARIABLE_DESCRIPTIONS } from '../../types/CommentTemplateTypes';

interface TemplateEditorProps {
    activeTemplate: CommentTemplate;
    onSaveTemplate: (template: CommentTemplate) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
    activeTemplate,
    onSaveTemplate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTemplate, setEditedTemplate] = useState<CommentTemplate>(activeTemplate);
    const [showVariables, setShowVariables] = useState(false);

    useEffect(() => {
        setEditedTemplate(activeTemplate);
        setIsEditing(false);
    }, [activeTemplate]);

    const handleSave = () => {
        onSaveTemplate(editedTemplate);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedTemplate(activeTemplate);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">
                        Template: {activeTemplate.name}
                    </h3>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Edit Template
                    </button>
                </div>
                <p className="text-xs text-gray-500">
                    Click &quot;Edit Template&quot; to customize the comment structure.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Editing: {activeTemplate.name}
                </h3>
                <button
                    onClick={() => setShowVariables(!showVariables)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {showVariables ? 'Hide' : 'Show'} Available Variables
                </button>
            </div>

            {showVariables && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2 text-sm">Available Variables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-800">
                        {Object.entries(TEMPLATE_VARIABLE_DESCRIPTIONS).map(([key, description]) => (
                            <div key={key} className="flex gap-2">
                                <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">{key}</code>
                                <span>{description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {Object.entries(editedTemplate.sections).map(([key, value]) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => setEditedTemplate({
                                ...editedTemplate,
                                sections: { ...editedTemplate.sections, [key]: e.target.value }
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Save Changes
                </button>
                <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};




