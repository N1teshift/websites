import { ExpressionSettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from './TestCase';
import { ExpressionPromptBuilder } from '../utils/builders/prompt/ExpressionPromptBuilder';
import { ExpressionNameBuilder } from '../utils/builders/name/ExpressionNameBuilder';
import { ExpressionIdBuilder } from '../utils/builders/id/ExpressionIdBuilder';
import { ExpressionComplexityBuilder } from '../utils/builders/complexity/ExpressionComplexityBuilder';

// Create a type that extends ExpressionSettings and adds an index signature
export type IndexableExpressionSettings = ExpressionSettings & Record<string, unknown>;

/**
 * Test case for mathematical expressions
 * Expressions combine terms, coefficients, and other expressions using mathematical operations
 */
export class ExpressionTestCase extends TestCase<IndexableExpressionSettings> {
    constructor(settings: Partial<ExpressionSettings> = {}) {
        super('expression', settings as Partial<IndexableExpressionSettings>);
        this.promptBuilder = new ExpressionPromptBuilder();
        this.nameBuilder = new ExpressionNameBuilder();
        this.idBuilder = new ExpressionIdBuilder();
        this.complexityBuilder = new ExpressionComplexityBuilder();
    }
} 



