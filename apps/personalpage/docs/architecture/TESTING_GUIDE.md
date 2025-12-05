# Testing Guide - Standard Unit Tests (Jest)

> **Note**: This project has **two testing systems**:
> 1. **Standard Unit Tests (Jest)** - This guide (testing regular code)
> 2. **AI/Math Object Generation Tests** - See `TESTING_SYSTEMS_EXPLAINED.md` (testing AI behavior)
>
> For AI-assisted development, **unit tests** are what you'll use most often.

## Overview

This guide outlines the **standard unit testing strategy** using Jest. Tests are essential for:
- **AI-assisted development**: Ensuring AI changes don't break existing functionality
- **Regression prevention**: Catching bugs before they reach production
- **Documentation**: Tests serve as living examples of how code should work
- **Confidence**: Enabling safe refactoring and feature additions

## Testing Philosophy

### Test Pyramid

```
        /\
       /  \  E2E Tests (few)
      /____\
     /      \  Integration Tests (some)
    /________\
   /          \  Unit Tests (many)
  /____________\
```

1. **Unit Tests (Most tests)**: Test individual functions/utilities in isolation
2. **Integration Tests**: Test how multiple units work together
3. **E2E Tests**: Test complete user workflows (minimal, focused on critical paths)

### What to Test

**Priority 1 - Start Here:**
- ✅ **Pure utility functions** (easier, high value)
  - Date manipulation functions
  - Data transformation functions
  - Validation functions
  - Calculation functions

**Priority 2 - Core Business Logic:**
- ✅ **API services** (with mocks)
  - Data fetching logic
  - Error handling
  - Response transformations

**Priority 3 - Complex Features:**
- ✅ **React hooks** (testing-library/react-hooks)
- ✅ **Component logic** (not styling, but behavior)
- ✅ **Form validation**
- ✅ **State management**

**Lower Priority:**
- Simple presentational components (unless they have complex logic)
- Styling/CSS (visual regression tests if needed)
- Third-party library code (mock it instead)

### What NOT to Test (at first)

- Next.js routing (framework responsibility)
- Simple getters/setters
- Trivial wrapper functions
- Third-party library internals

## Test Structure

### File Organization

```
src/
├── features/
│   ├── modules/
│   │   ├── calendar/
│   │   │   ├── utils/
│   │   │   │   ├── eventTransformer.ts
│   │   │   │   └── eventTransformer.test.ts  ← Test next to source
│   │   │   └── components/
│   │   │       ├── Calendar.tsx
│   │   │       └── Calendar.test.tsx
```

**Convention**: Place test files next to the source files they test:
- `eventTransformer.ts` → `eventTransformer.test.ts`
- `Calendar.tsx` → `Calendar.test.tsx`

## Common Testing Patterns

### 1. Unit Testing Pure Functions

**Example: Testing `eventTransformer.ts`**

```typescript
// eventTransformer.test.ts
import { transformToGoogleEvent } from './eventTransformer';

describe('transformToGoogleEvent', () => {
  it('should transform basic event details correctly', () => {
    const input = {
      summary: 'Test Event',
      startDateTime: '2024-01-01T10:00:00Z',
      endDateTime: '2024-01-01T11:00:00Z',
      attendees: []
    };

    const result = transformToGoogleEvent(input);

    expect(result.summary).toBe('Test Event');
    expect(result.start.dateTime).toBe('2024-01-01T10:00:00Z');
    expect(result.end.dateTime).toBe('2024-01-01T11:00:00Z');
  });

  it('should handle attendees correctly', () => {
    const input = {
      summary: 'Meeting',
      startDateTime: '2024-01-01T10:00:00Z',
      endDateTime: '2024-01-01T11:00:00Z',
      attendees: [
        { email: 'test@example.com', name: 'Test User' }
      ]
    };

    const result = transformToGoogleEvent(input);

    expect(result.attendees).toHaveLength(1);
    expect(result.attendees[0].email).toBe('test@example.com');
    expect(result.attendees[0].displayName).toBe('Test User');
  });

  it('should handle missing optional fields', () => {
    const input = {
      summary: 'Event',
      startDateTime: '2024-01-01T10:00:00Z',
      endDateTime: '2024-01-01T11:00:00Z'
    };

    const result = transformToGoogleEvent(input);

    expect(result).toBeDefined();
    expect(result.attendees).toBeUndefined();
  });
});
```

### 2. Testing with Mocks

**When to mock:**
- External APIs (Google Calendar, Firebase, OpenAI)
- Database calls
- File system operations
- Time-dependent code

**Example: Mocking Firebase**

```typescript
jest.mock('@/features/infrastructure/api/firebase/firestoreService', () => ({
  getDocument: jest.fn(),
  saveDocument: jest.fn()
}));
```

### 3. Testing React Components

**Use React Testing Library** (already included in dependencies):

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar Component', () => {
  it('should render calendar with events', () => {
    const events = [
      { id: '1', title: 'Test Event', start: new Date() }
    ];

    render(<Calendar events={events} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('should handle event click', () => {
    const onEventClick = jest.fn();
    render(<Calendar events={events} onEventClick={onEventClick} />);

    fireEvent.click(screen.getByText('Test Event'));

    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({
      id: '1'
    }));
  });
});
```

### 4. Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCalendarData } from './useCalendarData';

describe('useCalendarData', () => {
  it('should load calendar data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCalendarData());

    await waitForNextUpdate();

    expect(result.current.data).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
});
```

## Testing Utilities

### Setup Files

- `jest.setup.ts` - Global test setup (mocks, utilities)
- `jest.config.js` - Jest configuration

### Common Test Utilities

Create shared test utilities in `src/__tests__/utils/`:

```typescript
// src/__tests__/utils/testHelpers.ts
export const createMockEvent = (overrides = {}) => ({
  summary: 'Test Event',
  startDateTime: '2024-01-01T10:00:00Z',
  endDateTime: '2024-01-01T11:00:00Z',
  ...overrides
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run tests for specific file
npm test -- eventTransformer.test.ts

# Run tests with coverage
npm test -- --coverage

# Run tests matching pattern
npm test -- --testNamePattern="should transform"
```

## Coverage Goals

- **Aim for 80%+ coverage** on utility functions (high priority)
- **Aim for 60-70% coverage** on components/hooks
- **Focus on critical paths**: Test the code that matters most

## Testing Workflow

### When Adding New Features

1. **Write tests first** (TDD) OR **Write tests alongside** code
2. **Ensure tests pass** locally
3. **Run full test suite** before committing
4. **Fix any broken tests** from previous changes

### When Using AI Assistance

1. **Run tests before AI changes**: `npm test`
2. **Make AI changes**
3. **Run tests again**: `npm test`
4. **If tests fail**: Show AI the test failures, ask it to fix
5. **Verify fixes**: Run tests again

## Common Pitfalls to Avoid

1. **Testing implementation details** instead of behavior
   - ❌ Bad: "This function calls `fetch` with these parameters"
   - ✅ Good: "This function returns the expected data"

2. **Over-mocking**: Don't mock everything
   - ✅ Mock external APIs, databases
   - ❌ Don't mock simple utility functions

3. **Brittle tests**: Tests that break when implementation changes (but behavior is same)
   - Focus on **what** the code does, not **how**

4. **Not testing edge cases**: Empty arrays, null values, error conditions

## Next Steps

1. **Start with utilities**: Begin testing pure functions in `utils/` directories
2. **Add tests incrementally**: Don't try to test everything at once
3. **Test as you refactor**: When AI refactors code, add/update tests
4. **Set up CI**: Eventually run tests automatically on commits (GitHub Actions)

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

