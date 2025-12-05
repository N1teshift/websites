import { useEffect, useMemo } from "react";
import {
  CoefficientRule, coeficientRuleOptions, NumberSet, RepresentationType, CoefficientSettings
} from "../../types/index";
import { getAllowedRepresentationTypes, getDefaultRepresentationType } from "../../shared/mathematicalConstraints";

import { areRulesPairwiseCompatible } from '@/features/modules/math/shared/coefficientConceptualValidator';
import { isPrime } from "../../shared/numberUtils";

/**
 * Interface for options in the representation type dropdown.
 */
export interface RepresentationTypeOption {
  /** The actual representation type value. */
  value: RepresentationType;
  /** The display label for the representation type. */
  label: string;
}

/**
 * Custom hook to manage the `representationType` for `CoefficientSettings`.
 * It ensures that the selected representation type is valid for the current `numberSet`
 * and adjusts it if necessary. It also provides the filtered list of available
 * representation type options for complex mode.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings.
 * @param {(newSettings: CoefficientSettings) => void} updateSettings - Callback to update the settings.
 * @param {"simple" | "complex"} interfaceType - The current interface mode.
 * @returns {{ representationTypeOptions: RepresentationTypeOption[] }} An object containing the list of
 *          valid representation type options for dropdowns (empty in simple mode).
 */
export function useRepresentationType(
  settings: CoefficientSettings,
  updateSettings: (newSettings: CoefficientSettings) => void,
  interfaceType: "simple" | "complex"
) {
  // Handle representation type adjustment when number set changes
  useEffect(() => {
    // Simple mode - use predefined representation type based on number set
    if (interfaceType === "simple") {
      const defaultRepType = getDefaultRepresentationType(settings.numberSet);
      
      if (settings.representationType !== defaultRepType) {
        updateSettings({
          ...settings,
          representationType: defaultRepType,
        });
      }
      return;
    }
    
    // Complex mode - ensure representation type is compatible with number set
    const allowedTypes = getAllowedRepresentationTypes(settings.numberSet);
    if (!allowedTypes.includes(settings.representationType)) {
      // Choose first allowed type as fallback
      const newRepType = allowedTypes[0] || "decimal";
      if (newRepType !== settings.representationType) {
        updateSettings({ ...settings, representationType: newRepType });
      }
    }
  }, [interfaceType, settings.numberSet, settings.representationType, updateSettings, settings]);

  // Calculate available representation type options
  const representationTypeOptions = useMemo((): RepresentationTypeOption[] => {
    if (interfaceType === "simple") {
      return [];
    }

    const baseOptions: RepresentationTypeOption[] = [
      { value: "decimal", label: "Decimal" },
      { value: "fraction", label: "Fraction" },
      { value: "mixed", label: "Mixed" },
      { value: "root", label: "Root" },
      { value: "logarithm", label: "Logarithm" }
    ];

    const allowedTypes = getAllowedRepresentationTypes(settings.numberSet);
    return baseOptions.filter(opt => allowedTypes.includes(opt.value));
  }, [interfaceType, settings.numberSet]);

  return { representationTypeOptions };
}

/**
 * Custom hook to determine which `CoefficientRule` options should be disabled
 * based on the current `numberSet`, `range`, and `interfaceType`.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings.
 * @param {"simple" | "complex"} interfaceType - The current interface mode (rules are not disabled in simple mode).
 * @returns {CoefficientRule[]} An array of `CoefficientRule`s that should be disabled in the UI.
 * @remarks
 * Disabling logic includes:
 * - For real/rational/irrational: only sign-related rules are enabled.
 * - For integer: "prime" is disabled.
 * - For natural: sign-related rules ("positive", "negative", "nonzero") are disabled as redundant.
 * - Range-specific: If range is all positive/negative, or just zero, relevant sign/type rules are disabled.
 * - "unit" rule disabled if 1 or -1 are not in range.
 * - "prime" rule disabled if no primes are in a natural number range.
 */
export function useDisabledRules(
  settings: CoefficientSettings,
  interfaceType: "simple" | "complex"
) {
  return useMemo(() => {
    if (interfaceType === "simple") return [];
    
    const disabled: CoefficientRule[] = [];
    const { numberSet } = settings;
    
    // For real, rational and irrational number sets, only allow sign-related rules
    if (["real", "rational", "irrational"].includes(numberSet)) {
      return coeficientRuleOptions.filter(rule => 
        !["positive", "negative", "nonzero"].includes(rule)
      );
    }
    
    // For integer numbers, disable prime (only valid for natural numbers)
    if (numberSet === "integer") {
      disabled.push("prime");
    }
    
    // For natural numbers, sign-related rules are redundant
    if (numberSet === "natural") {
      disabled.push("positive", "negative", "nonzero");
    }
    
    // If we have a range, check range-specific constraints
    if (settings.range && settings.range.length === 2) {
      const [min, max] = settings.range;
      
      // If range is all positive or all negative, disable sign/zero rules as appropriate
      if (min > 0) {
        // All positive range
        disabled.push("negative");
        disabled.push("nonzero"); // Redundant with all positive
      } else if (max < 0) {
        // All negative range
        disabled.push("positive");
        disabled.push("nonzero"); // Redundant with all negative
      } else if (min === 0 && max === 0) {
        // Range is just zero
        disabled.push("positive", "negative", "nonzero", "odd", "even", "prime", "square", "cube");
      }
      
      // Check for special rules that need at least one valid value in the range
      if (numberSet === "natural" || numberSet === "integer") {
        // Unit rule requires 1 or -1 in the range
        if (!(min <= 1 && max >= 1) && !(min <= -1 && max >= -1)) {
          disabled.push("unit");
        }
        
        // Prime rule requires at least one prime in the range
        if (numberSet === "natural" && (min > 2 || max < 2)) {
          let hasPrime = false;
          // Simple check for small ranges to see if there's a prime number
          for (let i = Math.max(2, min); i <= Math.min(max, 100); i++) {
            if (isPrime(i)) {
              hasPrime = true;
              break;
            }
          }
          if (!hasPrime) {
            disabled.push("prime");
          }
        }
      }
    }
    
    return Array.from(new Set(disabled)); // Remove duplicates
  }, [interfaceType, settings]);
}

/**
 * Custom hook (effect) that cleans up selected `CoefficientRule`s by removing any rules
 * that become incompatible or disabled due to changes in `disabledOptions`.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings.
 * @param {(newSettings: CoefficientSettings) => void} updateSettings - Callback to update the settings.
 * @param {CoefficientRule[]} disabledOptions - An array of rules that are currently considered disabled.
 */
export function useRulesCleanup(
  settings: CoefficientSettings,
  updateSettings: (newSettings: CoefficientSettings) => void,
  disabledOptions: CoefficientRule[]
) {
  useEffect(() => {
    const updatedRules = settings.rules.filter(rule => !disabledOptions.includes(rule));
    if (updatedRules.length !== settings.rules.length) {
      updateSettings({ ...settings, rules: updatedRules });
    }
  }, [disabledOptions, settings, updateSettings]);
}

/**
 * Utility function to handle changes in selected coefficient rules.
 * It ensures that when a new rule is added, it is compatible with all existing selected rules.
 * If an existing rule is incompatible with the newly added one, the existing rule is removed.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings, containing the `rules` array.
 * @param {string} option - The string representation of the `CoefficientRule` being added or removed.
 * @returns {CoefficientRule[]} The updated array of selected, compatible `CoefficientRule`s.
 * @remarks
 * - Uses `areRulesPairwiseCompatible` to check compatibility between rules.
 */
export function handleRuleSelectionChange(
  settings: CoefficientSettings,
  option: string,
): CoefficientRule[] {
  const currentRules = new Set(settings.rules);
  const optionAsRule = option as CoefficientRule;
  
  // If removing a rule, simply remove it
  if (currentRules.has(optionAsRule)) {
    currentRules.delete(optionAsRule);
    return Array.from(currentRules) as CoefficientRule[];
  }
  
  // If adding a rule, check compatibility with all existing rules
  const newRules: CoefficientRule[] = [];
  const existingRules = Array.from(currentRules);
  
  // Check each existing rule for compatibility with the new rule
  for (const existingRule of existingRules) {
    if (areRulesPairwiseCompatible(existingRule, optionAsRule)) {
      newRules.push(existingRule);
    }
  }
  
  // Add the new rule
  newRules.push(optionAsRule);
  return newRules;
}

/**
 * Custom hook that combines rule disabling logic and cleanup effects for `CoefficientSettings`.
 * It provides the list of disabled rule options and a handler for rule changes that respects
 * rule compatibility.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings.
 * @param {(newSettings: CoefficientSettings) => void} updateSettings - Callback to update the settings.
 * @param {"simple" | "complex"} interfaceType - The current interface mode.
 * @returns {{ disabledOptions: CoefficientRule[]; handleRulesChange: (option: string) => void; }}
 *          An object containing the array of `disabledOptions` and the `handleRulesChange` callback.
 */
export function useCoefficientRules(
  settings: CoefficientSettings,
  updateSettings: (newSettings: CoefficientSettings) => void,
  interfaceType: "simple" | "complex"
) {
  // Get disabled rules
  const disabledOptions = useDisabledRules(settings, interfaceType);
  
  // Clean up incompatible rules
  useRulesCleanup(settings, updateSettings, disabledOptions);
  
  // Handle rule changes
  const handleRulesChange = (option: string) => {
    const newRules = handleRuleSelectionChange(settings, option);
    updateSettings({ ...settings, rules: newRules });
  };
  
  return { disabledOptions, handleRulesChange };
}

/**
 * Comprehensive custom hook for managing all aspects of `CoefficientSettings`.
 * It combines logic for representation types, rule management (disabled states, compatibility, cleanup),
 * and provides handlers for changing `numberSet` and `range`.
 *
 * @param {CoefficientSettings} settings - The current coefficient settings.
 * @param {(newSettings: CoefficientSettings) => void} updateSettings - Callback to update the settings.
 * @param {"simple" | "complex"} interfaceType - The current interface mode.
 * @returns {{ 
 *    representationTypeOptions: RepresentationTypeOption[]; 
 *    disabledOptions: CoefficientRule[]; 
 *    handleRulesChange: (option: string) => void; 
 *    handleNumberSetChange: (value: string) => void; 
 *    handleRangeChange: (newRange: number[]) => void; 
 * }}
 * An object containing available representation type options, disabled rule options,
 * and handler functions for rules, number set, and range.
 */
export function useCoefficientSettings(
  settings: CoefficientSettings,
  updateSettings: (newSettings: CoefficientSettings) => void,
  interfaceType: "simple" | "complex"
) {
  const { representationTypeOptions } = useRepresentationType(
    settings, 
    updateSettings, 
    interfaceType
  );
  
  const { disabledOptions, handleRulesChange } = useCoefficientRules(
    settings, 
    updateSettings, 
    interfaceType
  );
  
  const handleNumberSetChange = (value: string) => {
    updateSettings({ ...settings, numberSet: value as NumberSet });
  };
  
  const handleRangeChange = (newRange: number[]) => {
    // Ensure we extract a tuple [number, number] from the input array
    const rangeTuple: [number, number] = [
      newRange.length > 0 ? newRange[0] : 0, // Default min
      newRange.length > 1 ? newRange[1] : 10 // Default max
    ];
    updateSettings({ ...settings, range: rangeTuple });
  };
  
  return {
    representationTypeOptions,
    disabledOptions,
    handleRulesChange,
    handleNumberSetChange,
    handleRangeChange
  };
} 



