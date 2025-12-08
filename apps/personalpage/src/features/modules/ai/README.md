# AI Feature Collection

- **Type**: Collection
- **Purpose**: Shared AI infrastructure and multiple generation systems for mathematical object creation
- **Status**: Restructured to support multiple AI systems (legacy, LangGraph, and modern)

## Structure

### Core Orchestration

- `core/` - Main facade/router (`objectGeneration.ts`) that routes to appropriate system
- `types.ts` - Central type definitions
- `index.ts` - Public API exports

### Shared Resources (`shared/`)

Resources used by all AI systems:

- `schemas/` - Zod schemas for AI payloads and validation
- `prompts/` - Prompt templates and builders
- `validation/` - Guardrails for AI settings
- `services/` - Integration code for OpenAI, Azure, etc.
- `utils/` - Shared helpers (token tracking, prompt utilities)
- `constants/` - Configuration constants

### AI Systems (`systems/`)

Each system is self-contained and preserved for reference:

#### `systems/legacy/` - Legacy Chain System

- **Status**: 📚 Preserved as Example/Memory
- Custom chain-based architecture
- See `systems/legacy/README.md` for details

#### `systems/langgraph/` - LangGraph System

- **Status**: ✅ Active (Currently in Use)
- LangGraph StateGraph workflow
- See `systems/langgraph/README.md` for details

#### `systems/modern/` - Modern System

- **Status**: 🚧 To be implemented
- Future system leveraging latest AI technology
- See `systems/modern/README.md` for details

## Usage

The main entry point is `generateSettings()` from `core/objectGeneration.ts`, which routes to the active system based on configuration.

```typescript
import { generateSettings } from "@ai/core/objectGeneration";

const result = await generateSettings("a quadratic equation with positive coefficients");
```

## System Selection

The active system is controlled by the `USE_LANGGRAPH` flag in `core/objectGeneration.ts`:

- `true` → LangGraph system (current default)
- `false` → Legacy chain system

## Adding a New System

1. Create implementation in `systems/modern/`
2. Add entry function similar to `invokeMathObjectGenerator()`
3. Update `core/objectGeneration.ts` to include new system option
4. Add README documenting the system architecture

## System Limitations

Both System 1 (Legacy) and System 2 (LangGraph) have limitations on which object types they can process. See `SYSTEM_LIMITATIONS.md` for detailed information.

### Checking System Capabilities

Use the utility functions to check if a system supports a given object type:

```typescript
import { canProcessObjectType, getObjectTypeCapability } from "@ai";

// Simple check
if (canProcessObjectType("legacy", "coefficient")) {
  // System 1 can process coefficients
}

// Detailed information
const capability = getObjectTypeCapability("langgraph", "inequality");
if (capability.canProcess) {
  console.log(`Support level: ${capability.supportLevel}`);
  console.log(`Reason: ${capability.reason}`);
}
```

### Supported Object Types

**Fully Supported (Both Systems):**

- `coefficient`
- `coefficients`
- `term`

**Partially Supported:**

- `expression` (incomplete validation)
- `equation` (incomplete validation)
- `terms` (incomplete schemas)

**Not Recommended:**

- `inequality`, `function`, `point`, `set`, `interval` (placeholder implementations)
