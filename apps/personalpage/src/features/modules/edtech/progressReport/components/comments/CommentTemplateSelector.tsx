import React from 'react';
import { CommentTemplate } from '../../types/CommentTemplateTypes';

interface CommentTemplateSelectorProps {
    templates: CommentTemplate[];
    activeTemplateId: string;
    onTemplateChange: (templateId: string) => void;
}

export const CommentTemplateSelector: React.FC<CommentTemplateSelectorProps> = ({
    templates,
    activeTemplateId,
    onTemplateChange
}) => {
    return (
        <div className="mb-6">
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
                Comment Template
            </label>
            <select
                id="template-select"
                value={activeTemplateId}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="w-full md:w-auto px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
                {templates.map((template) => (
                    <option key={template.id} value={template.id} className="bg-white text-gray-900">
                        {template.name}
                    </option>
                ))}
            </select>
        </div>
    );
};




