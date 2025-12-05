# AI System Limitations Documentation

This document outlines the limitations and supported features for System 1 (Legacy) and System 2 (LangGraph). Use this to prevent tests from running on systems that don't support certain object types or features.

## System 1 (Legacy) - Limitations

### ✅ Fully Supported Object Types
These object types have complete schema definitions, system prompts, and validation:

1. **coefficient** ✅
   - Full schema: `coefficientSettingsSchema`
   - System prompt: `COEFFICIENT_SYSTEM_PROMPT`
   - Validation: Complete
   - Recursive support: None (leaf node)

2. **coefficients** ✅
   - Full schema: `coefficientsSettingsSchema`
   - System prompt: `COEFFICIENTS_SYSTEM_PROMPT`
   - Validation: Complete
   - Recursive support: Can contain `coefficient` sub-objects

3. **term** ✅
   - Full schema: `termSettingsSchema`
   - System prompt: `TERM_SYSTEM_PROMPT`
   - Validation: Complete
   - Recursive support: Can contain `coefficients` sub-objects

4. **expression** ✅
   - Full schema: `expressionSettingsSchema`
   - System prompt: `EXPRESSION_SYSTEM_PROMPT`
   - Validation: Basic (structure only, TODO for detailed validation)
   - Recursive support: Can contain `term` sub-objects

5. **equation** ✅
   - Full schema: `equationSettingsSchema`
   - System prompt: `EQUATION_SYSTEM_PROMPT`
   - Validation: Basic (structure only, TODO for detailed validation)
   - Recursive support: Can contain `term` sub-objects

### ⚠️ Partially Supported Object Types
These have placeholder schemas and may not work correctly:

6. **terms** ⚠️
   - Schema: Placeholder only (`{ type: "object", description: "Settings for multiple terms (placeholder)" }`)
   - System prompt: `TERMS_SYSTEM_PROMPT` (exists)
   - Validation: Basic (structure only)
   - Recursive support: Can contain `term` sub-objects
   - **Status**: Schema is commented out in imports (`// termsSettingsSchema, // Uncomment when available`)

7. **inequality** ⚠️
   - Schema: Placeholder only
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for inequality"`)
   - Validation: Basic (structure only)
   - Recursive support: Can contain `term` sub-objects
   - **Status**: Schema is commented out in imports

8. **function** ⚠️
   - Schema: Placeholder only
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for function"`)
   - Validation: Basic (structure only)
   - Recursive support: Can contain `expression` sub-objects
   - **Status**: Schema is commented out in imports

9. **point** ⚠️
   - Schema: Placeholder only
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for point"`)
   - Validation: Basic (structure only)
   - Recursive support: Can contain `coefficient` sub-objects
   - **Status**: Schema is commented out in imports

10. **set** ⚠️
    - Schema: Placeholder only
    - System prompt: Placeholder (`"PLACEHOLDER: System prompt for set"`)
    - Validation: Basic (structure only)
    - Recursive support: Can contain `coefficient` sub-objects
    - **Status**: Schema is commented out in imports

11. **interval** ⚠️
    - Schema: Placeholder only
    - System prompt: Placeholder (`"PLACEHOLDER: System prompt for interval"`)
    - Validation: Basic (structure only)
    - Recursive support: Can contain `coefficient` sub-objects
    - **Status**: Schema is commented out in imports

### System 1 Known Issues

1. **Validation Gaps**: 
   - Only `coefficient` and `coefficients` have complete validation
   - Other types have basic structure validation but lack detailed property validation (marked with TODO in code)

2. **Placeholder Schemas**: 
   - Types with placeholder schemas will use a fallback generic object schema, which may not enforce correct structure

3. **System Prompt Gaps**: 
   - `inequality`, `function`, `point`, `set`, `interval` use placeholder prompts that may not guide the LLM correctly

4. **Recursive Processing**: 
   - Supports recursive processing for nested objects, but may fail if sub-object types are not fully supported

---

## System 2 (LangGraph) - Limitations

### ✅ Fully Supported Object Types
These have complete Zod schemas and system prompts:

1. **coefficient** ✅
   - Zod schema: `CoefficientSettingsSchema` (complete)
   - System prompt: `COEFFICIENT_SYSTEM_PROMPT`
   - Validation: Complete (Zod + additional validation)

2. **coefficients** ✅
   - Zod schema: `CoefficientsSettingsSchema` (complete)
   - System prompt: `COEFFICIENTS_SYSTEM_PROMPT`
   - Validation: Complete (Zod + additional validation)

3. **term** ✅
   - Zod schema: `TermSettingsSchema` (complete)
   - System prompt: `TERM_SYSTEM_PROMPT`
   - Validation: Complete (Zod + additional validation)

### ⚠️ Partially Supported Object Types
These have placeholder Zod schemas (using `passthrough()`):

4. **expression** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: `EXPRESSION_SYSTEM_PROMPT` (exists)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Placeholder schema allows any fields

5. **equation** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: `EQUATION_SYSTEM_PROMPT` (exists)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Placeholder schema allows any fields

6. **terms** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: `TERMS_SYSTEM_PROMPT` (exists)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Placeholder schema allows any fields

7. **inequality** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for inequality"`)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Both schema and prompt are placeholders

8. **function** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for function"`)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Both schema and prompt are placeholders

9. **point** ⚠️
   - Zod schema: `z.object({}).passthrough()` (placeholder)
   - System prompt: Placeholder (`"PLACEHOLDER: System prompt for point"`)
   - Validation: Basic (structure only, accepts any object)
   - **Status**: Both schema and prompt are placeholders

10. **set** ⚠️
    - Zod schema: `z.object({}).passthrough()` (placeholder)
    - System prompt: Placeholder (`"PLACEHOLDER: System prompt for set"`)
    - Validation: Basic (structure only, accepts any object)
    - **Status**: Both schema and prompt are placeholders

11. **interval** ⚠️
    - Zod schema: `z.object({}).passthrough()` (placeholder)
    - System prompt: Placeholder (`"PLACEHOLDER: System prompt for interval"`)
    - Validation: Basic (structure only, accepts any object)
    - **Status**: Both schema and prompt are placeholders

### System 2 Known Issues

1. **Placeholder Schemas**: 
   - Types with `passthrough()` schemas accept any object structure, which may lead to incorrect or incomplete settings

2. **System Prompt Gaps**: 
   - `inequality`, `function`, `point`, `set`, `interval` use placeholder prompts that may not guide the LLM correctly

3. **Recursive Processing**: 
   - Supports recursive processing via context stack, but may fail if sub-object types are not fully supported

4. **Validation**: 
   - Only `coefficient`, `coefficients`, and `term` have complete Zod validation
   - Other types rely on basic structure validation only

---

## Summary Comparison

### Fully Supported (Both Systems)
- ✅ **coefficient**
- ✅ **coefficients**
- ✅ **term**

### Partially Supported (Both Systems)
- ⚠️ **expression** (has prompts, but incomplete schemas)
- ⚠️ **equation** (has prompts, but incomplete schemas)
- ⚠️ **terms** (has prompts, but incomplete schemas)

### Not Recommended (Both Systems)
- ❌ **inequality** (placeholder prompts and schemas)
- ❌ **function** (placeholder prompts and schemas)
- ❌ **point** (placeholder prompts and schemas)
- ❌ **set** (placeholder prompts and schemas)
- ❌ **interval** (placeholder prompts and schemas)

---

## Recommendations for Test Filtering

### Safe to Test (Both Systems)
- `coefficient`
- `coefficients`
- `term`

### Use with Caution (May have issues)
- `expression` (incomplete validation)
- `equation` (incomplete validation)
- `terms` (incomplete schemas)

### Should NOT Test (Not implemented)
- `inequality` (placeholder prompts)
- `function` (placeholder prompts)
- `point` (placeholder prompts)
- `set` (placeholder prompts)
- `interval` (placeholder prompts)

---

## Implementation Notes

### System 1 (Legacy)
- Uses JSON schemas for validation
- Has fallback behavior for missing schemas (returns generic object schema)
- Recursive processing is implemented but may fail on unsupported types

### System 2 (LangGraph)
- Uses Zod schemas for validation
- Throws error if schema is missing (no fallback)
- Recursive processing via context stack
- More strict validation for supported types

---

## Code References

- System 1 schemas: `src/features/infrastructure/ai/systems/legacy/chains/SettingsExtractorChain.ts:32-46`
- System 2 schemas: `src/features/infrastructure/ai/systems/langgraph/runnables.ts:185-199`
- System prompts: `src/features/infrastructure/ai/shared/prompts/systemPrompts/index.ts:30-43`
- Validation: `src/features/infrastructure/ai/shared/validation/settingsValidator.ts`

