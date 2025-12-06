import React, { useState } from 'react';
import { UnitPlanData, SubunitData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import { FiTrash2 } from 'react-icons/fi';
import { IconButton, Dropdown } from '@websites/ui';

interface ResourcesSectionProps {
    unitPlan: UnitPlanData;
    updateUnitPlan: (field: keyof UnitPlanData, value: string | string[] | number | SubunitData[]) => void;
}

// Predefined printed resources
const PREDEFINED_PRINTED_RESOURCES = [
    "Byrd, L., Byrd, G., & Pearce, C. (2021). Cambridge Lower Secondary Mathematics Learner's Book 9. Cambridge University Press.",
    "Byrd, L., Byrd, G., & Pearce, C. (2021). Cambridge Lower Secondary Mathematics Teacher's Resource 9. Cambridge University Press.",
    "Byrd, L., Byrd, G., & Pearce, C. (2021). Cambridge Lower Secondary Mathematics Workbook 9. Cambridge University Press.",
    "Tulabienė, I., Kavaliauskienė, S., Berniukevičius, A., Ališauskas, A., & Janušaitienė, O. (2025). Horizontai. Matematika 8 klasė. 1 dalis. Šviesa."
];

const ResourcesSection: React.FC<ResourcesSectionProps> = ({
    unitPlan,
    updateUnitPlan
}) => {
    const { t } = useFallbackTranslation();
    const [selectedPredefinedResource, setSelectedPredefinedResource] = useState<string>('');

    const addResourceItem = (field: 'printedResources' | 'digitalResources' | 'guestsResources') => {
        const currentList = Array.isArray(unitPlan[field]) ? unitPlan[field] as string[] : [];
        updateUnitPlan(field, [...currentList, '']);
    };

    const updateResourceItem = (field: 'printedResources' | 'digitalResources' | 'guestsResources', index: number, value: string) => {
        const currentList = Array.isArray(unitPlan[field]) ? unitPlan[field] as string[] : [];
        const updatedList = currentList.map((item, i) => i === index ? value : item);
        updateUnitPlan(field, updatedList);
    };

    const removeResourceItem = (field: 'printedResources' | 'digitalResources' | 'guestsResources', index: number) => {
        const currentList = Array.isArray(unitPlan[field]) ? unitPlan[field] as string[] : [];
        const updatedList = currentList.filter((_, i) => i !== index);
        updateUnitPlan(field, updatedList);
    };

    const addPredefinedResource = () => {
        if (selectedPredefinedResource) {
            const currentList = Array.isArray(unitPlan.printedResources) ? unitPlan.printedResources : [];
            // Check if resource is already in the list
            if (!currentList.includes(selectedPredefinedResource)) {
                updateUnitPlan('printedResources', [...currentList, selectedPredefinedResource]);
            }
            setSelectedPredefinedResource('');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <div className="flex items-center gap-3 pb-4 border-b-2 border-border-default mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 flex items-center justify-center shadow-medium">
                        <span className="text-white text-xl font-bold">📦</span>
                    </div>
                    <h2 className="text-3xl font-bold text-text-primary">{t('resources')}</h2>
                </div>
                <p className="text-text-secondary text-base bg-surface-button border-l-4 border-brand p-4 rounded-r-xl">
                    {t('resources_description')}
                </p>
            </div>

            <div className="space-y-8">
                {/* Printed Resources */}
                <div className="space-y-4 bg-surface-card rounded-2xl border-2 border-border-default p-6 shadow-soft hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600">📚</span>
                            {t('printed_resources')}
                        </h3>
                        <button
                            type="button"
                            onClick={() => addResourceItem('printedResources')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            {t('add_item')}
                        </button>
                    </div>

                    {/* Predefined Resources Selector */}
                    <div className="bg-surface-card border-2 border-border-default rounded-xl p-5 shadow-soft">
                        <label className="block text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-primary-600">⚡</span>
                            Quick Add from Predefined Resources
                        </label>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Dropdown
                                    label=""
                                    value={selectedPredefinedResource}
                                    onChange={(value) => setSelectedPredefinedResource(value)}
                                    options={[
                                        { label: '-- Select a resource --', value: '' },
                                        ...PREDEFINED_PRINTED_RESOURCES.map((resource, index) => ({
                                            label: resource.length > 80 ? resource.substring(0, 80) + '...' : resource,
                                            value: resource
                                        }))
                                    ]}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addPredefinedResource}
                                disabled={!selectedPredefinedResource}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                            >
                                {t('add')}
                            </button>
                        </div>
                        <p className="text-xs text-text-secondary mt-3 flex items-center gap-1.5">
                            <span>💡</span>
                            Select a predefined resource to quickly add it to your list
                        </p>
                    </div>

                    <div className="space-y-2">
                        {(Array.isArray(unitPlan.printedResources) ? unitPlan.printedResources : []).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateResourceItem('printedResources', index, e.target.value)}
                                    placeholder="Enter printed resource"
                                    className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent"
                                />
                                <IconButton
                                    icon={<FiTrash2 size={16} />}
                                    onClick={() => removeResourceItem('printedResources', index)}
                                    color="red"
                                    size="medium"
                                    title={t('remove')}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Digital Resources */}
                <div className="space-y-4 bg-surface-card rounded-2xl border-2 border-border-default p-6 shadow-soft hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center text-secondary-600">💻</span>
                            {t('digital_resources')}
                        </h3>
                        <button
                            type="button"
                            onClick={() => addResourceItem('digitalResources')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            {t('add_item')}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {(Array.isArray(unitPlan.digitalResources) ? unitPlan.digitalResources : []).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateResourceItem('digitalResources', index, e.target.value)}
                                    placeholder="Enter digital resource"
                                    className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent"
                                />
                                <IconButton
                                    icon={<FiTrash2 size={16} />}
                                    onClick={() => removeResourceItem('digitalResources', index)}
                                    color="red"
                                    size="medium"
                                    title={t('remove')}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Guests */}
                <div className="space-y-4 bg-surface-card rounded-2xl border-2 border-border-default p-6 shadow-soft hover:shadow-medium transition-shadow">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-success-100 to-success-200 flex items-center justify-center text-success-600">👥</span>
                            {t('guests')}
                        </h3>
                        <button
                            type="button"
                            onClick={() => addResourceItem('guestsResources')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                            {t('add_item')}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {(Array.isArray(unitPlan.guestsResources) ? unitPlan.guestsResources : []).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => updateResourceItem('guestsResources', index, e.target.value)}
                                    placeholder="Enter guest resource"
                                    className="flex-1 px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent"
                                />
                                <IconButton
                                    icon={<FiTrash2 size={16} />}
                                    onClick={() => removeResourceItem('guestsResources', index)}
                                    color="red"
                                    size="medium"
                                    title={t('remove')}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourcesSection;



