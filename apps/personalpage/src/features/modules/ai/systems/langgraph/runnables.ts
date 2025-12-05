/**
 * @file Defines Langchain Runnables for AI tasks like type identification and settings extraction,
 * replacing the legacy custom chain implementations.
 * Utilizes Zod for schema definition and validation of LLM outputs.
 */

// Contains the LangChain Runnables replacing the old custom chains
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { typeIdentifierPrompt } from "../../shared/prompts/typeIdentifier/prompt"; // Import the prompt content
import { ObjectType } from "@math/types/mathTypes"; // Import ObjectType
import { getObjectTypeSystemPrompt } from "../../shared/utils/promptUtils"; // Import system prompt utility
import { validateObjectSettings } from "../../shared/validation/settingsValidator"; // Import validator
import { createComponentLogger } from '@websites/infrastructure/logging';

/**
 * Zod schema for the output of the Type Identifier Runnable.
 * Ensures the LLM returns a valid `ObjectType`.
 */
const TypeIdentifierOutputSchema = z.object({
  objectType: z.enum([
    "coefficient",
    "coefficients",
    "term",
    "terms",
    "expression",
    "equation",
    "inequality",
    "function",
    "point",
    "set",
    "interval",
  ]).describe("The identified type of mathematical object"),
});

/**
 * Input interface for the Type Identifier Runnable.
 */
interface TypeIdentifierInput {
  /** The user's natural language prompt. */
  userPrompt: string;
}

/**
 * Creates a LangChain Runnable sequence for identifying the mathematical object type
 * from a user prompt.
 * @returns {RunnableSequence<TypeIdentifierInput, z.infer<typeof TypeIdentifierOutputSchema>>} A Langchain Runnable sequence.
 */
export function createTypeIdentifierRunnable() {
  // 1. Define an enhanced prompt template that includes JSON format instructions
  // Note: Using double braces {{ }} to escape them in the template
  const jsonInstructedPrompt = `${typeIdentifierPrompt}

You must respond with a JSON object containing a single key "objectType" with one of these values: coefficient, coefficients, term, terms, expression, equation, inequality, function, point, set, interval.

Example response format:
{{"objectType": "coefficient"}}`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", jsonInstructedPrompt],
    ["human", "{userPrompt}"],
  ]);

  // 2. Define the LLM
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const model = process.env.OPENAI_DEFAULT_MODEL || "gpt-5-nano";
  const llmConfig: { model: string; apiKey: string; temperature?: number; modelKwargs?: Record<string, unknown> } = {
    model,
    apiKey,
  };
  
  // Only set temperature if model supports it (not gpt-5-nano)
  if (!model.includes('gpt-5-nano')) {
    llmConfig.temperature = 0;
  }
  
  // Use JSON mode
  llmConfig.modelKwargs = {
    response_format: { type: "json_object" }
  };
  
  const llm = new ChatOpenAI(llmConfig);

  // 3. Create a parser that validates the JSON output against our schema
  const parser = new RunnableLambda({
    func: async (output: { content: string }) => {
      const logger = createComponentLogger('TypeIdentifierParser');
      
      try {
        // Parse the JSON string
        const parsed = JSON.parse(output.content);
        logger.info('Parsed JSON output', { parsed });
        
        // Validate against Zod schema
        const validated = TypeIdentifierOutputSchema.parse(parsed);
        logger.info('Validation successful', { validated });
        
        return validated;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to parse or validate output: ${errorMessage}. Content: ${output.content.substring(0, 200)}`);
        throw error;
      }
    }
  });

  // 4. Create the runnable sequence
  const chain = RunnableSequence.from<TypeIdentifierInput, z.infer<typeof TypeIdentifierOutputSchema>>([
    prompt,
    llm,
    parser as any,
  ]);

  return chain;
}

// --- Settings Extractor Schemas and Runnable Factory ---

/**
 * **Source of Truth:** This Zod schema is the canonical definition for `CoefficientSettings`.
 * Legacy JSON schemas in `src/features/infrastructure/ai/schemas/mathObjects/coefficient.ts`
 * are maintained only for deprecated code and should be removed when the legacy chain is removed.
 */
const CoefficientSettingsSchema = z.object({
  numberSet: z.enum(["real", "rational", "irrational", "integer", "natural"]),
  representationType: z.enum(["fraction", "mixed", "decimal", "root", "logarithm"]),
  rules: z.array(z.enum(["odd", "even", "square", "cube", "prime", "nonzero", "positive", "negative", "unit"])),
  range: z.array(z.number()).refine(data => data.length === 2, {
    message: "Range must contain exactly two numbers [min, max]",
  }),
}).describe("Settings for a single coefficient object");

/**
 * **Source of Truth:** This Zod schema is the canonical definition for `CoefficientsSettings`.
 * Legacy JSON schemas in `src/features/infrastructure/ai/schemas/mathObjects/coefficients.ts`
 * are maintained only for deprecated code and should be removed when the legacy chain is removed.
 *
 * Focuses on collection-level rules and identifying sub-prompts for individual coefficients.
 * NOTE: This schema only includes rules for the *collection* and the sub-prompts.
 * The actual individual coefficient settings are handled by subsequent calls.
 */
const CoefficientsSettingsSchema = z.object({
  collectionCount: z.number().describe("The number of coefficients expected in the collection (e.g., based on the parent term's requirements)."),
  rules: z.array(z.enum(["increasing", "decreasing", "neq"])).describe("Rules that apply to the collection of coefficients"),
  subObjectPromptParts: z.array(z.string()).describe("Specific parts of the original user prompt that describe the sub-objects (individual coefficients)."),
}).describe("Settings for the coefficients collection");

/**
 * **Source of Truth:** This Zod schema is the canonical definition for `TermSettings`.
 * Legacy JSON schemas in `src/features/infrastructure/ai/schemas/mathObjects/term.ts`
 * are maintained only for deprecated code and should be removed when the legacy chain is removed.
 */
const TermSettingsSchema = z.object({
  power: z.array(z.number()).refine(data => data.length === 2, {
    message: "Power format [power, root], e.g., [3, 1] for x³, [1, 2] for √x. Must be an array of two numbers.",
  }),
  termIds: z.array(z.string()).describe("Array of string numbers representing the order and the position of the subterms in the polynomial."),
  powerOrder: z.boolean().describe("Order of operations: true if power is applied before coefficient multiplication, false otherwise."),
  variableName: z.string().describe("The variable symbol used in the term (e.g., x, y)"),
  subObjectPromptParts: z.array(z.string()).describe("Specific parts of the user prompt that describe the coefficients collection and its individual coefficients."),
}).describe("Settings for a polynomial term object");

/**
 * Union type representing all possible validated settings structures
 * that can be output by the settings extractor runnable.
 */
type SettingsSchemaType = 
  | z.infer<typeof CoefficientSettingsSchema>
  | z.infer<typeof CoefficientsSettingsSchema>
  | z.infer<typeof TermSettingsSchema>
  | Record<string, unknown>; // For placeholder schemas

/** 
 * @internal 
 * Mapping from `ObjectType` to its corresponding Zod schema used for structured LLM output 
 * and validation in the settings extractor.
 * System 2 (LangGraph) only supports: coefficient, coefficients, term
 * All other types are unsupported and will be rejected by validation before reaching here.
 */
const settingsSchemaMap: Partial<Record<ObjectType, z.ZodType<unknown>>> = {
  coefficient: CoefficientSettingsSchema,
  coefficients: CoefficientsSettingsSchema,
  term: TermSettingsSchema,
  // All other types are unsupported - validation will reject them before reaching here
};

/**
 * Input interface for the Settings Extractor Runnable.
 */
interface SettingsExtractorRunnableInput {
  /** The user's natural language prompt. */
  userPrompt: string;
  // We don't pass objectType here, as the factory selects the schema
  // Context might be added later if needed by the prompt itself
}

/**
 * Factory function to create a LangChain Runnable sequence for extracting structured settings
 * for a *specific* mathematical object type.
 * @param {ObjectType} objectType - The type of object for which to create the settings extractor.
 * @returns {RunnableSequence<SettingsExtractorRunnableInput, SettingsSchemaType>} A Langchain Runnable sequence tailored for the specified object type.
 * @throws {Error} If no Zod schema is defined in `settingsSchemaMap` for the given `objectType`.
 */
export function createSettingsExtractorRunnable(objectType: ObjectType) {
  // 1. Get the specific system prompt for this object type
  const baseSystemPrompt = getObjectTypeSystemPrompt(objectType);

  // 2. Get the specific Zod schema for this object type
  const schema = settingsSchemaMap[objectType];
  if (!schema) {
    // This should not happen if validation is working correctly, but fail fast if it does
    throw new Error(
      `No settings schema defined for object type: ${objectType}. ` +
      `System 2 (LangGraph) only supports 'coefficient', 'coefficients', and 'term'.`
    );
  }

  // 3. Enhance the prompt to include JSON format instructions
  const jsonInstructedPrompt = `${baseSystemPrompt}

You must respond with a valid JSON object. Ensure your response can be parsed as JSON.`;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", jsonInstructedPrompt],
    ["human", "{userPrompt}"],
  ]);

  // 4. Define the LLM with JSON mode
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const model = process.env.OPENAI_DEFAULT_MODEL || "gpt-5-nano";
  const llmConfig: { model: string; apiKey: string; temperature?: number; modelKwargs?: Record<string, unknown> } = {
    model,
    apiKey,
  };
  
  // Only set temperature if model supports it (not gpt-5-nano)
  if (!model.includes('gpt-5-nano')) {
    llmConfig.temperature = 0;
  }
  
  // Use JSON mode
  llmConfig.modelKwargs = {
    response_format: { type: "json_object" }
  };
  
  const llm = new ChatOpenAI(llmConfig);

  // 5. Create a parser that parses JSON and validates against schema
  const parser = new RunnableLambda({
    func: async (output: { content: string }) => {
      const logger = createComponentLogger('SettingsExtractorParser', objectType);
      
      try {
        // Parse the JSON string
        const parsed = JSON.parse(output.content);
        logger.info(`Parsed JSON output for ${objectType}`, { parsed });
        
        // Validate against Zod schema
        const validated = schema.parse(parsed);
        logger.info(`Zod validation successful for ${objectType}`, { validated });
        
        // Run additional validation
        const finalValidated = validateObjectSettings(validated, objectType);
        logger.info(`Final validation successful for ${objectType}`);
        
        return finalValidated;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to parse or validate ${objectType} settings: ${errorMessage}. Content: ${output.content.substring(0, 200)}`);
        throw error;
      }
    }
  });

  // 6. Create the final runnable sequence
  const chain = RunnableSequence.from([
    prompt,
    llm,
    parser as any,
  ]);

  return chain as RunnableSequence<SettingsExtractorRunnableInput, SettingsSchemaType>;
}

/**
 * @todo Implement this factory function.
 * It should likely provide a way to get the appropriate settings extractor runnable
 * based on an object type determined dynamically, perhaps integrating with the type identifier.
 */
export function createSettingsExtractorRunnableFactory() {
  // Implementation will go here
} 



