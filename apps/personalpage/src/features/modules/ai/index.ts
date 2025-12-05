/**
 * @file AI Features Index - Central exports for AI functionality
 */

// Re-export AI services
export { unitPlanAI, UnitPlanAIService } from './shared/services/unitPlanAI';
export type { UnitPlanGenerationOptions } from './shared/services/unitPlanAI';

// Re-export existing services  
export { getModelResponse, getModelResponseWithSchema } from './shared/services/openaiResponsesClient';

// Re-export types
export type { 
  ResponsesConfig, 
  ResponsesResult, 
  OpenAIApiUsage 
} from './types';

// Re-export core functionality
export { generateSettings } from './core/objectGeneration';
export { invokeMathObjectGenerator } from './systems/langgraph/invokeGraph';

// Re-export system capabilities utilities
export {
  getObjectTypeCapability,
  canProcessObjectType,
  getSupportedObjectTypes,
  getUnsupportedObjectTypes,
  getSystemCapabilitySummary,
  type SupportLevel,
  type AISystem as SystemCapabilityAISystem,
  type ObjectTypeCapability
} from './shared/utils/systemCapabilities';



