import { TermSettings } from "../../types/mathObjectSettingsInterfaces";
import { TestCase } from "./TestCase";
import { TermPromptBuilder } from "../utils/builders/prompt/TermPromptBuilder";
import { TermNameBuilder } from "../utils/builders/name/TermNameBuilder";
import { TermIdBuilder } from "../utils/builders/id/TermIdBuilder";
import { TermComplexityBuilder } from "../utils/builders/complexity/TermComplexityBuilder";

// Create a type that extends TermSettings and adds an index signature
export type IndexableTermSettings = TermSettings & Record<string, unknown>;

export class TermTestCase extends TestCase<IndexableTermSettings> {
  constructor(settings: Partial<TermSettings> = {}) {
    super("term", settings as Partial<IndexableTermSettings>);
    this.promptBuilder = new TermPromptBuilder();
    this.nameBuilder = new TermNameBuilder();
    this.idBuilder = new TermIdBuilder();
    this.complexityBuilder = new TermComplexityBuilder();
  }
}
