# ITTWeb Consolidation Testing Checklist

## 🧪 Pre-Testing Verification

Before running tests, verify that all migrations are complete:

- [x] All duplicate files deleted
- [x] All imports updated to use shared packages
- [x] No broken import paths
- [x] Documentation updated

---

## 📋 Testing Checklist

### 1. Build Verification

- [ ] **Run TypeScript compilation**
  ```bash
  cd apps/ittweb
  npm run type-check
  # or
  npx tsc --noEmit
  ```
  - Expected: No TypeScript errors related to imports
  - Check for: Missing exports, broken import paths

- [ ] **Run Next.js build**
  ```bash
  cd apps/ittweb
  npm run build
  ```
  - Expected: Build completes successfully
  - Check for: Import errors, module resolution issues

---

### 2. Import Path Verification

Verify that all imports are correctly pointing to shared packages:

- [ ] **Monitoring imports**
  - Search for: `@/features/infrastructure/monitoring`
  - Expected: No results (all should be `@websites/infrastructure/monitoring`)

- [ ] **Logging imports**
  - Search for: `@/features/infrastructure/logging`
  - Expected: No results (all should be `@websites/infrastructure/logging`)

- [ ] **Utils imports**
  - Search for: `@/features/infrastructure/utils` (except serviceOperationWrapper)
  - Expected: Only serviceOperationWrapper should use local utils

- [ ] **Cache imports**
  - Search for: `@/features/infrastructure/lib/cache`
  - Expected: No results (all should be `@websites/infrastructure/cache`)

---

### 3. Unit Tests

- [ ] **Run all tests**
  ```bash
  cd apps/ittweb
  npm test
  ```
  - Expected: All tests pass
  - Check for: Mock path issues, import errors

- [ ] **Verify test mocks**
  - Check that test files mock `@websites/infrastructure/logging` correctly
  - Check that all jest.mock paths are updated

---

### 4. Runtime Verification

Test key functionality in development:

- [ ] **Start development server**
  ```bash
  cd apps/ittweb
  npm run dev
  ```
  - Expected: Server starts without errors
  - Check console for: Import errors, runtime errors

- [ ] **Test monitoring/logging**
  - Trigger an error (check browser console)
  - Verify error tracking still works
  - Verify logs appear correctly

- [ ] **Test caching**
  - Navigate to pages using SWR
  - Verify data fetching/caching works
  - Check network requests

- [ ] **Test utils**
  - Use pages that rely on timestamp/utils functions
  - Verify functionality is unchanged

---

### 5. Shared Package Verification

- [ ] **Verify shared package builds**
  ```bash
  cd packages/infrastructure
  npm run build
  ```
  - Expected: Shared package builds successfully
  - Check for: Export errors

- [ ] **Check exports**
  - Verify all migrated utilities are exported
  - Check package.json exports field

---

### 6. Specific Feature Testing

Test features that use migrated infrastructure:

- [ ] **API routes**
  - Test API routes that use logging
  - Verify error handling works
  - Check monitoring integration

- [ ] **Pages with caching**
  - Test pages using SWR cache
  - Verify data fetching works
  - Check cache behavior

- [ ] **Components using utils**
  - Test components using className utility
  - Verify styling works correctly

---

## 🐛 Common Issues to Check

### Import Errors
- **Symptom**: Module not found errors
- **Solution**: Verify import paths match package.json exports
- **Check**: TypeScript path mappings in tsconfig.json

### Mock Errors (Tests)
- **Symptom**: Tests fail with mock errors
- **Solution**: Update jest.mock paths to use shared package
- **Example**: `jest.mock('@websites/infrastructure/logging')`

### Circular Dependency Warnings
- **Symptom**: Warnings about circular dependencies
- **Solution**: Verify dynamic imports are used correctly (logging/monitoring)

### Build Errors
- **Symptom**: Next.js build fails
- **Solution**: Check that all shared packages are listed as dependencies

---

## ✅ Success Criteria

All of the following should pass:

1. ✅ TypeScript compilation succeeds with no errors
2. ✅ Next.js build completes successfully
3. ✅ All tests pass
4. ✅ Development server starts without errors
5. ✅ No console errors in browser/terminal
6. ✅ Functionality unchanged (monitoring, logging, caching, utils all work)

---

## 🔧 Quick Verification Commands

```bash
# Check for old import paths (should return minimal/no results)
cd apps/ittweb
grep -r "@/features/infrastructure/monitoring" src/
grep -r "@/features/infrastructure/logging" src/
grep -r "@/features/infrastructure/utils" src/ | grep -v serviceOperationWrapper

# Verify shared package exports
cd packages/infrastructure
npm run build

# Type check
cd apps/ittweb
npm run type-check

# Run tests
cd apps/ittweb
npm test
```

---

## 📝 Notes

- All migrations should be backward compatible
- No breaking changes were introduced
- If tests fail, check mock paths first
- If build fails, check import paths and exports

---

## 🆘 Troubleshooting

### Issue: Import not found
**Check**:
1. Is the package listed in `package.json` dependencies?
2. Is the export correct in shared package `package.json`?
3. Are path mappings correct in `tsconfig.json`?

### Issue: Test mocks failing
**Check**:
1. Mock path matches actual import path
2. Mock exports match actual exports
3. Jest configuration includes the package

### Issue: Build succeeds but runtime errors
**Check**:
1. Dynamic imports (logging/monitoring integration)
2. Browser console for errors
3. Server logs for errors

---

## 🎉 Ready for Testing!

All migrations are complete. Use this checklist to verify everything works correctly.
