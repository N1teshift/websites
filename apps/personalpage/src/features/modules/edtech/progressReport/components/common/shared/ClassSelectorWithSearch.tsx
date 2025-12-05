import React from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';

interface ClassSelectorWithSearchProps {
    classes: string[];
    selectedClass: string;
    onClassChange: (className: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    showAllOption?: boolean;
    layout?: 'grid' | 'flex';
}

const ClassSelectorWithSearch: React.FC<ClassSelectorWithSearchProps> = ({
    classes,
    selectedClass,
    onClassChange,
    searchQuery,
    onSearchChange,
    showAllOption = true,
    layout = 'grid'
}) => {
    const { t } = useFallbackTranslation();

    const containerClass = layout === 'grid'
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
        : 'flex flex-col sm:flex-row gap-4';

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className={containerClass}>
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('select_class')}
                    </label>
                    <select
                        value={selectedClass}
                        onChange={(e) => onClassChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                    >
                        {showAllOption && <option value="all">{t('all_classes')}</option>}
                        {classes.map(className => (
                            <option key={className} value={className}>{className}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search_student')}
                    </label>
                    <input
                        type="text"
                        placeholder={t('search_student')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                </div>
            </div>
        </div>
    );
};

export default ClassSelectorWithSearch;




