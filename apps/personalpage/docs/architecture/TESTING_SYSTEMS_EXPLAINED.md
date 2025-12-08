# Testing Systems Explained

## Overview

This project has **two different testing systems** that serve different purposes:

1. **AI/Math Object Generation Tests** - Tests AI-generated content
2. **Standard Unit Tests (Jest)** - Tests regular code functions

## System 1: AI/Math Object Generation Tests

### Purpose

Tests whether your AI system correctly generates mathematical objects (coefficients, terms, expressions) when given prompts.

### Location

- **Scripts**: `src/scripts/test/`
- **Core Logic**: `src/features/modules/math/tests/`
- **UI**: `src/features/modules/math/MathObjectsGeneratorTestsPage.tsx`

### How It Works

1. **Test Cases**: Defined in `src/features/modules/math/tests/cases/`
   - Each test has a prompt (e.g., "Generate a positive integer coefficient")
   - Each test specifies what object type to generate

2. **Execution Flow**:

   ```
   Prompt → OpenAI API → Generated Objects → Validation → Pass/Fail
   ```

3. **Results Storage**:
   - Results saved to Firestore database
   - Tracks pass/fail rates over time
   - Stores error messages, token usage, elapsed time

4. **Features**:
   - Database integration (tracks historical results)
   - Filtering by object type, pass/fail status
   - Re-run failed tests
   - Find missing tests (tests that haven't been run)
   - Analytics and statistics

### Commands

```bash
# Run all math object generation tests
npm run test:openai

# Count available tests
npm run test:openai:count

# View test results from database
npm run test:openai:results

# Run tests that haven't been executed yet
npm run test:openai:missing

# Re-run previously failed tests
npm run test:openai:failed

# Re-run last 10 failed tests
npm run test:openai:failed:10
```

### When to Use

- Testing AI behavior and quality
- Validating math object generation
- Tracking AI performance over time
- Debugging AI-generated content issues

---

## System 2: Standard Unit Tests (Jest)

### Purpose

Tests your regular code functions, utilities, and components to ensure they work correctly.

### Location

- **Config**: `jest.config.cjs`, `jest.setup.cjs`
- **Tests**: `*.test.ts` files next to source files
- **Examples**: `src/features/modules/calendar/utils/*.test.ts`

### How It Works

1. **Test Files**: Placed next to source files
   - `eventTransformer.ts` → `eventTransformer.test.ts`
   - `dateUtils.ts` → `dateUtils.test.ts`

2. **Execution Flow**:

   ```
   Test File → Jest Runner → Assertions → Pass/Fail
   ```

3. **No Database**:
   - Pure unit tests
   - No external dependencies (unless mocked)
   - Fast execution

4. **Features**:
   - Fast feedback
   - Isolated testing
   - Coverage reports
   - Watch mode for development

### Commands

```bash
# Run all unit tests
npm run test:windows        # Windows
npm test                    # Mac/Linux

# Run specific test file
npm run test:windows -- eventTransformer.test.ts

# Run with coverage report
npm run test:windows -- --coverage

# Watch mode (auto-rerun on file changes)
npm run test:windows -- --watch
```

### When to Use

- Testing utility functions
- Testing data transformations
- Testing calculations
- Testing component logic
- Catching regressions when refactoring
- **For AI-assisted development**: Run before/after AI changes

---

## Comparison

| Aspect            | AI Tests                                 | Unit Tests                                  |
| ----------------- | ---------------------------------------- | ------------------------------------------- |
| **Purpose**       | Test AI behavior                         | Test code functions                         |
| **Speed**         | Slow (API calls)                         | Fast                                        |
| **Database**      | Yes (Firestore)                          | No                                          |
| **External APIs** | Yes (OpenAI)                             | No (mocked if needed)                       |
| **Cost**          | Yes (API tokens)                         | Free                                        |
| **When to run**   | Periodic validation                      | Before every commit                         |
| **Examples**      | "Does AI generate correct coefficients?" | "Does `calculateEndTime()` work correctly?" |

---

## Using Both Systems Together

### Workflow for AI-Assisted Development

1. **Before AI changes**:

   ```bash
   # Run unit tests to see current state
   npm run test:windows
   ```

2. **Make AI changes** (e.g., refactor code, add features)

3. **After AI changes**:

   ```bash
   # Run unit tests again to catch regressions
   npm run test:windows

   # If tests fail, show AI the failures and ask it to fix
   ```

4. **Periodically** (when working on AI features):
   ```bash
   # Run AI tests to validate AI behavior
   npm run test:openai:failed
   ```

### Best Practices

1. **Unit Tests** (`npm run test:windows`):
   - ✅ Run frequently (before/after changes)
   - ✅ Keep tests fast (< 1 second total)
   - ✅ Test utilities, transformations, calculations
   - ✅ Use for regression detection

2. **AI Tests** (`npm run test:openai`):
   - ✅ Run periodically (not every commit)
   - ✅ Use for validating AI improvements
   - ✅ Track long-term AI performance
   - ✅ Use filters to test specific areas

---

## Quick Reference

### I want to test...

**...a utility function I wrote:**
→ Use **Unit Tests (Jest)** - Add a `*.test.ts` file

**...if my AI generates correct math objects:**
→ Use **AI Tests** - Run `npm run test:openai`

**...if my refactoring broke something:**
→ Use **Unit Tests (Jest)** - Run `npm run test:windows`

**...AI performance over time:**
→ Use **AI Tests** - Check `npm run test:openai:results`

**...a specific failing test:**
→ **Unit Tests**: `npm run test:windows -- filename.test.ts`
→ **AI Tests**: `npm run test:openai:failed`

---

## Examples

### Unit Test Example

```typescript
// eventTransformer.test.ts
describe("transformToGoogleEvent", () => {
  it("should transform basic event details correctly", () => {
    const input = { summary: "Test", startDateTime: "2024-01-01T10:00:00Z" };
    const result = transformToGoogleEvent(input);
    expect(result.summary).toBe("Test");
  });
});
```

### AI Test Example

```typescript
// TestCase in math/tests/cases/
{
  name: "positive_integer_coefficient",
  prompt: "Generate a positive integer coefficient",
  objectType: "coefficient",
  // When run, sends prompt to OpenAI and validates result
}
```

---

## Summary

Both testing systems are valuable and serve different purposes:

- **Unit Tests**: Fast, frequent validation of your code
- **AI Tests**: Periodic validation of AI-generated content

For AI-assisted development, **unit tests are most important** because they:

- Run quickly
- Catch regressions immediately
- Give fast feedback to AI assistants
- Don't cost money (no API calls)

Use AI tests when specifically working on or improving your AI math object generation features.
