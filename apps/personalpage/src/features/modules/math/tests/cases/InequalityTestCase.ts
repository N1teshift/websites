import { InequalitySettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from './TestCase';
import { InequalityPromptBuilder } from '../utils/builders/prompt/InequalityPromptBuilder';
import { InequalityNameBuilder } from '../utils/builders/name/InequalityNameBuilder';
import { InequalityIdBuilder } from '../utils/builders/id/InequalityIdBuilder';
import { InequalityComplexityBuilder } from '../utils/builders/complexity/InequalityComplexityBuilder';

// Create a type that extends InequalitySettings and adds an index signature
export type IndexableInequalitySettings = InequalitySettings & Record<string, unknown>;

/**
 * Test case for mathematical inequalities
 * Inequalities represent relationships between expressions using operators like <, >, ≤, or ≥
 */
export class InequalityTestCase extends TestCase<IndexableInequalitySettings> {
    constructor(settings: Partial<InequalitySettings> = {}) {
        super('inequality', settings as Partial<IndexableInequalitySettings>);
        this.promptBuilder = new InequalityPromptBuilder();
        this.nameBuilder = new InequalityNameBuilder();
        this.idBuilder = new InequalityIdBuilder();
        this.complexityBuilder = new InequalityComplexityBuilder();
    }
} 



