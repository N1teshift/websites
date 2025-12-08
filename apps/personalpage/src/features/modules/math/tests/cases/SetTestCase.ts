import { SetSettings } from "../../types/mathObjectSettingsInterfaces";
import { TestCase } from "./TestCase";
import { SetPromptBuilder } from "../utils/builders/prompt/SetPromptBuilder";
import { SetNameBuilder } from "../utils/builders/name/SetNameBuilder";
import { SetIdBuilder } from "../utils/builders/id/SetIdBuilder";
import { SetComplexityBuilder } from "../utils/builders/complexity/SetComplexityBuilder";

// Create a type that extends SetSettings and adds an index signature
export type IndexableSetSettings = SetSettings & Record<string, unknown>;

/**
 * Test case for mathematical sets
 * Sets represent collections of distinct elements, typically represented with curly braces
 */
export class SetTestCase extends TestCase<IndexableSetSettings> {
  constructor(settings: Partial<SetSettings> = {}) {
    super("set", settings as Partial<IndexableSetSettings>);
    this.promptBuilder = new SetPromptBuilder();
    this.nameBuilder = new SetNameBuilder();
    this.idBuilder = new SetIdBuilder();
    this.complexityBuilder = new SetComplexityBuilder();
  }
}
