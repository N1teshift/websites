import React from 'react';
import { UnitPlanData } from '../../../types/UnitPlanTypes';
import { previewStyles } from './previewTheme';

interface PreviewResourcesSectionProps {
    unitPlan: UnitPlanData;
}

const PreviewResourcesSection: React.FC<PreviewResourcesSectionProps> = ({ unitPlan }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b-2" style={previewStyles.sectionTitle}>
                Resources
            </h2>
            
            <div className="space-y-6">
                {/* Printed Resources */}
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Printed Resources</h3>
                    {unitPlan.printedResources && unitPlan.printedResources.length > 0 ? (
                        <ul className="list-disc list-inside text-text-secondary space-y-1">
                            {unitPlan.printedResources.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-gray-500 italic">No printed resources specified</span>
                    )}
                </div>

                {/* Digital Resources */}
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Digital Resources</h3>
                    {unitPlan.digitalResources && unitPlan.digitalResources.length > 0 ? (
                        <ul className="list-disc list-inside text-text-secondary space-y-1">
                            {unitPlan.digitalResources.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-gray-500 italic">No digital resources specified</span>
                    )}
                </div>

                {/* Guests */}
                <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                    <h3 className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Guests</h3>
                    {unitPlan.guestsResources && unitPlan.guestsResources.length > 0 ? (
                        <ul className="list-disc list-inside text-text-secondary space-y-1">
                            {unitPlan.guestsResources.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-gray-500 italic">No guests specified</span>
                    )}
                </div>

                {/* Additional Resources (if any) */}
                {unitPlan.resources && (
                    <div className="p-4 rounded-lg border-l-4" style={previewStyles.contentBlock}>
                        <h3 className="font-semibold text-sm uppercase tracking-wide mb-2" style={previewStyles.fieldLabel}>Additional Resources</h3>
                        <div className="text-text-secondary">{unitPlan.resources}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewResourcesSection;



