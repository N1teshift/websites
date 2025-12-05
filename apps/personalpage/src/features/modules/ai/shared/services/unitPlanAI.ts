/**
 * @file UnitPlan AI Service - Context-aware content generation for educational unit plans
 * Leverages the existing LangGraph infrastructure for intelligent field generation
 */

import { UnitPlanData } from '@/features/modules/edtech/unitPlanGenerator/types/UnitPlanTypes';
import { getModelResponse } from './openaiResponsesClient';
import { ResponsesResult } from '@ai/types';
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Configuration options for UnitPlan AI generation
 */
export interface UnitPlanGenerationOptions {
  /** Temperature for AI generation (0-1) */
  temperature?: number;
  /** Maximum tokens for generation */
  maxTokens?: number;
  /** Specific model to use */
  model?: string;
  /** Whether to include detailed reasoning in output */
  includeReasoning?: boolean;
  /** Educational level considerations */
  educationalLevel?: 'primary' | 'middle' | 'secondary' | 'post-secondary';
}

/**
 * Context information extracted from UnitPlanData for AI generation
 */
interface GenerationContext {
  /** Subject area */
  subject: string;
  /** Academic year/level */
  academicYear: string;
  /** Selected concepts */
  specifiedConcepts: string[];
  /** Existing related content */
  relatedContent: Record<string, unknown>;
  /** Educational framework requirements */
  requirements: string[];
}

/**
 * UnitPlan AI Service
 * 
 * Provides context-aware AI generation for educational unit plan fields.
 * Leverages existing AI infrastructure while specializing in educational content.
 */
export class UnitPlanAIService {
  private logger = createComponentLogger('UnitPlanAI');

  /**
   * Generate content for a specific UnitPlan field using context from the entire unit plan
   */
  async generateFieldContent<K extends keyof UnitPlanData>(
    fieldName: K,
    unitPlanContext: Partial<UnitPlanData>,
    _options: UnitPlanGenerationOptions = {}
  ): Promise<UnitPlanData[K]> {
    this.logger.info(`Generating content for field: ${String(fieldName)}`, {
      fieldName,
      hasContext: !!unitPlanContext,
      contextKeys: Object.keys(unitPlanContext)
    });

    try {
      // Extract relevant context for this field
      const context = this.extractRelevantContext(fieldName, unitPlanContext);

      // Build context-aware prompt
      const prompt = this.buildContextualPrompt(fieldName, context, unitPlanContext);

      // Get field-specific system prompt
      const systemPrompt = this.getSystemPrompt(fieldName);

      // Get field-specific schema
      const schema = this.getFieldSchema(fieldName);

      // Add detailed logging for debugging
      this.logger.debug(`[UnitPlanAI] Context for ${String(fieldName)}:`, {
        context,
        unitPlanContextKeys: Object.keys(unitPlanContext),
        unitPlanContextSample: {
          subject: unitPlanContext.subject,
          unitTitle: unitPlanContext.unitTitle,
          specifiedConcepts: unitPlanContext.specifiedConcepts?.slice(0, 3), // Show first 3
          conceptualUnderstandings: unitPlanContext.conceptualUnderstandings?.substring(0, 100)
        }
      });

      this.logger.debug(`[UnitPlanAI] Prompt for ${String(fieldName)}:`, {
        prompt: prompt.substring(0, 500) + (prompt.length > 500 ? '...' : ''),
        promptLength: prompt.length,
        systemPrompt: systemPrompt.substring(0, 200) + (systemPrompt.length > 200 ? '...' : ''),
        schema
      });

      this.logger.debug(`Generated prompt for ${String(fieldName)}`, {
        promptLength: prompt.length,
        hasSchema: !!schema
      });

      // Use the exact same pattern as the working AIGenerateButton
      const response: ResponsesResult = await getModelResponse(
        prompt,
        {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 500,
          model: 'gpt-4o-mini',
          textFormat: 'text' // Use simple text instead of schema for now
        }
      );

      // Extract and format the response for the specific field
      const fieldValue = this.extractFieldValue(response, fieldName);

      this.logger.info(`Successfully generated content for ${String(fieldName)}`, {
        responseLength: typeof fieldValue === 'string' ? fieldValue.length : 'array/object'
      });

      return fieldValue;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate content for ${String(fieldName)}`, error instanceof Error ? error : new Error(errorMessage));
      throw new Error(`Failed to generate content for ${String(fieldName)}: ${errorMessage}`);
    }
  }

  /**
   * Generate content for multiple related fields in a single context-aware pass
   */
  async generateMultipleFields(
    fieldNames: (keyof UnitPlanData)[],
    unitPlanContext: Partial<UnitPlanData>,
    _options: UnitPlanGenerationOptions = {}
  ): Promise<Partial<UnitPlanData>> {
    this.logger.info(`Generating multiple fields`, {
      fieldNames: fieldNames.map(String),
      fieldCount: fieldNames.length
    });

    const results: Partial<UnitPlanData> = {};

    // For now, generate sequentially (can be optimized to batch later)
    for (const fieldName of fieldNames) {
      try {
        const content = await this.generateFieldContent(fieldName, unitPlanContext, _options);
        if (content !== undefined) {
          // TypeScript workaround for dynamic key assignment
          (results as Record<string, UnitPlanData[keyof UnitPlanData]>)[String(fieldName)] = content;
        }
      } catch (error) {
        this.logger.warn(`Failed to generate ${String(fieldName)}, continuing with other fields`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return results;
  }

  /**
   * Extract relevant context for a specific field from the unit plan data
   */
  private extractRelevantContext(
    fieldName: keyof UnitPlanData,
    unitPlan: Partial<UnitPlanData>
  ): GenerationContext {
    // Define field dependencies - what other fields are relevant for generating this field
    const fieldDependencies: Record<string, (keyof UnitPlanData)[]> = {
      conceptualUnderstandings: ['subject', 'specifiedConcepts', 'unitTitle'],
      globalContext: ['subject', 'specifiedConcepts', 'conceptualUnderstandings'],
      inquiryStatement: ['conceptualUnderstandings', 'globalContext', 'specifiedConcepts'],
      factualQuestions: ['inquiryStatement', 'specifiedConcepts', 'conceptualUnderstandings'],
      conceptualQuestions: ['conceptualUnderstandings', 'inquiryStatement', 'specifiedConcepts'],
      debatableQuestions: ['conceptualUnderstandings', 'inquiryStatement', 'globalContext'],
      objectives: ['subject', 'specifiedConcepts', 'conceptualUnderstandings', 'inquiryStatement'],
      assessmentTitle: ['unitTitle', 'objectives', 'conceptualUnderstandings'],
      summativeAssessment: ['objectives', 'assessmentTitle', 'conceptualUnderstandings'],
      commandTerms: ['objectives', 'assessmentTitle', 'summativeAssessment'],
      individualContext: ['globalContext', 'subject', 'specifiedConcepts'],
      localContext: ['globalContext', 'individualContext', 'subject'],
      globalContextLens: ['globalContext', 'localContext', 'individualContext'],
      atlSkills: ['subject', 'objectives', 'conceptualUnderstandings'],
      atlStrategies: ['atlSkills', 'objectives', 'subject'],
      // Lesson-specific fields would need the broader unit context
    };

    const relevantFields = fieldDependencies[String(fieldName)] || ['subject', 'unitTitle'];

    const relatedContent: Record<string, unknown> = {};
    relevantFields.forEach(field => {
      if (unitPlan[field] !== undefined) {
        relatedContent[String(field)] = unitPlan[field];
      }
    });

    return {
      subject: unitPlan.subject || '',
      academicYear: unitPlan.academicYear || '',
      specifiedConcepts: unitPlan.specifiedConcepts || [],
      relatedContent,
      requirements: this.getEducationalRequirements(String(fieldName), unitPlan.subject)
    };
  }

  /**
   * Build a context-aware prompt for a specific field
   */
  private buildContextualPrompt(
    fieldName: keyof UnitPlanData,
    context: GenerationContext,
    _unitPlan: Partial<UnitPlanData>
  ): string {
    const basePrompt = `You are an expert educational content designer creating content for a ${context.subject} unit plan.

UNIT PLAN CONTEXT:
${JSON.stringify(context.relatedContent, null, 2)}

FIELD TO GENERATE: ${String(fieldName)}

EDUCATIONAL REQUIREMENTS:
${context.requirements.join('\n')}

INSTRUCTIONS:
Generate appropriate content for the "${String(fieldName)}" field that:
1. Aligns with the subject area (${context.subject})
2. Builds upon the existing context provided above
3. Meets educational standards and best practices
4. Is age-appropriate for the academic year (${context.academicYear})
5. Connects meaningfully with the specified concepts: ${context.specifiedConcepts.join(', ')}

Please provide content that is clear, educationally sound, and directly relevant to the unit plan context.`;

    return basePrompt;
  }

  /**
   * Get field-specific system prompt
   */
  private getSystemPrompt(fieldName: keyof UnitPlanData): string {
    const systemPrompts: Record<string, string> = {
      conceptualUnderstandings: `You are an expert in curriculum design. Generate conceptual understanding statements that articulate the big ideas and enduring principles students should grasp. Focus on transferable concepts that go beyond factual knowledge.`,

      globalContext: `You are an expert in global education frameworks. Generate global context descriptions that connect learning to real-world, international perspectives and help students understand global significance.`,

      inquiryStatement: `You are an expert in inquiry-based learning. Generate inquiry statements that frame the unit around investigable questions that promote critical thinking and student-driven learning.`,

      factualQuestions: `You are an expert in educational assessment. Generate factual questions that test students' knowledge of specific information, dates, definitions, and concrete details related to the unit content.`,

      conceptualQuestions: `You are an expert in higher-order thinking. Generate conceptual questions that require students to analyze relationships, compare and contrast ideas, and demonstrate understanding of underlying principles.`,

      debatableQuestions: `You are an expert in critical thinking education. Generate debatable questions that have multiple valid perspectives, encourage argumentation, and develop students' ability to consider complex issues.`,

      objectives: `You are an expert in learning objectives and curriculum standards. Generate specific, measurable learning objectives that clearly define what students will know and be able to do.`,

      atlSkills: `You are an expert in Approaches to Learning (ATL) skills. Generate appropriate ATL skills that align with the unit content and promote metacognitive development.`,

      atlStrategies: `You are an expert in learning strategies. Generate specific, actionable strategies that help students develop the selected ATL skills within the context of the unit.`,
    };

    return systemPrompts[String(fieldName)] || `You are an expert educational content designer. Generate appropriate content for the ${String(fieldName)} field of a unit plan.`;
  }

  /**
   * Get field-specific JSON schema for structured output
   */
  private getFieldSchema(fieldName: keyof UnitPlanData): Record<string, unknown> {
    // Define schemas for different field types
    const stringFieldSchema = {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: `Generated content for ${String(fieldName)}`
        }
      },
      required: ["content"]
    };

    const arrayFieldSchema = {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: {
            type: "string"
          },
          description: `Generated list items for ${String(fieldName)}`
        }
      },
      required: ["items"]
    };

    // Map fields to their expected types
    const arrayFields = [
      'specifiedConcepts', 'keyConcepts', 'relatedConcepts', 'factualQuestions', 'conceptualQuestions',
      'debatableQuestions', 'objectives', 'commandTerms', 'atlSkills',
      'contributingTeachers'
    ];

    return arrayFields.includes(String(fieldName)) ? arrayFieldSchema : stringFieldSchema;
  }

  /**
   * Extract the appropriate value from the AI response for the specific field
   */
  private extractFieldValue<K extends keyof UnitPlanData>(
    response: ResponsesResult,
    fieldName: K
  ): UnitPlanData[K] {
    // For now, just return the raw text response
    // This matches how the working AIGenerateButton handles responses
    const content = response.output_text || '';

    // Handle array fields by splitting on common delimiters
    const arrayFields = [
      'specifiedConcepts', 'keyConcepts', 'relatedConcepts', 'factualQuestions', 'conceptualQuestions',
      'debatableQuestions', 'objectives', 'commandTerms', 'atlSkills',
      'contributingTeachers'
    ];

    if (arrayFields.includes(String(fieldName))) {
      // Split on newlines or numbered lists and clean up
      const items = content
        .split(/\n|[0-9]+\./)
        .map(item => item.trim())
        .filter(item => item.length > 0 && !item.match(/^[0-9]+$/))
        .slice(0, 10); // Limit to reasonable number

      return items as UnitPlanData[K];
    }

    // Handle string fields - return the content directly
    return content as UnitPlanData[K];
  }

  /**
   * Get educational requirements for a specific field and subject
   */
  private getEducationalRequirements(fieldName: string, _subject?: string): string[] {
    const baseRequirements = [
      "Content must be age-appropriate and developmentally suitable",
      "Must align with international educational standards",
      "Should promote critical thinking and student engagement",
      "Must be inclusive and culturally sensitive"
    ];

    const fieldSpecificRequirements: Record<string, string[]> = {
      conceptualUnderstandings: [
        "Must articulate transferable big ideas",
        "Should connect to real-world applications",
        "Must go beyond factual knowledge to principles"
      ],
      inquiryStatement: [
        "Must be open-ended and investigable",
        "Should promote student-driven learning",
        "Must be relevant to student interests and experiences"
      ],
      objectives: [
        "Must be specific, measurable, and observable",
        "Should align with curriculum standards",
        "Must include appropriate action verbs for the cognitive level"
      ]
    };

    return [...baseRequirements, ...(fieldSpecificRequirements[fieldName] || [])];
  }
}

// Export singleton instance
export const unitPlanAI = new UnitPlanAIService();



