import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UnitPlanData } from '../../types/UnitPlanTypes';
import { isFeatureEnabled } from '@/config/features';
import LabelWithInfo from './LabelWithInfo';
import ContextAwareAIButton from './ContextAwareAIButton';
import FieldCompletionIndicator from '../ui/FieldCompletionIndicator';

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'input' | 'textarea' | 'select';
    rows?: number;
    placeholder?: string;
    required?: boolean;
    className?: string;
    info?: string;
    debounceMs?: number; // Defaults to 300ms, set to 0 to disable debouncing
    
    // Select options (for type="select")
    options?: Array<{ value: string; label: string }>;
    
    // AI Generation Props
    /** Field name for context-aware generation */
    fieldName?: keyof UnitPlanData | string;
    /** Unit plan context for intelligent generation */
    unitPlanContext?: Partial<UnitPlanData>;
    /** Enable context-aware AI generation */
    useContextAI?: boolean;
    /** Whether to show AI button (defaults to true if useContextAI is true) */
    showAIButton?: boolean;
    /** Lesson-specific context (for lesson fields) */
    subunitContext?: {
        subunitIndex: number;
        subunitNumber: number;
    };
}

/**
 * Unified FormField Component
 * 
 * A comprehensive form field component that handles:
 * - Text inputs
 * - Textareas
 * - Select dropdowns
 * - AI generation with context awareness
 * - Tooltips and labels
 * - Debounced updates for performance (default 300ms)
 */
const FormField: React.FC<FormFieldProps> = ({
    label,
    value,
    onChange,
    type = 'input',
    rows = 3,
    placeholder,
    required = false,
    className = '',
    info,
    debounceMs = 300,
    options = [],
    fieldName,
    unitPlanContext,
    useContextAI = false,
    showAIButton,
    subunitContext
}) => {
    // Local state for instant UI updates
    const [localValue, setLocalValue] = useState(value);
    const debounceTimerRef = useRef<NodeJS.Timeout>();
    
    // Sync local value when prop value changes (e.g., from AI generation or external update)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);
    
    // Debounced update to parent
    const debouncedOnChange = useCallback((newValue: string) => {
        if (debounceMs === 0) {
            // No debouncing, update immediately
            onChange(newValue);
            return;
        }
        
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Set new timer
        debounceTimerRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    }, [onChange, debounceMs]);
    
    // Handle input change
    const handleChange = useCallback((newValue: string) => {
        setLocalValue(newValue);
        debouncedOnChange(newValue);
    }, [debouncedOnChange]);
    
    // Handle blur - save immediately
    const handleBlur = useCallback(() => {
        // Clear pending debounce
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        // Save immediately if value changed
        if (localValue !== value) {
            onChange(localValue);
        }
    }, [localValue, value, onChange]);
    
    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);
    
    const baseInputClasses = "w-full px-4 py-2.5 border-2 border-border-default rounded-xl bg-surface-card text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-light focus:border-brand hover:border-border-accent";
    const fullClassName = `${baseInputClasses} ${className}`;

    // Determine if AI button should be shown
    const shouldShowAI = showAIButton !== false && useContextAI && fieldName && unitPlanContext;

    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <textarea
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        rows={rows}
                        placeholder={placeholder}
                        className={fullClassName}
                    />
                );
            
            case 'select':
                return (
                    <select
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        className={fullClassName}
                    >
                        <option value="">{placeholder || 'Select an option...'}</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            
            case 'input':
            default:
                return (
                    <input
                        type="text"
                        value={localValue}
                        onChange={(e) => handleChange(e.target.value)}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={fullClassName}
                    />
                );
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {info ? (
                    <LabelWithInfo 
                        label={label} 
                        info={info} 
                        required={required}
                    />
                ) : (
                    <label className="block text-sm font-semibold text-text-primary">
                        {label}
                        {required && <span className="text-danger-500 ml-1">*</span>}
                    </label>
                )}
                
                {shouldShowAI && fieldName && unitPlanContext && (
                    <ContextAwareAIButton
                        fieldName={fieldName as keyof UnitPlanData}
                        unitPlanContext={unitPlanContext}
                        onGenerate={(content) => {
                            const stringContent = String(content);
                            setLocalValue(stringContent);
                            onChange(stringContent);
                        }}
                        size="sm"
                        subunitContext={subunitContext}
                    />
                )}
            </div>
            
            {renderInput()}
            
            {/* Field completion indicator - use local value for instant feedback */}
            {fieldName && isFeatureEnabled('fieldCompletion') && (
                <FieldCompletionIndicator
                    fieldName={fieldName as keyof UnitPlanData}
                    value={localValue}
                />
            )}
        </div>
    );
};

export default FormField;



