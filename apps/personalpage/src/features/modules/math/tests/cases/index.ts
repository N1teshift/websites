/**
 * @file Index file for Test Case classes and Test Registry.
 * @description Exports the base `TestCase` class, specific test case classes for different
 *              math object types (e.g., `CoefficientTestCase`, `EquationTestCase`), and also
 *              re-exports the `TestRegistry` and related functions from `../core/TestRegistry`
 *              for managing and accessing these test cases.
 */
export { TestCase } from "./TestCase";
export { CoefficientTestCase } from "./CoefficientTestCase";
export { TermTestCase } from "./TermTestCase";
export { TermsTestCase } from "./TermsTestCase";
export { CoefficientsTestCase } from "./CoefficientsTestCase";
export { ExpressionTestCase } from "./ExpressionTestCase";
export { EquationTestCase } from "./EquationTestCase";
export { InequalityTestCase } from "./InequalityTestCase";
export { SetTestCase } from "./SetTestCase";
export { IntervalTestCase } from "./IntervalTestCase";
export { PointTestCase } from "./PointTestCase";

// Export registry functionality
export {
  TestRegistry,
  getAllTestsFlat as getAllTests,
  createTestCase,
  getAvailableTypes as getAvailableTestTypes,
  getTestsForType,
  allTests,
} from "../core/TestRegistry";
