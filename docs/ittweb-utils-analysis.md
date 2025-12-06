# ITTWeb Utils Analysis

## ✅ Current Status

Most utils are **already using the shared package** or are **identical duplicates** that can be safely removed.

---

## 🔍 Utils Comparison

### 1. objectUtils.ts - ✅ IDENTICAL

**Local**: `src/features/infrastructure/utils/object/objectUtils.ts`
**Shared**: `@websites/infrastructure/utils`

**Status**: ✅ **100% IDENTICAL**
- Same implementation
- Already exported from shared package
- Can be deleted

---

### 2. timestampUtils.ts - ✅ IDENTICAL

**Local**: `src/features/infrastructure/utils/time/timestampUtils.ts`
**Shared**: `@websites/infrastructure/utils`

**Status**: ✅ **100% IDENTICAL**
- Same implementation (205 lines)
- Already exported from shared package
- Can be deleted

---

### 3. accessibility/helpers.ts - ✅ ALMOST IDENTICAL

**Local**: `src/features/infrastructure/utils/accessibility/helpers.ts`
**Shared**: `@websites/infrastructure/utils`

**Status**: ✅ **FUNCTIONALLY IDENTICAL**
- Only difference: import path (local uses `@websites/infrastructure/logging`, shared uses relative)
- Same implementation (309 lines)
- Already exported from shared package
- Can be deleted

---

### 4. server/serverUtils.ts - ✅ IDENTICAL

**Local**: `src/features/infrastructure/utils/server/serverUtils.ts`
**Shared**: `@websites/infrastructure/utils`

**Status**: ✅ **100% IDENTICAL**
- Same implementation
- Already exported from shared package
- Can be deleted

---

### 5. service/serviceOperationWrapper.ts - ⚠️ PROJECT-SPECIFIC

**Local**: `src/features/infrastructure/utils/service/serviceOperationWrapper.ts`
**Shared**: ❌ **NOT IN SHARED PACKAGE**

**Status**: ⚠️ **PROJECT-SPECIFIC** - Should stay local

**Usage**:
- Used in `postService.ts`, `entryService.server.ts` (importing from `@websites/infrastructure/utils`)
- This appears to be a mistake - it's not in the shared package!
- Need to verify if this should be added to shared or if imports are wrong

---

## 📊 Files Using Local Utils

### Files Still Using Local Utils (Need Migration)

1. ✅ `src/pages/api/games/[id]/upload-replay.ts`
   - Uses: `timestampToIso`, `removeUndefined`
   - **Status**: Already migrated to shared package!

### Files Already Using Shared Utils

1. ✅ `src/features/modules/game-management/games/lib/gameService.update.server.ts`
   - Uses: `removeUndefined`, `createTimestampFactoryAsync` from `@websites/infrastructure/utils`

2. ✅ `src/features/modules/game-management/games/lib/gameService.create.server.ts`
   - Uses: `removeUndefined` from `@websites/infrastructure/utils`

3. ✅ `src/features/infrastructure/components/containers/Card.tsx`
   - Uses: `cn` from `@websites/infrastructure/utils`

4. ✅ `src/features/infrastructure/components/containers/Section.tsx`
   - Uses: `cn` from `@websites/infrastructure/utils`

5. ✅ `src/features/infrastructure/components/buttons/Button.tsx`
   - Uses: `cn` from `@websites/infrastructure/utils`

---

## ⚠️ Issue Found: serviceOperationWrapper

**Problem**: Files are importing `withServiceOperationNullable` from `@websites/infrastructure/utils`, but it's not exported from the shared package!

**Files Affected**:
- `src/features/modules/content/blog/lib/postService.ts`
- `src/features/modules/content/blog/lib/postService.server.ts`
- `src/features/modules/game-management/entries/lib/entryService.server.ts`

**Current State**:
- `serviceOperationWrapper.ts` exists only in local utils
- It's exported from local `utils/index.ts`
- But files import from shared package (which doesn't have it)

**Solution Options**:
1. Add `serviceOperationWrapper` to shared package (if it's generic enough)
2. Update imports to use local utils for this specific utility
3. Check if it's actually working (maybe there's a re-export somewhere)

---

## 📊 Analysis Result

**Status**: Ready for consolidation!

### Utils to Delete (Identical to Shared):
- ✅ `objectUtils.ts` - 100% identical
- ✅ `timestampUtils.ts` - 100% identical
- ✅ `accessibility/helpers.ts` - functionally identical
- ✅ `server/serverUtils.ts` - 100% identical

### Utils to Keep (Project-Specific):
- ⚠️ `service/serviceOperationWrapper.ts` - project-specific, but need to resolve import issue

---

## 🎯 Action Plan

1. ✅ **Already Done**: Migrate `upload-replay.ts` to use shared utils
2. 🔍 **Next**: Resolve `serviceOperationWrapper` import issue
3. 🗑️ **Next**: Delete duplicate utils files
4. 📝 **Next**: Update utils index to only export project-specific utilities

---

## 📝 Notes

- Most utils are already using shared package!
- Only one file needed migration: `upload-replay.ts` (already done)
- Need to resolve `serviceOperationWrapper` import path issue
