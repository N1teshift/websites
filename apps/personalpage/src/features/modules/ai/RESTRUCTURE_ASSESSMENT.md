# AI Folder Restructure Assessment

## Current State Analysis

### Two Existing Systems

#### System 1: Legacy Chain System

**Location**: `chains/` + `core/MathObjectGenerator.ts`

**Components**:

- `chains/BaseChain.ts` - Base chain class
- `chains/TypeIdentifierChain.ts` - Type identification chain
- `chains/SettingsExtractorChain.ts` - Settings extraction chain
- `core/MathObjectGenerator.ts` - Main orchestrator class (636 lines)

**Characteristics**:

- Custom chain-based architecture
- Uses `BaseChain` pattern
- Orchestrated by `MathObjectGenerator` class
- Deprecated but still functional

**Entry Point**: `generateSettingsUsingLegacy()` in `core/objectGeneration.ts`

---

#### System 2: LangGraph System

**Location**: `lang/` folder

**Components**:

- `lang/graph.ts` - StateGraph configuration
- `lang/invokeGraph.ts` - Entry point function
- `lang/state.ts` - State management
- `lang/runnables.ts` - LangChain runnables (type identifier, settings extractor)
- `lang/nodes/` - Graph nodes:
  - `identificationNodes.ts`
  - `processingNodes.ts`
  - `completionNodes.ts`
- `lang/conditionals.ts` - Conditional routing
- `lang/helpers.ts` - Helper functions
- `lang/tokenHandler.ts` - Token tracking

**Characteristics**:

- LangGraph StateGraph workflow
- Uses LangChain runnables
- Node-based processing
- Currently active (USE_LANGGRAPH = true)

**Entry Point**: `invokeMathObjectGenerator()` in `lang/invokeGraph.ts`

---

### Shared Resources (Used by Both Systems)

#### Schemas (`schemas/`)

- `mathInput.ts` - Core MathInput schema
- `objectType.ts` - ObjectType definitions
- `baseSettingsExtractorSchema.ts` - Base schema
- `mathObjects/` - Type-specific schemas (coefficient, term, expression, etc.)

**Usage**: Both systems use these for validation and type definitions

---

#### Prompts (`prompts/`)

- `systemPrompts/` - System prompts for each object type
- `typeIdentifier/prompt.ts` - Type identification prompt

**Usage**: Both systems reference these prompts

---

#### Validation (`validation/`)

- `settingsValidator.ts` - Settings validation
- `structureValidator.ts` - Structure validation
- `typeGuards.ts` - Type guards
- `valueValidator.ts` - Value validation

**Usage**: Both systems use validation logic

---

#### Services (`services/`)

- `openaiResponsesClient.ts` - OpenAI API client (used by LangGraph runnables)
- `unitPlanAI.ts` - Unit plan generation service

**Usage**: Shared API clients

---

#### Utils (`utils/`)

- `promptUtils.ts` - Prompt utilities (used by both)
- `tokenUtils.ts` - Token tracking utilities (shared)

**Usage**: Shared helper functions

---

#### Types (`types.ts`)

- Central type definitions
- Used across all systems

---

#### Constants (`constants/`)

- Shared configuration constants

---

### Current Orchestration

**File**: `core/objectGeneration.ts`

- Acts as facade/router
- Contains `USE_LANGGRAPH` flag (currently `true`)
- Routes to either:
  - `generateSettingsUsingLangGraph()` → `invokeMathObjectGenerator()`
  - `generateSettingsUsingLegacy()` → `MathObjectGenerator.generate()`

---

## Proposed Restructure

### Recommended Structure

```
src/features/infrastructure/ai/
├── README.md
├── index.ts                          # Main exports
├── types.ts                          # Shared types
│
├── shared/                           # Shared resources
│   ├── schemas/                      # Zod schemas (moved from root)
│   ├── prompts/                      # Prompt templates (moved from root)
│   ├── validation/                   # Validation logic (moved from root)
│   ├── services/                     # API clients (moved from root)
│   ├── utils/                        # Utilities (moved from root)
│   └── constants/                    # Constants (moved from root)
│
├── systems/                          # AI generation systems
│   ├── legacy/                       # System 1: Legacy Chain System
│   │   ├── README.md                 # Documentation explaining the system
│   │   ├── chains/                   # Moved from root chains/
│   │   │   ├── BaseChain.ts
│   │   │   ├── TypeIdentifierChain.ts
│   │   │   ├── SettingsExtractorChain.ts
│   │   │   └── index.ts
│   │   └── MathObjectGenerator.ts    # Moved from core/MathObjectGenerator.ts
│   │
│   ├── langgraph/                    # System 2: LangGraph System
│   │   ├── README.md                 # Documentation explaining the system
│   │   ├── graph.ts                  # Moved from lang/graph.ts
│   │   ├── invokeGraph.ts            # Moved from lang/invokeGraph.ts
│   │   ├── state.ts                  # Moved from lang/state.ts
│   │   ├── runnables.ts              # Moved from lang/runnables.ts
│   │   ├── conditionals.ts           # Moved from lang/conditionals.ts
│   │   ├── helpers.ts                # Moved from lang/helpers.ts
│   │   ├── tokenHandler.ts           # Moved from lang/tokenHandler.ts
│   │   └── nodes/                    # Moved from lang/nodes/
│   │       ├── identificationNodes.ts
│   │       ├── processingNodes.ts
│   │       └── completionNodes.ts
│   │
│   └── modern/                       # System 3: New Modern System (to be created)
│       ├── README.md                 # Documentation for new system
│       └── [implementation files]
│
└── core/                             # Core orchestration
    └── objectGeneration.ts           # Facade/router (updated imports)
```

---

## Migration Plan

### Phase 1: Create New Structure

1. Create `shared/` folder and move shared resources
2. Create `systems/legacy/` and move legacy system
3. Create `systems/langgraph/` and move LangGraph system
4. Create `systems/modern/` placeholder for new system

### Phase 2: Update Imports

1. Update `core/objectGeneration.ts` imports
2. Update all internal imports within moved files
3. Update `index.ts` exports
4. Update any external imports (e.g., from `@ai`)

### Phase 3: Documentation

1. Add README.md to each system folder explaining:
   - Architecture
   - When it was used
   - Key characteristics
   - How to use it (for reference)
2. Update main README.md

### Phase 4: Testing

1. Verify both systems still work
2. Test `mathObjectsGeneratorTests` page
3. Ensure no breaking changes

---

## Benefits of This Structure

1. **Clear Separation**: Each system is self-contained in its own folder
2. **Shared Resources**: Common code is clearly identified and accessible
3. **Easy Extension**: New system can be added in `systems/modern/` without affecting others
4. **Preservation**: Legacy systems remain as examples/memory
5. **Maintainability**: Clear boundaries make it easier to understand and modify
6. **Documentation**: Each system can have its own README explaining its purpose

---

## Considerations

### Import Path Updates Required

#### Internal Imports (within `@ai` folder)

- All files importing from `@ai/chains/*` → `@ai/systems/legacy/chains/*`
- All files importing from `@ai/lang/*` → `@ai/systems/langgraph/*`
- All files importing from `@ai/schemas/*` → `@ai/shared/schemas/*`
- All files importing from `@ai/prompts/*` → `@ai/shared/prompts/*`
- All files importing from `@ai/validation/*` → `@ai/shared/validation/*`
- All files importing from `@ai/services/*` → `@ai/shared/services/*`
- All files importing from `@ai/utils/*` → `@ai/shared/utils/*`

#### External Imports (found in codebase)

Files that import from `@ai` that will need updates:

1. **`src/features/modules/math/tests/core/TestRunner.ts`**
   - `@ai/utils/tokenUtils` → `@ai/shared/utils/tokenUtils`

2. **`src/features/modules/voice/components/VoicePromptButton.tsx`**
   - `@ai/core/objectGeneration` → `@ai/core/objectGeneration` (no change, core stays)

3. **`src/features/modules/math/tests/utils/common/testDataHelpers.ts`**
   - `@ai/utils/tokenUtils` → `@ai/shared/utils/tokenUtils`

4. **`src/pages/api/ai/generateSettings.ts`**
   - `@/features/infrastructure/ai/core/objectGeneration` → (no change, core stays)

### Breaking Changes

- External imports using `@ai/utils/*` will need to change to `@ai/shared/utils/*`
- The `@ai/core/objectGeneration` path remains unchanged (good for backward compatibility)
- Need to update 3 external files that import from `@ai/utils/*`

### Testing Strategy

- Run `mathObjectsGeneratorTests` page after migration
- Test both systems (toggle `USE_LANGGRAPH` flag)
- Verify no runtime errors

---

## Next Steps

1. **Review this assessment** - Confirm approach
2. **Create TODO list** - Break down migration into tasks
3. **Execute migration** - Move files and update imports
4. **Test thoroughly** - Ensure everything works
5. **Document** - Add README files to each system
