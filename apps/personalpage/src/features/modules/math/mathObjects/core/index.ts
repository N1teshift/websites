/**
 * @file Index file for the core math object generation and formatting utilities.
 * @description Re-exports various helper functions and classes related to:
 *              - Object generation factory (`generateObjectFactory`)
 *              - Coefficient generation (`CoefficientGenerator`)
 *              - Formatting coefficients (`CoefficientFormatter`)
 *              - Formatting terms and combinations (`TermFormatter`)
 *              - Formatting other structures like equations, points, etc. (`OtherFormatters`)
 *              - Shared utilities like the Orchestrator.
 * This allows importing core functionalities from a single entry point.
 */

export * from '../../shared/Orchestrator';
export * from './generateObjectFactory';
export * from './TermFormatter';
export * from './CoefficientFormatter';
export * from './OtherFormatters';
export * from './CoefficientGenerator'; 



