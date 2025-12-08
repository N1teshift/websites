# Testing Quick Start

## How People Usually Approach Testing

Here's a practical approach used by many developers:

### 1. **Start Small** - Test Pure Functions First

- **Why**: Easiest to test, highest confidence gains
- **What**: Utility functions, data transformations, calculations
- **Example**: `eventTransformer.ts`, `dateUtils.ts`

### 2. **Test as You Build** (or Right After)

- Don't wait until the end to add tests
- Add tests when you write new features or refactor
- **For AI assistance**: Run tests before and after AI changes

### 3. **Focus on Behavior, Not Implementation**

- Test **what** the code does, not **how** it does it
- Example: "Should calculate end time correctly" ✅ vs "Should call addMinutes" ❌

### 4. **Test Critical Paths First**

- Functions that handle business logic
- Functions that transform data
- Functions that make decisions

### 5. **Cover Edge Cases**

- Empty arrays/null values
- Boundary conditions
- Error conditions

## Common Testing Approaches

### The Test Pyramid

```
        /\
       /  \  E2E Tests (few)
      /____\
     /      \  Integration Tests (some)
    /________\
   /          \  Unit Tests (many)
  /____________\
```

**Your focus should be**: Mostly unit tests for utilities, some integration tests for complex features.

### TDD vs Writing Tests After

**TDD (Test-Driven Development)**: Write tests first, then code

- Pros: Ensures code is testable, clarifies requirements
- Cons: Can slow down initial development

**Write Tests After**: Write code first, then tests

- Pros: Faster initial development
- Cons: May write code that's hard to test

**For AI-assisted development**: Write tests after (or alongside) is fine. The important part is having tests to catch regressions.

## What Makes Good Tests?

✅ **Good Tests:**

- Test one thing at a time
- Have clear, descriptive names
- Are independent (can run in any order)
- Are fast
- Test behavior, not implementation

❌ **Bad Tests:**

- Test multiple things
- Have vague names like "test1"
- Depend on other tests
- Are slow (wait for real APIs/databases)
- Break when implementation changes (but behavior is same)

## Your Current Setup

✅ **What's Already Set Up:**

- Jest configured and working
- React Testing Library installed
- Sample tests created (see `src/features/modules/calendar/utils/*.test.ts`)
- Test configuration for Next.js

## Next Steps

1. **Run existing tests**: `npm run test:windows` (or `npm test` on Mac/Linux)
2. **Start adding tests** to utility functions in other modules
3. **Run tests before/after AI changes** to catch regressions
4. **Gradually increase coverage** - aim for 80%+ on utilities

## Quick Commands

```bash
# Run all tests
npm run test:windows    # Windows
npm test                # Mac/Linux

# Run specific test file
npm run test:windows -- eventTransformer.test.ts

# Run tests in watch mode (auto-rerun on changes)
npm run test:windows -- --watch

# Run tests with coverage report
npm run test:windows -- --coverage
```

## When Using AI Assistance

1. **Before AI changes**: Run `npm run test:windows` to see current state
2. **Ask AI to make changes**
3. **After AI changes**: Run `npm run test:windows` again
4. **If tests fail**: Show AI the failing tests and ask it to fix
5. **Verify**: Run tests again to confirm fixes

This workflow helps you:

- Catch bugs early
- Ensure AI changes don't break existing functionality
- Build confidence in your codebase

## Examples in This Project

See these files for examples:

- `src/features/modules/calendar/utils/eventTransformer.test.ts`
- `src/features/modules/calendar/utils/dateUtils.test.ts`

These show how to:

- Test pure functions
- Test edge cases
- Use Jest matchers effectively
- Handle timezone-sensitive tests
