import { CoefficientSettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from './TestCase';
import { CoefficientPromptBuilder } from '../utils/builders/prompt/CoefficientPromptBuilder';
import { CoefficientNameBuilder } from '../utils/builders/name/CoefficientNameBuilder';
import { CoefficientIdBuilder } from '../utils/builders/id/CoefficientIdBuilder';
import { CoefficientComplexityBuilder } from '../utils/builders/complexity/CoefficientComplexityBuilder';

export class CoefficientTestCase extends TestCase<CoefficientSettings> {
    constructor(settings: Partial<CoefficientSettings> = {}) {
        super('coefficient', settings);
        this.promptBuilder = new CoefficientPromptBuilder();
        this.nameBuilder = new CoefficientNameBuilder();
        this.idBuilder = new CoefficientIdBuilder();
        this.complexityBuilder = new CoefficientComplexityBuilder();
    }
}



