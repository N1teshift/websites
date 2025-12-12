# Documentation Index

This directory contains all project documentation organized by topic. Use this index to navigate to the relevant documentation.

## 📁 Folder Structure

### [`setup/`](./setup/)

**Setup & Configuration** - Everything needed to set up and configure the project.

- **Configuration**
  - `POSTCSS_TAILWIND_CONFIG.md` - PostCSS/Tailwind configuration guide
  - `PRETTIER_SETUP.md` - Prettier setup and usage
  - `TYPESCRIPT_PATH_ALIASES.md` - TypeScript path alias conventions
  - `CONFIGURATION_SUMMARY.md` - Configuration documentation summary

- **Environment**
  - `ENVIRONMENT_VARIABLES.md` - Comprehensive environment variables guide
  - `ENVIRONMENT_SUMMARY.md` - Environment documentation summary

- **CI/CD**
  - `CI_CD_SETUP.md` - CI/CD setup and usage guide
  - `CI_TROUBLESHOOTING.md` - CI/CD troubleshooting guide
  - `CI_CD_SUMMARY.md` - CI/CD documentation summary

- **Dependencies**
  - `DEPENDENCY_UPGRADES.md` - Dependency upgrade process
  - `DEPENDENCY_FIXES_COMPLETED.md` - Completed dependency fixes
  - `DEPENDENCIES_SUMMARY.md` - Dependencies documentation summary

---

### [`architecture/`](./architecture/)

**Architecture & Design** - All architecture and design decisions.

- **Reviews & Audits**
  - `ARCHITECTURE_REVIEW.md` - Architecture patterns review (2025-01-27)
  - `INFRASTRUCTURE_AUDIT.md` - Infrastructure audit (2025-01-27)
  - `MONOREPO_REVIEW.md` - Comprehensive monorepo review (Jan 2025)
  - `CRITICAL_REVIEW.md` - Critical infrastructure review (Jan 2025)

- **Improvements & Plans**
  - `MONOREPO_IMPROVEMENTS.md` - Ongoing improvements tracking
  - `STRATEGIC_PLAN_AUTH_CONSOLIDATION.md` - Strategic plan for auth consolidation
  - `STRATEGIC_SUMMARY.md` - Strategic documentation summary

- **Consolidation**
  - `CONSOLIDATION_LEARNINGS.md` - ITTWeb consolidation learnings

---

### [`development/`](./development/)

**Development Standards** - Development practices and standards.

- **Standards**
  - `BUNDLE_SIZE_TRACKING.md` - Bundle size tracking and budgets
  - `SCRIPT_NAMING_CONVENTIONS.md` - Script naming conventions
  - `DOCUMENTATION_SUMMARY.md` - Documentation standards summary

- **Testing**
  - `TEST_INVENTORY.md` - Test inventory across the monorepo
  - `TESTING_SUMMARY.md` - Testing documentation summary

- **Improvements**
  - `IMPROVEMENTS.md` - Completed improvements summary
  - `OPTIONAL_STEPS_COMPLETED.md` - Completed optional steps
  - `IMPROVEMENTS_SUMMARY.md` - Improvements documentation summary

---

### Root Level

- **`README.md`** - This file (documentation index)
- **`KEY_LEARNINGS.md`** - Key learnings from monorepo migration & consolidation
- **`DOCUMENTATION_CLEANUP_SUMMARY.md`** - Documentation cleanup summary

---

## Quick Navigation

- **Setting up the project?** → [`setup/`](./setup/)
- **Understanding architecture?** → [`architecture/`](./architecture/)
- **Development standards?** → [`development/`](./development/)
- **Key learnings?** → [`KEY_LEARNINGS.md`](./KEY_LEARNINGS.md)

---

## Common Tasks

### Setting Up a New Developer

1. **Environment Setup** → [`setup/ENVIRONMENT_VARIABLES.md`](./setup/ENVIRONMENT_VARIABLES.md)
2. **CI/CD Overview** → [`setup/CI_CD_SETUP.md`](./setup/CI_CD_SETUP.md)
3. **Script Conventions** → [`development/SCRIPT_NAMING_CONVENTIONS.md`](./development/SCRIPT_NAMING_CONVENTIONS.md)

### Understanding the Architecture

1. **Architecture Review** → [`architecture/ARCHITECTURE_REVIEW.md`](./architecture/ARCHITECTURE_REVIEW.md)
2. **Monorepo Review** → [`architecture/MONOREPO_REVIEW.md`](./architecture/MONOREPO_REVIEW.md)
3. **Infrastructure Audit** → [`architecture/INFRASTRUCTURE_AUDIT.md`](./architecture/INFRASTRUCTURE_AUDIT.md)

### Development Standards

1. **Bundle Size** → [`development/BUNDLE_SIZE_TRACKING.md`](./development/BUNDLE_SIZE_TRACKING.md)
2. **Script Naming** → [`development/SCRIPT_NAMING_CONVENTIONS.md`](./development/SCRIPT_NAMING_CONVENTIONS.md)
3. **TypeScript Paths** → [`setup/TYPESCRIPT_PATH_ALIASES.md`](./setup/TYPESCRIPT_PATH_ALIASES.md)

---

## Documentation Structure

**Before:** 10 subfolders  
**After:** 3 main folders (70% reduction)

- ✅ **setup/** - All setup & configuration (12 files)
- ✅ **architecture/** - Architecture & design (8 files)
- ✅ **development/** - Development standards (8 files)

---

## Notes

- All documentation is organized by purpose, not by tool
- Related content is grouped together for easier discovery
- Summary documents provide quick reference for each category
