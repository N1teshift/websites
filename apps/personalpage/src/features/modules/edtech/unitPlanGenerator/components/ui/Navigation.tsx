import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ActiveSection, UnitPlanData } from '../../types/UnitPlanTypes';
import { useFallbackTranslation } from '@websites/infrastructure/i18n/client';
import ProgressBar from './ProgressBar';
import { 
    BookOpen, 
    Info, 
    BookMarked, 
    Search, 
    FileText, 
    Target, 
    Package, 
    Users, 
    Lightbulb, 
    Eye, 
    BarChart3, 
    Database, 
    Settings,
    FileStack,
    Calendar,
    ChevronDown
} from 'lucide-react';

interface NavigationProps {
    activeSection: ActiveSection;
    onSectionChange: (section: ActiveSection) => void;
    unitPlan?: Partial<UnitPlanData>;
    viewingMode: 'individual' | 'year';
    setViewingMode: (mode: 'individual' | 'year') => void;
}

const Navigation: React.FC<NavigationProps> = React.memo(({
    activeSection,
    onSectionChange,
    unitPlan,
    viewingMode,
    setViewingMode
}) => {
    const { t } = useFallbackTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    
    // All sections in a flat array for compact two-row layout
    const sections = useMemo(() => [
        { key: 'guide' as ActiveSection, label: t('guide'), icon: BookOpen },
        { key: 'basic-info' as ActiveSection, label: t('basic_info'), icon: Info },
        { key: 'content' as ActiveSection, label: t('content'), icon: BookMarked },
        { key: 'inquiry' as ActiveSection, label: t('inquiry'), icon: Search },
        { key: 'summative-assessment' as ActiveSection, label: t('summative_assessment'), icon: FileText },
        { key: 'atl' as ActiveSection, label: t('atl'), icon: Target },
        { key: 'resources' as ActiveSection, label: t('resources'), icon: Package },
        { key: 'community-engagement' as ActiveSection, label: t('community_engagement'), icon: Users },
        { key: 'reflection' as ActiveSection, label: t('reflection'), icon: Lightbulb },
        { key: 'preview' as ActiveSection, label: t('preview'), icon: Eye },
        { key: 'content-display' as ActiveSection, label: t('content_display'), icon: BarChart3 },
        { key: 'data-management' as ActiveSection, label: t('data_management'), icon: Database },
        { key: 'settings' as ActiveSection, label: t('settings'), icon: Settings },
    ], [t]);

    const handleViewModeToggle = useCallback(() => {
        setViewingMode(viewingMode === 'individual' ? 'year' : 'individual');
    }, [viewingMode, setViewingMode]);

    // Auto-scroll to active section on mobile
    useEffect(() => {
        if (scrollContainerRef.current) {
            const activeElement = scrollContainerRef.current.querySelector(`[data-section="${activeSection}"]`);
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [activeSection]);

    // Close bottom sheet when section changes
    useEffect(() => {
        setIsBottomSheetOpen(false);
    }, [activeSection]);

    // Prevent body scroll when bottom sheet is open
    useEffect(() => {
        if (isBottomSheetOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isBottomSheetOpen]);

    const handleSectionSelect = useCallback((section: ActiveSection) => {
        onSectionChange(section);
        setIsBottomSheetOpen(false);
    }, [onSectionChange]);

    const handleBottomSheetToggle = useCallback(() => {
        setIsBottomSheetOpen(prev => !prev);
    }, []);

    const getActiveSectionLabel = useCallback(() => {
        const activeSectionData = sections.find(s => s.key === activeSection);
        return activeSectionData?.label || activeSection;
    }, [sections, activeSection]);

    return (
        <div className="border-b border-border-default w-full overflow-hidden bg-transparent">
            {/* Progress Bar */}
            {unitPlan && <ProgressBar unitPlan={unitPlan} />}
            {/* Mobile bottom sheet navigation */}
            <div className="sm:hidden">
                {/* Navigation trigger button */}
                <button
                    onClick={handleBottomSheetToggle}
                    className="w-full px-4 py-3 flex items-center justify-between bg-transparent hover:bg-surface-button/50 border-b border-border-default text-left transition-colors duration-200"
                >
                    <div className="flex items-center space-x-3">
                        {React.createElement(sections.find(s => s.key === activeSection)?.icon || BookOpen, {
                            className: "w-5 h-5 text-brand",
                            strokeWidth: 2
                        })}
                        <span className="font-semibold text-text-primary">
                            {getActiveSectionLabel()}
                        </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-text-muted transform transition-transform duration-300 ${isBottomSheetOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Bottom sheet overlay */}
                {isBottomSheetOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={handleBottomSheetToggle}
                    />
                )}

                {/* Bottom sheet */}
                <div 
                    className={`fixed bottom-0 left-0 right-0 bg-surface-card rounded-t-3xl shadow-large z-50 transform transition-transform duration-300 ease-out ${
                        isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'
                    }`}
                    style={{ maxHeight: '80vh' }}
                >
                    {/* Handle bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1.5 bg-border-default rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border-default bg-surface-card">
                        <h3 className="text-lg font-bold text-text-primary">
                            {t('unit_plan_generator')}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Select a section to navigate
                        </p>
                    </div>

                    {/* Navigation options */}
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                        <div className="px-4 py-2">
                            {sections.map((section) => {
                                const IconComponent = section.icon;
                                return (
                                    <button
                                        key={section.key}
                                        onClick={() => handleSectionSelect(section.key)}
                                        className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 mb-1.5 ${
                                            activeSection === section.key
                                                ? 'bg-brand-light border-2 border-brand shadow-soft'
                                                : 'bg-transparent border-2 border-transparent hover:bg-surface-button/50 hover:shadow-soft'
                                        }`}
                                    >
                                        <IconComponent 
                                            className={`flex-shrink-0 ${
                                                activeSection === section.key ? 'text-brand' : 'text-text-muted'
                                            }`}
                                            size={22}
                                            strokeWidth={2}
                                        />
                                        <div className="flex-1 text-left">
                                            <div className={`font-semibold ${
                                                activeSection === section.key
                                                    ? 'text-brand'
                                                    : 'text-text-primary'
                                            }`}>
                                                {section.label}
                                            </div>
                                            {activeSection === section.key && (
                                                <div className="text-xs text-brand mt-0.5 font-medium">
                                                    Current section
                                                </div>
                                            )}
                                        </div>
                                        {activeSection === section.key && (
                                            <div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div>
                                        )}
                                    </button>
                                );
                            })}
                            
                            {/* View Mode Toggle Button for Mobile */}
                            <button
                                onClick={handleViewModeToggle}
                                className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 mt-2 border-2 ${
                                    viewingMode === 'year'
                                        ? 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-secondary-300 shadow-soft'
                                        : 'bg-gradient-to-r from-success-50 to-success-100 border-success-300 shadow-soft'
                                }`}
                            >
                                {viewingMode === 'individual' ? (
                                    <FileStack className={`flex-shrink-0 ${viewingMode === 'individual' ? 'text-success-600' : 'text-secondary-600'}`} size={22} strokeWidth={2} />
                                ) : (
                                    <Calendar className={`flex-shrink-0 ${viewingMode === 'year' ? 'text-secondary-600' : 'text-success-600'}`} size={22} strokeWidth={2} />
                                )}
                                <div className="flex-1 text-left">
                                    <div className={`font-semibold ${
                                        viewingMode === 'year'
                                            ? 'text-secondary-700'
                                            : 'text-success-700'
                                    }`}>
                                        {viewingMode === 'individual' ? 'Individual Plan View' : 'Year Plan View'}
                                    </div>
                                    <div className={`text-xs mt-0.5 font-medium ${
                                        viewingMode === 'year'
                                            ? 'text-secondary-600'
                                            : 'text-success-600'
                                    }`}>
                                        Tap to toggle view mode
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Close button */}
                    <div className="px-4 py-4 border-t border-border-default bg-surface-button">
                        <button
                            onClick={handleBottomSheetToggle}
                            className="w-full py-3 px-4 bg-surface-button text-text-primary rounded-xl font-semibold transition-all hover:bg-surface-button-hover hover:shadow-soft"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop compact two-row navigation */}
            <div className="hidden sm:block">
                <div className="px-4 sm:px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                        {sections.map((section) => {
                            // Check if section should be visible
                            const shouldShow = section.key !== 'content-display' || 
                                (unitPlan?.subject === 'mathematics' && (unitPlan?.mypYear === 2 || unitPlan?.mypYear === 3));
                            
                            if (!shouldShow) return null;

                            const IconComponent = section.icon;
                            const isActive = activeSection === section.key;

                            return (
                                <button
                                    key={section.key}
                                    data-section={section.key}
                                    onClick={() => onSectionChange(section.key)}
                                    className={`group py-2.5 px-3.5 min-w-[110px] rounded-xl font-semibold text-xs transition-all duration-200 ${
                                        isActive
                                            ? 'bg-brand text-text-inverse shadow-medium hover:shadow-large transform scale-105'
                                            : 'bg-transparent text-text-primary border-2 border-border-default hover:border-brand hover:bg-brand-light/10 hover:text-brand hover:shadow-soft'
                                    }`}
                                    style={{ flexBasis: 'calc(100% / 7 - 8px)' }}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        <IconComponent 
                                            className={`${isActive ? 'text-text-inverse' : 'text-text-primary group-hover:text-brand'} transition-colors`}
                                            size={18}
                                            strokeWidth={2.5}
                                        />
                                        <span className="whitespace-nowrap leading-tight text-center text-[11px]">
                                            {section.label}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-text-inverse rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                        
                        {/* View Mode Toggle Button (last tab on the right) */}
                        <button
                            onClick={handleViewModeToggle}
                            className={`group py-2.5 px-3.5 min-w-[110px] rounded-xl font-semibold text-xs transition-all duration-200 border-2 ${
                                viewingMode === 'year'
                                    ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-text-inverse shadow-medium hover:shadow-large border-transparent'
                                    : 'bg-gradient-to-br from-success-500 to-success-600 text-text-inverse shadow-medium hover:shadow-large border-transparent'
                            }`}
                            style={{ flexBasis: 'calc(100% / 7 - 8px)' }}
                            title={viewingMode === 'individual' ? 'Switch to Year Plan View' : 'Switch to Individual Plan View'}
                        >
                            <div className="flex flex-col items-center gap-1.5">
                                {viewingMode === 'individual' ? (
                                    <FileStack className="text-text-inverse" size={18} strokeWidth={2.5} />
                                ) : (
                                    <Calendar className="text-text-inverse" size={18} strokeWidth={2.5} />
                                )}
                                <span className="whitespace-nowrap leading-tight text-center text-[11px]">
                                    {viewingMode === 'individual' ? 'Individual' : 'Year Plan'}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

Navigation.displayName = 'Navigation';

export default Navigation;



