# Easy Tests Roadmap

This document lists all the easy-to-test functions in your codebase, prioritized by difficulty and impact.

## Difficulty Levels

- ⭐ **1 - Very Easy**: Pure functions, no dependencies, simple logic
- ⭐⭐ **2 - Easy**: Pure functions with some complexity
- ⭐⭐⭐ **3 - Moderate**: Functions with dependencies that can be mocked
- ⭐⭐⭐⭐ **4 - Medium-Hard**: Functions requiring more setup/mocking
- ⭐⭐⭐⭐⭐ **5 - Hard**: Complex functions (not in this list - skip for now)

---

## Estimated Coverage Impact

**Total Functions Listed**: ~80+ functions  
**Estimated Coverage After Testing These**: **30-40% of utility code**  
**Estimated Time**: 2-3 days for all easy tests

---

## Priority 1: ⭐ Very Easy Tests (Start Here)

### Calendar Module

#### `src/features/modules/calendar/utils/dateUtils.ts`
- ✅ Already tested: `formatDateTime`, `calculateEndTime`, `getAvailableGap`

#### `src/features/modules/calendar/utils/eventRegistrationUtils.ts`
- ⭐ `parseRegistrationInfoFromUrl` - Parse JSON from query params
- ⭐ `getSuccessMessageKey` - Simple switch statement mapping
- ⭐ `createTemporaryEvent` - Create event object from details
  **Coverage**: ~15% of calendar module

#### `src/features/modules/calendar/utils/eventDetailsExtractor.ts`
- ⭐ `extractEventDetailsFromQuery` - Extract and validate from query params
- ⭐ `extractEventDetailsFromBody` - Extract and validate from body
  **Coverage**: ~10% of calendar module

#### `src/features/modules/calendar/utils/emailFormatter.ts`
- ⭐⭐ `formatEmailBody` - Template string replacement (needs mock file system)
  **Coverage**: ~5% of calendar module

**Total Calendar Easy Tests**: 6 functions (~30% of calendar utils)

---

### Math Module

#### `src/features/modules/math/shared/numberUtils.ts` ⭐⭐⭐ HIGH VALUE
- ⭐ `randomChoice<T>` - Select random element from array
- ⭐ `randomInt` - Generate random integer in range
- ⭐ `isPrime` - Check if number is prime
- ⭐ `isSquare` - Check if number is perfect square
- ⭐ `isCube` - Check if number is perfect cube
- ⭐ `gcd` - Greatest common divisor (Euclidean algorithm)
- ⭐ `countDecimalPlaces` - Count decimal places
- ⭐⭐ `getRuleValidator` - Returns validator function for coefficient rules
  **Coverage**: ~25% of math module utils

#### `src/features/modules/math/mathObjects/utils/formattingUtils.ts`
- ⭐⭐ Various formatting functions (need to check what's exported)
  **Coverage**: ~10% of math module

**Total Math Easy Tests**: 8+ functions (~35% of math utils)

---

### Progress Report Module

#### `src/features/modules/edtech/progressReport/utils/progressReportUtils.ts`
- ⭐⭐ `calculateStudentStats` - Calculate averages, attendance, completion
- ⭐ `filterAssessmentsByType` - Filter array by type
  **Coverage**: ~15% of progress report utils

#### `src/features/modules/edtech/progressReport/utils/missionUtils.ts` ⭐⭐⭐ HIGH VALUE
- ⭐ `generateMissionId` - Generate unique ID
- ⭐ `calculateMissingPoints` - Simple calculation: `Math.max(0, 1 - score)`
- ⭐ `calculateTotalMissingPoints` - Sum missing points
- ⭐⭐ `getUnmasteredObjectives` - Filter and transform objectives
- ⭐⭐ `createMissionCandidate` - Transform student data to candidate
- ⭐⭐ `groupCandidatesByPriority` - Group by priority levels
- ⭐⭐ `createMission` - Create mission object
- ⭐ `startMission` - Update status to in_progress
- ⭐ `completeMission` - Update status to completed
- ⭐ `cancelMission` - Update status to cancelled
- ⭐⭐ `shouldAutoComplete` - Check if all objectives assessed
- ⭐⭐ `calculateMissionSummary` - Calculate statistics
- ⭐⭐ `updateMissionWithAssessment` - Update mission with new data
- ⭐ `filterMissionsByStatus` - Filter array by status
- ⭐⭐ `isMissionOverdue` - Check deadline vs today
- ⭐ `getStudentMissions` - Get missions from student
- ⭐ `getActiveMissions` - Filter active missions
- ⭐ `findMissionById` - Find mission by ID
- ⭐⭐ `updateMissionInStudent` - Update mission in student data
- ⭐ `addMissionToStudent` - Add mission to student
- ⭐⭐ `generateMissionTitle` - Generate title from objectives
  **Coverage**: ~40% of progress report utils

#### `src/features/modules/edtech/progressReport/utils/assessmentColumnUtils.ts`
- ⭐ `getAssessmentScore` - Get latest score for column
- ⭐ `getAssessmentsByColumn` - Filter assessments by column
- ⭐ `getLatestAssessment` - Get latest assessment for column
- ⭐ `formatAssessmentScore` - Format score string
- ⭐ `formatHomeworkCompletion` - Format homework score
- ⭐ `getUniqueAssessmentColumns` - Get unique columns from students
- ⭐ `getAssessmentColumnsByType` - Filter columns by type
- ⭐ `getAssessmentScoreById` - Get score by assessment ID
- ⭐ `getLatestAssessmentById` - Get latest by ID
- ⭐ `getAssessmentsById` - Filter by assessment ID
- ⭐⭐ `getUniqueAssessments` - Get unique assessment objects
  **Coverage**: ~20% of progress report utils

#### `src/features/modules/edtech/progressReport/utils/processing/classStatistics.ts`
- ⭐⭐ `calculateClassStatistics` - Calculate class averages
- ⭐ `calculateAverageScore` - Calculate average score
  **Coverage**: ~10% of progress report utils

#### `src/features/modules/edtech/progressReport/utils/processing/gradeCalculations.ts`
- ⭐⭐ `calculateGradeFromSum` - Calculate grade from sum
- ⭐⭐ `calculateGrade` - Calculate grade for student
- ⭐ `hasAllTestScores` - Check if all scores present
  **Coverage**: ~10% of progress report utils

**Total Progress Report Easy Tests**: 35+ functions (~95% of progress report utils!)

---

### Infrastructure/Shared

#### `src/features/infrastructure/shared/utils/functionUtils.ts`
- ⭐⭐ `debounce` - Debounce function wrapper (needs timer mocking)
  **Coverage**: ~5% of shared utils

#### `src/features/infrastructure/cache/cacheUtils.ts`
- ⭐⭐ `makeCacheKey` - Simple string concatenation
- ⭐⭐ `hasCache` - Check if cache exists (needs localStorage mock)
- ⭐⭐ Cache functions (need browser environment mocks)
  **Coverage**: ~10% of cache utils

**Total Infrastructure Easy Tests**: 3+ functions (~5% of infrastructure)

---

## Summary by Module

| Module | Functions | Difficulty | Coverage | Priority |
|--------|-----------|------------|----------|----------|
| **Calendar Utils** | 6 | ⭐-⭐⭐ | ~30% | High |
| **Math Utils** | 8+ | ⭐ | ~35% | High |
| **Progress Report** | 35+ | ⭐-⭐⭐ | ~95% | **Highest** |
| **Infrastructure** | 3+ | ⭐⭐ | ~5% | Medium |
| **TOTAL** | **~52+** | ⭐-⭐⭐ | **~30-40% overall** | |

---

## Recommended Testing Order

### Week 1: Quick Wins (High Impact, Low Effort)

1. **Progress Report - Mission Utils** (20 functions)
   - Highest value: These are business-critical calculations
   - Very easy: Mostly pure functions
   - **Estimated time**: 4-6 hours
   - **Coverage gain**: ~40% of progress report utils

2. **Math - Number Utils** (8 functions)
   - Pure mathematical functions
   - Very straightforward to test
   - **Estimated time**: 2-3 hours
   - **Coverage gain**: ~35% of math utils

3. **Progress Report - Assessment Utils** (11 functions)
   - Data filtering/transformation
   - **Estimated time**: 2-3 hours
   - **Coverage gain**: ~20% of progress report utils

**Week 1 Total**: ~31 functions, ~8-12 hours, **~50% of utility code covered**

### Week 2: Calendar & Remaining

4. **Calendar Utils** (6 functions)
   - **Estimated time**: 2-3 hours
   - **Coverage gain**: ~30% of calendar utils

5. **Progress Report - Statistics & Grades** (5 functions)
   - **Estimated time**: 1-2 hours
   - **Coverage gain**: ~10% of progress report utils

6. **Infrastructure Utils** (3 functions)
   - **Estimated time**: 1-2 hours
   - **Coverage gain**: ~5% of infrastructure

**Week 2 Total**: ~14 functions, ~4-7 hours

---

## Coverage Estimates

### After All Easy Tests

- **Utility Functions**: 30-40% coverage
- **Calendar Module**: 25-30% coverage
- **Math Module**: 30-35% coverage
- **Progress Report Module**: 40-50% coverage
- **Overall Project**: 15-20% coverage

### What's NOT Covered (Harder Tests)

- React components (need React Testing Library setup)
- React hooks (need hook testing setup)
- API services (need API mocking)
- Complex business logic with many dependencies

---

## Quick Start Guide

### 1. Start with Progress Report Mission Utils

**Why**: Highest value, most business-critical, very easy to test

```bash
# Create test file
touch src/features/modules/edtech/progressReport/utils/missionUtils.test.ts
```

**Example first test**:
```typescript
import { calculateMissingPoints } from './missionUtils';

describe('calculateMissingPoints', () => {
  it('should return 0 for score of 1', () => {
    expect(calculateMissingPoints(1)).toBe(0);
  });
  
  it('should return missing points for score < 1', () => {
    expect(calculateMissingPoints(0.5)).toBe(0.5);
  });
  
  it('should handle null score', () => {
    expect(calculateMissingPoints(null)).toBe(0);
  });
});
```

### 2. Then Math Number Utils

Pure functions - perfect for testing practice.

### 3. Then Assessment Utils

More complex data transformations, but still manageable.

---

## Testing Tips

1. **Start small**: Test one function at a time
2. **Test edge cases**: null, empty arrays, boundary values
3. **Use descriptive test names**: `should return 0 when score is 1`
4. **Group related tests**: Use `describe` blocks
5. **Run tests frequently**: `npm run test:windows -- --watch`

---

## Next Steps

After completing easy tests, you'll have:
- ✅ ~30-40% code coverage
- ✅ Confidence in utility functions
- ✅ Test examples for harder functions
- ✅ Foundation for testing components/hooks later

Then move on to:
- React hooks testing
- Component testing (with React Testing Library)
- API service testing (with mocks)

---

## File Locations

All test files should go in `__tests__` folders for larger directories:

```
src/features/modules/
├── calendar/
│   └── utils/
│       └── __tests__/
│           ├── eventRegistrationUtils.test.ts
│           └── eventDetailsExtractor.test.ts
├── math/
│   └── shared/
│       └── __tests__/
│           └── numberUtils.test.ts
└── edtech/
    └── progressReport/
        └── utils/
            └── __tests__/
                ├── missionUtils.test.ts
                ├── assessmentColumnUtils.test.ts
                └── progressReportUtils.test.ts
```



