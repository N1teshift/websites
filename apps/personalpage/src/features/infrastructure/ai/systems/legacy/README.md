# Legacy Chain System

**Status**: 📚 Preserved as Example/Memory

This folder contains the first generation AI system for mathematical object generation, using a custom chain-based architecture.

## Architecture

The legacy system uses a custom chain pattern with:
- **BaseChain**: Abstract base class for all chains
- **TypeIdentifierChain**: Identifies the mathematical object type from user prompts
- **SettingsExtractorChain**: Extracts structured settings for identified object types
- **MathObjectGenerator**: Main orchestrator class that coordinates chains

## Key Characteristics

- Custom chain-based architecture (not using LangChain)
- Sequential execution: Type identification → Settings extraction → Validation
- Recursive processing for nested objects (e.g., terms containing coefficients)
- Test case validation support

## Usage

This system is preserved for reference and can be activated by setting `USE_LANGGRAPH = false` in `core/objectGeneration.ts`.

## Files

- `chains/` - Chain implementations (BaseChain, TypeIdentifierChain, SettingsExtractorChain)
- `MathObjectGenerator.ts` - Main orchestrator class

## Dependencies

- Uses shared resources from `../../shared/`:
  - Schemas for validation
  - Prompts for LLM interactions
  - Validation logic
  - Services (OpenAI client)
  - Utils (token tracking, prompt utilities)

