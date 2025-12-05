import { IntervalSettings } from '../../types/mathObjectSettingsInterfaces';
import { TestCase } from './TestCase';
import { IntervalPromptBuilder } from '../utils/builders/prompt/IntervalPromptBuilder';
import { IntervalNameBuilder } from '../utils/builders/name/IntervalNameBuilder';
import { IntervalIdBuilder } from '../utils/builders/id/IntervalIdBuilder';
import { IntervalComplexityBuilder } from '../utils/builders/complexity/IntervalComplexityBuilder';

// Create a type that extends IntervalSettings and adds an index signature
export type IndexableIntervalSettings = IntervalSettings & Record<string, unknown>;

/**
 * Test case for mathematical intervals
 * Intervals represent a range of values between two endpoints, with various inclusion/exclusion options
 */
export class IntervalTestCase extends TestCase<IndexableIntervalSettings> {
    constructor(settings: Partial<IntervalSettings> = {}) {
        super('interval', settings as Partial<IndexableIntervalSettings>);
        this.promptBuilder = new IntervalPromptBuilder();
        this.nameBuilder = new IntervalNameBuilder();
        this.idBuilder = new IntervalIdBuilder();
        this.complexityBuilder = new IntervalComplexityBuilder();
    }
} 



