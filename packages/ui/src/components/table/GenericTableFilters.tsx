import React, { useMemo } from 'react';
import { useFallbackTranslation } from '@websites/infrastructure/i18n'; // Import the custom hook
import { FilterDefinition, ActiveFilters } from './types';

// Props for the main GenericTableFilters component (ensure this matches your actual props)
interface GenericTableFiltersProps<T> {
    allItems: T[];
    filterDefinitions: FilterDefinition<T>[];
    activeFilters: ActiveFilters<T>;
    onFilterChange: (filterKey: keyof ActiveFilters<T>, values: string[]) => void;
    className?: string;
}

// Internal component for rendering a single filter section
interface FilterSectionProps<T> {
    title: string; // This title prop is expected to be a translation key
    filterKey: keyof ActiveFilters<T>;
    options: string[];
    activeValues: string[];
    onToggleValue: (filterKey: keyof ActiveFilters<T>, value: string) => void;
    showAllOption?: boolean;
}

/**
 * Internal component that renders a single filter section with a title and filter options.
 *
 * @template T The type of data items being filtered.
 * @param props The component props.
 * @returns A React element representing the filter section.
 */
function FilterSection<T>(props: FilterSectionProps<T>): React.ReactElement {
    const { title, filterKey, options, activeValues, onToggleValue, showAllOption = true } = props;

    // Use the custom hook which handles namespace fallbacks internally
    const { t } = useFallbackTranslation();

    const allKey = 'all';
    const isAllSelected = activeValues.includes(allKey);
    const effectiveOptions = showAllOption ? [allKey, ...options] : options;

    const handleToggle = (value: string) => {
        onToggleValue(filterKey, value);
    };

    return (
        // Changed to flex-col to place label above buttons
        <div className="flex flex-col">
            {/* Adjusted label styling */}
            <h4 className="text-sm font-medium text-text-primary mb-1">{t(title)}</h4>
            {/* Button container remains horizontal */}
            <div className="flex flex-row flex-wrap items-center gap-1">
                {effectiveOptions.map((option) => {
                    const isActive = isAllSelected ? option === allKey : activeValues.includes(option);

                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleToggle(option)}
                            className={`px-1.5 py-0.5 text-xs rounded transition-colors duration-150 ${isActive
                                    ? 'bg-brand-primary text-text-inverse font-medium'
                                    : 'bg-surface-button text-text-primary hover:bg-surface-button-hover'
                                }`}
                        >
                            {option === allKey ? t('all') : option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * Renders a set of filter controls based on provided filter definitions.
 * Allows users to select filter values, which are then passed up via the `onFilterChange` callback.
 * It calculates unique filter options dynamically from `allItems` if options are provided as a function.
 *
 * @template T The type of data items being filtered.
 * @param props The component props.
 * @returns A React element containing the filter UI.
 */
export function GenericTableFilters<T>(props: GenericTableFiltersProps<T>): React.ReactElement {
    const { allItems, filterDefinitions, activeFilters, onFilterChange, className = "bg-surface-card border border-border-default rounded-lg p-2" } = props;

    const computedFilters = useMemo(() => {
        return filterDefinitions.map((def: FilterDefinition<T>) => {
            let options: string[] = [];
            if (typeof def.options === 'function') {
                options = def.options(allItems);
            } else {
                options = def.options;
            }
            const uniqueOptions = Array.from(new Set(options.filter(opt => typeof opt === 'string')));
            const currentActive = activeFilters[def.key] ?? def.initialValues ?? [];

            return {
                ...def,
                computedOptions: uniqueOptions.sort(),
                activeValues: currentActive,
            };
        });
    }, [filterDefinitions, allItems, activeFilters]);

    const handleFilterToggle = (filterKey: keyof ActiveFilters<T>, value: string) => {
        const currentValues = activeFilters[filterKey] ?? [];
        const allKey = 'all';
        let newValues: string[];

        if (value === allKey) {
            const isCurrentlyAll = currentValues.length === 1 && currentValues[0] === allKey;
            newValues = isCurrentlyAll ? [] : [allKey];
        } else {
            if (currentValues.includes(allKey)) {
                newValues = [value];
            } else {
                if (currentValues.includes(value)) {
                    newValues = currentValues.filter((v: string) => v !== value);
                } else {
                    newValues = [...currentValues, value];
                }
            }
        }
        onFilterChange(filterKey, newValues);
    };

    return (
        <div className={className}>
            <div className="flex items-start gap-6">
                {computedFilters.map((filter) => (
                    <FilterSection
                        key={filter.key.toString()}
                        title={filter.label} // Ensure filter.label is a translation key
                        filterKey={filter.key}
                        options={filter.computedOptions}
                        activeValues={filter.activeValues}
                        onToggleValue={handleFilterToggle}
                        showAllOption={true}
                    />
                ))}
            </div>
        </div>
    );
} 

