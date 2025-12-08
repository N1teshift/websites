# Logging Migration Guide

This guide shows how to migrate existing console.log calls to the new Winston-based logging system.

## ✅ What's Already Implemented

### Core Files Created:

- `src/features/infrastructure/shared/utils/logger.ts` - Winston configuration
- `src/features/infrastructure/shared/utils/componentLogger.ts` - Component logger factory
- `src/features/infrastructure/shared/utils/errorLogger.ts` - Error handling utilities

### Already Migrated:

- `src/features/infrastructure/shared/utils/apiHelper.ts` - ✅ Complete migration

## 🔄 Migration Patterns

### 1. Replace Console Calls

**Before:**

```typescript
console.log("Making request to:", url);
console.error("API error:", error);
console.warn("Warning message");
```

**After:**

```typescript
import { createComponentLogger } from "@/features/infrastructure/shared/utils/componentLogger";

const logger = createComponentLogger("ComponentName", "methodName");
logger.info("Making request", { url });
logger.error("API error", error, { url });
logger.warn("Warning message");
```

### 2. Replace Custom Debug Logging

**Before:**

```typescript
import { logDebugMessage } from "./loggingUtils";
logDebugMessage("Processing data", "ComponentName", true);
```

**After:**

```typescript
import { createComponentLogger } from "@/features/infrastructure/shared/utils/componentLogger";

const logger = createComponentLogger("ComponentName");
logger.debug("Processing data");
```

### 3. Replace Error Handling

**Before:**

```typescript
try {
  // operation
} catch (error) {
  console.error("Operation failed:", error);
  throw error;
}
```

**After:**

```typescript
import { logAndThrow } from "@/features/infrastructure/shared/utils/errorLogger";

try {
  // operation
} catch (error) {
  logAndThrow(error, "Operation failed", {
    component: "ComponentName",
    operation: "methodName",
  });
}
```

## 📋 Files to Migrate (Priority Order)

### High Priority (API & Error Handling)

1. `src/features/infrastructure/ai/chains/BaseChain.ts` - Replace `logError` method
2. `src/features/infrastructure/ai/lang/nodes/completionNodes.ts` - Console.error calls
3. `src/features/infrastructure/ai/lang/nodes/processingNodes.ts` - Console.error calls
4. `src/features/infrastructure/ai/lang/invokeGraph.ts` - Console.log/error calls
5. `src/services/client/testResultsService.ts` - Console.log/error calls
6. `src/services/server/testResultsService.ts` - Console.log/error calls

### Medium Priority (Core Features)

7. `src/features/modules/math/mathObjects/core/CoefficientGenerator.ts` - Console.error calls
8. `src/features/modules/math/mathObjectSettings/utils/mathObjectUtils.ts` - Console.warn/error calls
9. `src/features/infrastructure/shared/hooks/useFallbackTranslation.ts` - Console.log calls
10. `src/pages/api/firestore/saveTestResults.ts` - Console.log/error calls

### Low Priority (Utilities & Scripts)

11. `src/features/infrastructure/shared/utils/loggingUtils.ts` - Can be deprecated after migration
12. Scripts in `scripts/` directory - Console.log calls

## 🚀 Quick Migration Steps

### Step 1: Import the Logger

```typescript
import { createComponentLogger } from "@/features/infrastructure/shared/utils/componentLogger";
import { logAndThrow } from "@/features/infrastructure/shared/utils/errorLogger";
```

### Step 2: Create Component Logger

```typescript
const logger = createComponentLogger("ComponentName", "methodName");
```

### Step 3: Replace Console Calls

- `console.log()` → `logger.info()` or `logger.debug()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`

### Step 4: Add Context

```typescript
// Instead of:
console.log("Making request to:", url);

// Use:
logger.info("Making request", { url });
```

## 🎯 Benefits After Migration

1. **Environment-aware logging** - Debug in dev, warn+ in prod
2. **Structured logs** - Easy to parse and analyze
3. **File logging** - Errors saved to `logs/error.log`
4. **Error categorization** - Automatic error type detection
5. **Component tracking** - Know which component generated each log
6. **Performance** - Configurable log levels reduce overhead

## 🔧 Environment Configuration

### Development (Default)

- Log level: `debug`
- Console output: Colored, formatted
- File logging: All logs to `logs/all.log`, errors to `logs/error.log`

### Production

- Log level: `warn`
- Console output: Minimal
- File logging: Same as development

### Testing

- Log level: `error`
- Console output: Errors only
- File logging: Errors only

## 📝 Example: Complete Migration

**Before:**

```typescript
import { logDebugMessage } from "./loggingUtils";

const LOG_PREFIX = "MyComponent";

export async function myFunction() {
  logDebugMessage("Starting operation", LOG_PREFIX);

  try {
    const result = await someOperation();
    console.log("Operation successful:", result);
    return result;
  } catch (error) {
    console.error("Operation failed:", error);
    throw error;
  }
}
```

**After:**

```typescript
import { createComponentLogger } from "@/features/infrastructure/shared/utils/componentLogger";
import { logAndThrow } from "@/features/infrastructure/shared/utils/errorLogger";

export async function myFunction() {
  const logger = createComponentLogger("MyComponent", "myFunction");

  logger.info("Starting operation");

  try {
    const result = await someOperation();
    logger.info("Operation successful", { result });
    return result;
  } catch (error) {
    logAndThrow(error, "Operation failed", {
      component: "MyComponent",
      operation: "myFunction",
    });
  }
}
```

## 🧹 Cleanup After Migration

Once all files are migrated:

1. Remove `src/features/infrastructure/shared/utils/loggingUtils.ts`
2. Remove `GLOBAL_DEBUG_MODE` and `VERBOSE_MODE` constants
3. Remove unused console.log calls from scripts
4. Update documentation to reflect new logging patterns
