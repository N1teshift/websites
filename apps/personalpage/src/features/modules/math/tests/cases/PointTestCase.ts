import { PointSettings } from "../../types/mathObjectSettingsInterfaces";
import { TestCase } from "./TestCase";
import { PointPromptBuilder } from "../utils/builders/prompt/PointPromptBuilder";
import { PointNameBuilder } from "../utils/builders/name/PointNameBuilder";
import { PointIdBuilder } from "../utils/builders/id/PointIdBuilder";
import { PointComplexityBuilder } from "../utils/builders/complexity/PointComplexityBuilder";

// Create a type that extends PointSettings and adds an index signature
export type IndexablePointSettings = PointSettings & Record<string, unknown>;

/**
 * Test case for mathematical points
 * Points represent positions in a coordinate system, usually denoted by coordinates
 */
export class PointTestCase extends TestCase<IndexablePointSettings> {
  constructor(settings: Partial<PointSettings> = {}) {
    super("point", settings as Partial<IndexablePointSettings>);
    this.promptBuilder = new PointPromptBuilder();
    this.nameBuilder = new PointNameBuilder();
    this.idBuilder = new PointIdBuilder();
    this.complexityBuilder = new PointComplexityBuilder();
  }
}
