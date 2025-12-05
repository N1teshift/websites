// Base property for all test cases
/**
 * Represents the fundamental property common to all math object settings or test cases,
 * indicating the type of the mathematical object.
 */
export type BaseProperty = 'objectType';

// Properties specific to coefficient test cases
/**
 * Represents property names that are specific to the settings of a single Coefficient.
 */
export type CoefficientProperty = 
  | 'numberSet'
  | 'representationType'
  | 'coefficientRule' // Refer to a single rule from CoefficientSettings.rules
  | 'range';

// Properties specific to coefficients test cases
/**
 * Represents property names that are specific to the settings of a collection of Coefficients.
 */
export type CoefficientsProperty = 
  | 'collectionCount'
  | 'coefficientsRule'; // Refer to a rule from CoefficientsSettings.rules

// Union of all possible property categories
/**
 * A union type encompassing all defined property categories.
 * Useful for functions or components that need to handle any type of property category.
 */
export type PropertyCategory = 
  | BaseProperty
  | CoefficientProperty
  | CoefficientsProperty;



