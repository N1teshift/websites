# LangGraph System

**Status**: ✅ Active (Currently in Use)

This folder contains the second generation AI system for mathematical object generation, using LangGraph StateGraph workflow.

## Architecture

The LangGraph system uses:

- **StateGraph**: LangGraph workflow engine for state management
- **Runnables**: LangChain runnables for type identification and settings extraction
- **Nodes**: Graph nodes for identification, processing, and completion
- **Conditionals**: Routing logic for graph flow control

## Key Characteristics

- LangGraph StateGraph workflow
- Node-based processing with state management
- Recursive processing via context stack
- Token usage tracking via callback handlers
- Zod schema validation

## Current Status

This is the **active system** (USE_LANGGRAPH = true in `core/objectGeneration.ts`).

## Files

- `graph.ts` - StateGraph configuration and compilation
- `invokeGraph.ts` - Entry point function
- `state.ts` - State type definitions
- `runnables.ts` - LangChain runnables (type identifier, settings extractor)
- `nodes/` - Graph node implementations:
  - `identificationNodes.ts` - Object type identification
  - `processingNodes.ts` - Settings extraction and recursion
  - `completionNodes.ts` - Finalization and error handling
- `conditionals.ts` - Conditional routing logic
- `helpers.ts` - Helper functions
- `tokenHandler.ts` - Token usage callback handler

## Dependencies

- Uses shared resources from `../../shared/`:
  - Schemas for validation
  - Prompts for LLM interactions
  - Validation logic
  - Services (OpenAI client)
  - Utils (token tracking, prompt utilities)
  - Constants

## Entry Point

`invokeMathObjectGenerator(userPrompt: string)` - Called from `core/objectGeneration.ts`
