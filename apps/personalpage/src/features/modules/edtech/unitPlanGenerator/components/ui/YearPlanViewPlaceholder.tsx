import React from 'react';
import { ActiveSection } from '../../types/UnitPlanTypes';

interface YearPlanViewPlaceholderProps {
    sectionName: ActiveSection;
}

const YearPlanViewPlaceholder: React.FC<YearPlanViewPlaceholderProps> = ({ sectionName }) => {
    const getSectionDisplayName = (section: ActiveSection): string => {
        const nameMap: Record<ActiveSection, string> = {
            'guide': 'Guide',
            'basic-info': 'Basic Info',
            'content': 'Content',
            'inquiry': 'Inquiry',
            'summative-assessment': 'Summative Assessment',
            'atl': 'ATL Skills',
            'planning': 'Planning',
            'resources': 'Resources',
            'community-engagement': 'Community Engagement',
            'reflection': 'Reflection',
            'preview': 'Preview',
            'content-display': 'Content Display',
            'data-management': 'Data Management',
            'settings': 'Settings'
        };
        return nameMap[section] || section;
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <div className="max-w-2xl w-full">
                <div className="bg-surface-card rounded-lg border-2 border-border-default p-8 text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light mb-4">
                            <svg 
                                className="w-8 h-8 text-brand" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                                />
                            </svg>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Year Plan View for &quot;{getSectionDisplayName(sectionName)}&quot;
                    </h2>
                    <p className="text-lg text-brand font-medium mb-4">
                        Coming Soon
                    </p>
                    
                    <div className="bg-surface-button rounded-lg p-6 mb-6 text-left border border-border-default">
                        <p className="text-text-primary mb-4">
                            This section is not yet available in Year Plan View mode. 
                            Year Plan View allows you to see and edit the same fields across all your unit plans simultaneously.
                        </p>
                        <p className="text-text-secondary text-sm">
                            To access this section now, please use the <strong>view mode toggle</strong> in the navigation tabs to switch back to <strong>Individual Plan</strong> mode.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <div className="text-sm text-text-muted flex items-center justify-center">
                            <span>Switch to Individual Plan mode using the toggle in the tabs above, or continue exploring other sections</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-text-muted">
                        💡 <strong>Tip:</strong> Year Plan View will be implemented section by section. 
                        Check back regularly for updates!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default YearPlanViewPlaceholder;




