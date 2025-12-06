import { NextApiRequest, NextApiResponse } from 'next';
import { generateSettings } from '@ai/core/objectGeneration';
import { createComponentLogger } from '@websites/infrastructure/logging';
import { createApiHandler } from '@/lib/api';

const logger = createComponentLogger('GenerateSettingsAPI');

/**
 * API route handler for generating math object settings from a user prompt.
 * 
 * This endpoint runs on the server where OPENAI_API_KEY is available.
 * 
 * @param req - The API request containing the prompt in the body
 * @param res - The API response
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body as { prompt?: string; system?: 'legacy' | 'langgraph' };
  const { prompt, system } = body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required and must be a string'
    });
  }

  const aiSystem = system || 'langgraph'; // Default to langgraph

  try {
    logger.info('Generating settings for prompt', { prompt: prompt.substring(0, 100), system: aiSystem });
    const result = await generateSettings(prompt, aiSystem);

    logger.info('Settings generated successfully', {
      objectCount: result.objects?.length || 0,
      tokenUsage: result.usage
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error('Error generating settings', error instanceof Error ? error : new Error(errorMessage));
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
}

export default createApiHandler(handler, {
  methods: ['POST'],
  requireAuth: false,
  validateBody: (body: unknown) => {
    if (!body || typeof body !== 'object') {
      return 'Request body is required';
    }
    const bodyObj = body as { prompt?: unknown; system?: unknown };
    if (!bodyObj.prompt || typeof bodyObj.prompt !== 'string') {
      return 'Prompt is required and must be a string';
    }
    if (bodyObj.prompt.trim().length === 0) {
      return 'Prompt cannot be empty';
    }
    if (bodyObj.system !== undefined && bodyObj.system !== 'legacy' && bodyObj.system !== 'langgraph') {
      return 'System must be either "legacy" or "langgraph"';
    }
    return true;
  }
});




