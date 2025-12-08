import { EquationSettings } from "../../types/mathObjectSettingsInterfaces";
import { TestCase } from "./TestCase";
import { EquationPromptBuilder } from "../utils/builders/prompt/EquationPromptBuilder";
import { EquationNameBuilder } from "../utils/builders/name/EquationNameBuilder";
import { EquationIdBuilder } from "../utils/builders/id/EquationIdBuilder";
import { EquationComplexityBuilder } from "../utils/builders/complexity/EquationComplexityBuilder";

// Create a type that extends EquationSettings and adds an index signature
export type IndexableEquationSettings = EquationSettings & Record<string, unknown>;

/**
 * Test case for mathematical equations
 * Equations represent mathematical statements where two expressions are equal
 */
export class EquationTestCase extends TestCase<IndexableEquationSettings> {
  constructor(settings: Partial<EquationSettings> = {}) {
    super("equation", settings as Partial<IndexableEquationSettings>);
    this.promptBuilder = new EquationPromptBuilder();
    this.nameBuilder = new EquationNameBuilder();
    this.idBuilder = new EquationIdBuilder();
    this.complexityBuilder = new EquationComplexityBuilder();
  }
}
