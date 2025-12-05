import { TermsSettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from './TestCase';
import { TermsPromptBuilder } from '../utils/builders/prompt/TermsPromptBuilder';
import { TermsNameBuilder } from '../utils/builders/name/TermsNameBuilder';
import { TermsIdBuilder } from '../utils/builders/id/TermsIdBuilder';
import { TermsComplexityBuilder } from '../utils/builders/complexity/TermsComplexityBuilder';

// Create a type that extends TermsSettings and adds an index signature
export type IndexableTermsSettings = TermsSettings & Record<string, unknown>;

/**
 * Test case for terms (collections of mathematical terms)
 * Terms represent multiple term objects combined with operations
 */
export class TermsTestCase extends TestCase<IndexableTermsSettings> {
    constructor(settings: Partial<TermsSettings> = {}) {
        super('terms', settings as Partial<IndexableTermsSettings>);
        this.promptBuilder = new TermsPromptBuilder();
        this.nameBuilder = new TermsNameBuilder();
        this.idBuilder = new TermsIdBuilder();
        this.complexityBuilder = new TermsComplexityBuilder();
    }
} 



