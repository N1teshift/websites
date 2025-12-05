import { CoefficientsSettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from '../cases/TestCase';
import { CoefficientsPromptBuilder } from '../utils/builders/prompt/CoefficientsPromptBuilder';
import { CoefficientsNameBuilder } from '../utils/builders/name/CoefficientsNameBuilder';
import { CoefficientsIdBuilder } from '../utils/builders/id/CoefficientsIdBuilder';
import { CoefficientsComplexityBuilder } from '../utils/builders/complexity/CoefficientsComplexityBuilder';

// Create a type that extends CoefficientsSettings and adds an index signature
export type IndexableCoefficientsSettings = CoefficientsSettings & Record<string, unknown>;

export class CoefficientsTestCase extends TestCase<IndexableCoefficientsSettings> {
    constructor(settings: Partial<CoefficientsSettings> = {}) {
        super('coefficients', settings as Partial<IndexableCoefficientsSettings>);
        this.promptBuilder = new CoefficientsPromptBuilder();
        this.nameBuilder = new CoefficientsNameBuilder();
        this.idBuilder = new CoefficientsIdBuilder();
        this.complexityBuilder = new CoefficientsComplexityBuilder();
    }
} 



