import React from 'react';
import styles from '@styles/TestResults.module.css';
import { TestCase } from '@math/tests/cases/TestCase';
import {
    TestResultData, PropertyCategory, CoefficientSettings, CoefficientsSettings,
    TermsSettings, ExpressionSettings, EquationSettings
} from '@math/types/index';
import { getTestNumberSetSymbol } from '@math/tests/utils/formatters/testFormatters';
import { getAbbreviation } from '@math/tests/utils/formatters/abbreviationUtils';

export interface TagProps {
    text: string;
    type: PropertyCategory;
    matched?: boolean;
}

// Maps property categories to their CSS classes
const propertyStyles: Record<PropertyCategory, string> = {
    'objectType': styles.object,        // Style for object type tags (e.g., "coefficient")
    'numberSet': styles.numberSet,      // Style for number set tags (e.g., "ℤ")
    'representationType': styles.representation,  // Style for representation tags
    'coefficientRule': styles.rule,     // Style for coefficient rules
    'range': styles.range,              // Style for range values
    'collectionCount': styles.collectionCount,       // Style for collection size
    'coefficientsRule': styles.coefficientsRule      // Style for coefficient collection rules
};

// Individual tag component that displays a single property with styling
/**
 * Displays a single property tag with appropriate styling based on its type and matched state.
 * @param props The component props.
 * @param props.text The text content of the tag.
 * @param props.type The category of the property, determining the tag's style.
 * @param props.matched Optional. If false, applies a 'failed' style. Defaults to true.
 * @returns A styled span element representing the tag.
 */
const Tag: React.FC<TagProps> = ({ text, type, matched = true }) => {
    // Combine CSS classes:
    // 1. Base tag style (styles.tag)
    // 2. Property-specific style (propertyStyles[type])
    // 3. Failed state style if not matched
    const classes = [
        styles.tag,
        propertyStyles[type],
        !matched && styles.failed,
    ].filter(Boolean).join(' ');

    return <span className={classes}>{text}</span>;
};

export interface PropertyTagsProps {
    test: TestCase<Record<string, unknown>>;
    result?: TestResultData<Record<string, unknown>>;
}

/**
 * Renders a collection of tags representing the properties of a given test case.
 * It adapts the displayed tags based on the test's object type (e.g., coefficient, terms).
 * Optionally highlights tags based on test result.
 *
 * @param props The component props.
 * @param props.test The test case object containing properties to display.
 * @param props.result Optional. The test result data, used to determine if tags should be marked as matched/failed.
 * @returns A div element containing multiple Tag components.
 */
export const PropertyTags: React.FC<PropertyTagsProps> = ({ test, result }) => {
    // For coefficients, we will build a list of JSX elements (rows)
    if (test.objectType === 'coefficients') {
        const currentSettings = hasGetSettings(test)
            ? (test.getSettings() as Partial<CoefficientsSettings>)
            : (test as { settings?: Partial<CoefficientsSettings> }).settings || {};

        const rows: JSX.Element[] = [];

        // Row 1: Collection-level tags
        const collectionTags: JSX.Element[] = [];
        if (currentSettings && currentSettings.collectionCount) {
            collectionTags.push(
                <Tag 
                    key="collectionCount" 
                    text={`${currentSettings.collectionCount}`} 
                    type="collectionCount"
                    matched={result?.passed}
                />
            );
        }
        if (currentSettings && currentSettings.rules && Array.isArray(currentSettings.rules) && currentSettings.rules.length > 0) {
            currentSettings.rules.forEach((rule: string, i: number) => {
                const ruleText = getAbbreviation(rule, 'collectionRule');
                collectionTags.push(
                    <Tag 
                        key={`coefficientsRule-${i}`} 
                        text={ruleText} 
                        type="coefficientsRule"
                        matched={result?.passed}
                    />
                );
            });
        }
        if (collectionTags.length > 0) {
            rows.push(<div key="collection-tags-row" className={styles.propertyRow}>{collectionTags}</div>);
        }

        // Subsequent rows: Tags for each individual coefficient
        if (currentSettings.coefficients && Array.isArray(currentSettings.coefficients)) {
            currentSettings.coefficients.forEach((individualCoeffSettings, coeffIndex) => {
                const individualCoeffTags: JSX.Element[] = [];
                const baseKey = `coeff-${coeffIndex}`;

                if (individualCoeffSettings.numberSet) {
                    individualCoeffTags.push(
                        <Tag 
                            key={`${baseKey}-numberSet`}
                            text={getTestNumberSetSymbol(individualCoeffSettings.numberSet)} 
                            type="numberSet"
                            matched={result?.passed}
                        />
                    );
                }
                if (individualCoeffSettings.rules && individualCoeffSettings.rules.length > 0) {
                    individualCoeffSettings.rules.forEach((rule: string, ruleIndex: number) => {
                        individualCoeffTags.push(
                            <Tag 
                                key={`${baseKey}-rule-${ruleIndex}`}
                                text={getAbbreviation(rule, 'rule')} 
                                type="coefficientRule"
                                matched={result?.passed}
                            />
                        );
                    });
                }
                if (individualCoeffSettings.range && Array.isArray(individualCoeffSettings.range) && individualCoeffSettings.range.length === 2) {
                    const [min, max] = individualCoeffSettings.range;
                    individualCoeffTags.push(
                        <Tag 
                            key={`${baseKey}-range`}
                            text={`[${min},${max}]`} 
                            type="range"
                            matched={result?.passed}
                        />
                    );
                }
                if (individualCoeffSettings.representationType) {
                    individualCoeffTags.push(
                        <Tag 
                            key={`${baseKey}-representationType`}
                            text={getAbbreviation(individualCoeffSettings.representationType, 'reprType')} 
                            type="representationType"
                            matched={result?.passed}
                        />
                    );
                }
                if (individualCoeffTags.length > 0) {
                    rows.push(<div key={`${baseKey}-row`} className={styles.propertyRow}>{individualCoeffTags}</div>);
                }
            });
        }
        return <div className={styles.tagContainerVertical}>{rows}</div>; // New container for vertical stacking
    }

    // Original logic for other test object types (flat list of tags)
    const tags: JSX.Element[] = [];
    
    // Object type tag (Optional, can be uncommented if needed)
    //if (test.objectType) {
    //    tags.push(
    //        <Tag 
    //            key="objectType" 
    //            text={test.objectType} 
    //            type="objectType"
    //            matched={result?.passed}
    //        />
    //    );
    //}

    // Type guard to check if an object has a `getSettings` method.
    /**
     * Type guard to check if an object has a getSettings method
     * @param obj The object to check.
     * @returns True if the object has a `getSettings` method, false otherwise.
     */
    function hasGetSettings(obj: unknown): obj is { getSettings: () => unknown } {
        return typeof obj === 'object' && obj !== null && typeof (obj as { getSettings?: unknown }).getSettings === 'function';
    }

    // Properties for coefficient test cases
    if (test.objectType === 'coefficient') {
        // Use type guard to avoid 'any' and fix linter errors
        const settings = hasGetSettings(test)
            ? (test.getSettings() as Partial<CoefficientSettings>)
            : (test as { settings?: Partial<CoefficientSettings> }).settings || {};

        // Number set with symbol
        if (settings.numberSet) {
            tags.push(
                <Tag 
                    key="numberSet" 
                    text={getTestNumberSetSymbol(settings.numberSet)} 
                    type="numberSet"
                    matched={result?.passed}
                />
            );
        }
        
        // Rules with abbreviations
        if (settings.rules && settings.rules.length > 0) {
            settings.rules.forEach((rule: string, i: number) => {
                tags.push(
                    <Tag 
                        key={`rule-${i}`} 
                        text={getAbbreviation(rule, 'rule')} 
                        type="coefficientRule"
                        matched={result?.passed}
                    />
                );
            });
        }
        
        // Range with min-max values
        if (settings.range && Array.isArray(settings.range) && settings.range.length === 2) {
            const [min, max] = settings.range;
            tags.push(
                <Tag 
                    key="range" 
                    text={`[${min},${max}]`} 
                    type="range"
                    matched={result?.passed}
                />
            );
        }
        
        // Representation type with abbreviation
        if (settings.representationType) {
            tags.push(
                <Tag 
                    key="representationType" 
                    text={getAbbreviation(settings.representationType, 'reprType')} 
                    type="representationType"
                    matched={result?.passed}
                />
            );
        }
    }

    // Terms-specific properties
    if (test.objectType === 'terms') {
        // Use type guard to avoid 'any' and fix linter errors
        const settings = hasGetSettings(test)
            ? (test.getSettings() as Partial<TermsSettings>)
            : (test as { settings?: Partial<TermsSettings> }).settings || {};

        // Term count (assuming it's based on the length of terms array in settings)
        if (settings.terms && settings.terms.length) {
            tags.push(
                <Tag 
                    key="termCount" 
                    text={`Terms: ${settings.terms.length}`} 
                    type="collectionCount"
                    matched={result?.passed}
                />
            );
        }
        
        // Power range (access through settings)
        if (settings.power && Array.isArray(settings.power) && settings.power.length === 2) {
            const [min, max] = settings.power;
            tags.push(
                <Tag 
                    key="power" 
                    text={`Power: [${min},${max}]`} 
                    type="range"
                    matched={result?.passed}
                />
            );
        }
    }

    // Expression-specific properties
    if (test.objectType === 'expression') {
        // Use type guard to avoid 'any' and fix linter errors
        const settings = hasGetSettings(test)
            ? (test.getSettings() as Partial<ExpressionSettings>)
            : (test as { settings?: Partial<ExpressionSettings> }).settings || {};

        // Component count (assuming it's based on the length of expressions array)
        if (settings.expressions && settings.expressions.length) {
            tags.push(
                <Tag 
                    key="componentCount" 
                    text={`Components: ${settings.expressions.length}`} 
                    type="collectionCount"
                    matched={result?.passed}
                />
            );
        }
    }

    // Equation-specific properties
    if (test.objectType === 'equation') {
        // Use type guard to avoid 'any' and fix linter errors
        const settings = hasGetSettings(test)
            ? (test.getSettings() as Partial<EquationSettings>)
            : (test as { settings?: Partial<EquationSettings> }).settings || {};

        // Sides (assuming it's based on the length of terms array)
        if (settings.terms && settings.terms.length) {
            tags.push(
                <Tag 
                    key="sides" 
                    text={`Sides: ${settings.terms.length}`} 
                    type="collectionCount"
                    matched={result?.passed}
                />
            );
        }
        
        // Variables (Commented out)
        /*
        if (settings.variables && settings.variables.length > 0) {
            const varsText = settings.variables.join(', ');
            tags.push(
                <Tag 
                    key="variables" 
                    text={`Vars: ${varsText}`} 
                    type="collectionCount"
                    matched={result?.passed}
                />
            );
        }
        */
    }

    // Default rendering for any other object type that wasn't 'coefficients'
    // and has had its tags collected in the `tags` array.
    return (
        <div className={styles.tagContainer}>
            {tags}
        </div>
    );
};

export default PropertyTags;
export { Tag };



