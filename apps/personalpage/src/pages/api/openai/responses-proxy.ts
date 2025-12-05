import { createPostHandler } from '@/features/infrastructure/api/routeHandlers';
import { openaiService } from '@/features/infrastructure/api/openai/openaiService';

/**
 * Refactored OpenAI responses proxy using centralized API pattern
 * 
 * This demonstrates how to use the new route handlers and service layers
 * to separate HTTP handling from business logic.
 */
export default createPostHandler(
  async (req, _res) => {
    const { 
      prompt,
      userPrompt,
      temperature,
      maxTokens,
      model,
      systemPrompt,
      textFormat,
      schema,
      messages
    } = req.body;
    
    // Use prompt if provided, otherwise fall back to userPrompt for backward compatibility
    const finalPrompt = prompt || userPrompt;
    
    // Business logic is now handled by the service layer
    const response = await openaiService.processResponse(finalPrompt, undefined, {
      temperature,
      maxTokens,
      model,
      systemPrompt,
      textFormat,
      schema,
      messages
    });
    
    return response;
  },
  {
    validateBody: openaiService.validateRequest,
    logRequests: true
  }
);



