# Environment Variable Validation Analysis

## Current State

### ✅ ittweb (Has Validation)

- **Location**: `apps/ittweb/scripts/utils/validate-env.js`
- **Integration**: Build script includes `pnpm run validate:env &&`
- **Required Variables**:
  - Firebase Client: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`
  - NextAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
  - Discord OAuth: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
  - Firebase Admin: `FIREBASE_SERVICE_ACCOUNT_KEY`

### ❌ MafaldaGarcia (No Validation)

**Environment Variables Used**:

- `NEXT_PUBLIC_PLACEHOLDER_URL` (optional - used for image placeholders)
- `FIREBASE_SERVICE_ACCOUNT_KEY` (required - Firebase Admin SDK)
- `FIREBASE_STORAGE_BUCKET` (required - Firebase Storage)
- `FIREBASE_DATABASE_URL` (required - Firebase Realtime Database)

**Infrastructure Dependencies**:

- Uses `@websites/infrastructure` which requires Firebase client config
- Uses Firebase Storage for images
- Uses Firebase Admin SDK for server-side operations

**Risk**: App can build but will fail at runtime if Firebase env vars are missing.

### ❌ personalpage (No Validation)

**Environment Variables Used**:

- **NextAuth** (Required):
  - `NEXTAUTH_SECRET` (required - NextAuth configuration)
  - `GOOGLE_CLIENT_ID_LOGIN` (optional - Google OAuth)
  - `GOOGLE_CLIENT_SECRET_LOGIN` (optional - Google OAuth)
  - `AZURE_CLIENT_ID` (optional - Azure AD OAuth)
  - `AZURE_CLIENT_SECRET` (optional - Azure AD OAuth)
  - `AZURE_TENANT_ID` (optional - Azure AD OAuth)
  - `GOOGLE_USER_AUTH_REDIRECT_URI` (optional - Google user auth)
  - `AZURE_REDIRECT_URI` (optional - Azure redirect)

- **Calendar Integration** (Required):
  - `NEXT_PUBLIC_CALENDAR_EMAIL` (required - throws error if missing)
  - `NEXT_PUBLIC_CALENDAR_TIMEZONE` (optional - defaults to "Europe/Vilnius" or "UTC")
  - `NEXT_PUBLIC_CALENDAR_ONLINE_MEETING_PROVIDER` (optional - defaults to "teamsForBusiness")
  - `NEXT_PUBLIC_GOOGLE_CALENDAR_API_URL` (required - calendar API endpoint)

- **API Configuration**:
  - `NEXT_PUBLIC_API_BASE_URL` (optional - defaults to empty string)
  - `NEXT_PUBLIC_BASE_URL` (optional - defaults to "http://localhost:3000")

- **Firebase** (Required):
  - `FIREBASE_SERVICE_ACCOUNT_KEY` (required - Firebase Admin SDK)
  - `FIREBASE_SERVICE_ACCOUNT_KEY_*` (dynamic - per database)
  - `FIREBASE_DATABASE_URL_*` (dynamic - per database)
  - Firebase client config (likely required via infrastructure package)

- **Feature Flags**:
  - `NEXT_PUBLIC_FEATURE_*` (optional - feature flags)
  - `NEXT_PUBLIC_TEST_MODE` (optional - test mode)

**Risk**:

- **HIGH**: `NEXTAUTH_SECRET` missing will break authentication
- **HIGH**: `NEXT_PUBLIC_CALENDAR_EMAIL` missing will throw runtime errors
- **MEDIUM**: Missing OAuth credentials will disable login features
- **MEDIUM**: Missing Firebase config will break database operations

### ❌ templatepage (No Validation)

**Environment Variables Used**:

- None found in code (minimal app)
- May inherit from `@websites/infrastructure` package requirements

**Infrastructure Dependencies**:

- Uses `@websites/infrastructure` which may require Firebase client config
- Uses NextAuth infrastructure (may require `NEXTAUTH_SECRET`)

**Risk**: Low (minimal app), but may fail if infrastructure requires env vars.

---

## Infrastructure Package Requirements

### Firebase Client (`packages/infrastructure/src/firebase/client.ts`)

**Required Variables**:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Admin (`packages/infrastructure/src/firebase/admin.ts`)

**Required Variables**:

- `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)

### NextAuth (`packages/infrastructure/src/auth/nextauth/config.ts`)

**Required Variables**:

- `NEXTAUTH_SECRET` (required for production)

---

## Critical Issues Identified

### 1. **Missing Validation in personalpage**

- **Critical**: `NEXTAUTH_SECRET` is required but not validated
- **Critical**: `NEXT_PUBLIC_CALENDAR_EMAIL` throws runtime error if missing
- **High**: Missing Firebase config will break database operations
- **Impact**: App can build successfully but fail at runtime

### 2. **Missing Validation in MafaldaGarcia**

- **High**: Firebase env vars required but not validated
- **Impact**: Image loading will fail, Firebase operations will fail

### 3. **Inconsistent Validation Logic**

- `ittweb` validates Firebase client vars, but other apps may only need Admin SDK
- `personalpage` has many optional OAuth vars that should be validated conditionally
- No validation for dynamic Firebase vars (`FIREBASE_SERVICE_ACCOUNT_KEY_*`)

### 4. **No Shared Validation Package**

- Validation script is app-specific
- Each app would need to duplicate validation logic
- No way to ensure consistency across apps

### 5. **CI Detection But No CI**

- `validate-env.js` skips validation in CI (`if (process.env.CI === "true")`)
- No CI/CD configuration exists
- This means validation never runs in automated environments

---

## Recommended Solution

### Phase 1: Create Shared Validation Package

1. Move validation script to `packages/infrastructure/scripts/validate-env.js`
2. Make it configurable per app (accepts required vars as parameter)
3. Create app-specific config files that define required vars

### Phase 2: Add Validation to All Apps

1. Create `apps/*/env.config.js` files that define required vars
2. Add `validate:env` script to all app `package.json` files
3. Update build scripts to include validation

### Phase 3: Standardize Validation Logic

1. Support conditional validation (e.g., OAuth vars only if OAuth is enabled)
2. Support dynamic vars (e.g., `FIREBASE_SERVICE_ACCOUNT_KEY_*`)
3. Better error messages with app-specific guidance

### Phase 4: Integration

1. Add validation to pre-commit hooks
2. Add validation to CI/CD (when CI is added)
3. Document env var requirements per app

---

## App-Specific Requirements Summary

### ittweb

- ✅ Has validation
- ✅ Firebase Client (all 6 vars)
- ✅ NextAuth (2 vars)
- ✅ Discord OAuth (2 vars)
- ✅ Firebase Admin (1 var)

### MafaldaGarcia

- ❌ No validation
- ⚠️ Firebase Admin (1 var) - **REQUIRED**
- ⚠️ Firebase Storage Bucket - **REQUIRED**
- ⚠️ Firebase Database URL - **REQUIRED**
- ⚠️ Firebase Client (inherited from infrastructure) - **REQUIRED**
- ℹ️ Placeholder URL (optional)

### personalpage

- ❌ No validation
- ⚠️ NextAuth Secret - **REQUIRED** (critical)
- ⚠️ Calendar Email - **REQUIRED** (throws error)
- ⚠️ Firebase Admin - **REQUIRED**
- ⚠️ Firebase Client (inherited) - **REQUIRED**
- ℹ️ OAuth vars (optional - Google/Azure)
- ℹ️ Calendar config (optional - timezone, provider)
- ℹ️ API base URL (optional)

### templatepage

- ❌ No validation
- ⚠️ May require Firebase Client (inherited)
- ⚠️ May require NextAuth Secret (if auth is used)
- ℹ️ Minimal requirements (needs investigation)

---

## Next Steps

1. **Immediate**: Create shared validation package
2. **This Week**: Add validation to all apps
3. **This Month**: Standardize validation logic and add CI integration
4. **Ongoing**: Document env var requirements and keep validation updated
