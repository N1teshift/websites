# Environment Variables Strategy

This document describes the environment variable management strategy for all apps in the monorepo.

## Overview

Each app in the monorepo may require different environment variables based on its features. This document provides a centralized reference for:

- Required vs optional variables per app
- Variable validation approach
- Secrets management
- Local development setup
- CI/CD configuration

## General Principles

### Variable Naming

- **Public variables** (exposed to browser): Must be prefixed with `NEXT_PUBLIC_`
- **Server-only variables**: No prefix (e.g., `NEXTAUTH_SECRET`, `FIREBASE_SERVICE_ACCOUNT_KEY`)
- **Build-time variables**: Can be used in `next.config.ts` and during build

### File Priority (Next.js)

Next.js loads environment variables in this order (later files override earlier ones):

1. `.env` - Default values for all environments
2. `.env.local` - Local overrides (gitignored, never committed)
3. `.env.development` / `.env.production` - Environment-specific
4. `.env.development.local` / `.env.production.local` - Local environment-specific overrides

**Best Practice**: Use `.env.local` for local development secrets.

### Security

- **Never commit** `.env.local` files (already in `.gitignore`)
- **Never commit** secrets or API keys
- Use `.env.example` files to document required variables
- Use Vercel/GitHub Secrets for production deployments

## App-Specific Variables

### ittweb

#### Required Variables

**Firebase Client (Public)**

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase Project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase App ID

**NextAuth**

- `NEXTAUTH_URL` - Base URL of the application (e.g., `https://ittweb.vercel.app`)
- `NEXTAUTH_SECRET` - Secret key for NextAuth session encryption

**Discord OAuth**

- `DISCORD_CLIENT_ID` - Discord OAuth Client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth Client Secret

**Firebase Admin (Server-side)**

- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase Service Account JSON (stringified)

**Bot API**

- `BOT_API_KEY` - API key for bot operations (used in game scheduling endpoints)

#### Optional Variables

- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase Analytics Measurement ID
- `NEXT_PUBLIC_TWITCH_PARENT` - Comma-separated list of allowed parent domains for Twitch embeds
- `NEXT_PUBLIC_DISCORD_INVITE_URL` - Discord invite URL (defaults to fallback if not set)
- `ANALYZE` - Set to `"true"` to enable bundle analysis during build

#### Validation

ittweb includes a validation script that runs before builds:

```bash
pnpm --filter ittweb validate:env
```

The script:

- Checks for all required variables
- Validates they are not empty
- Skips validation in CI environments
- Provides helpful error messages

**Note**: The build script automatically runs validation: `pnpm run build` includes `validate:env`.

### personalpage

#### Required Variables

**Firebase (if using Firebase features)**

- Firebase variables similar to ittweb (check app-specific requirements)

**Microsoft/Azure (if using Microsoft Graph)**

- `AZURE_CLIENT_ID` - Azure AD Client ID
- `AZURE_CLIENT_SECRET` - Azure AD Client Secret
- `AZURE_TENANT_ID` - Azure AD Tenant ID

**OpenAI (if using AI features)**

- `OPENAI_API_KEY` - OpenAI API key

**Google APIs (if using Google services)**

- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

#### Optional Variables

- `NEXT_PUBLIC_TEST_MODE` - Enable test mode for development
- `ANALYZE` - Set to `"true"` to enable bundle analysis

#### Validation

Currently, personalpage does not have automated validation. Consider adding a validation script similar to ittweb.

### templatepage

#### Required Variables

None (minimal template app)

#### Optional Variables

- `ANALYZE` - Set to `"true"` to enable bundle analysis

### MafaldaGarcia

#### Required Variables

**Firebase (if using Firebase features)**

- Firebase variables similar to ittweb (check app-specific requirements)

#### Optional Variables

- `ANALYZE` - Set to `"true"` to enable bundle analysis

## Validation Strategy

### Current Implementation

**ittweb** has a validation script (`scripts/utils/validate-env.js`) that:

- Loads `.env.local` files
- Validates required variables
- Provides clear error messages
- Skips validation in CI (where env vars are managed differently)

### Recommended Approach

1. **Create `.env.example` files** for each app documenting required variables
2. **Add validation scripts** to apps that need them (similar to ittweb)
3. **Run validation in build scripts** before building
4. **Skip validation in CI** (where secrets are managed via platform secrets)

### Example Validation Script

```javascript
// scripts/validate-env.js
const requiredVars = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "Firebase API Key",
  // ... other required vars
};

function validateEnv() {
  if (process.env.CI === "true") {
    console.log("⚠️  Skipping validation in CI");
    return;
  }

  const missing = [];
  for (const [varName, description] of Object.entries(requiredVars)) {
    if (!process.env[varName]) {
      missing.push({ varName, description });
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach(({ varName, description }) => {
      console.error(`  - ${varName} (${description})`);
    });
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
}
```

## Secrets Management

### Local Development

1. **Copy `.env.example` to `.env.local`**:

   ```bash
   cp apps/ittweb/.env.example apps/ittweb/.env.local
   ```

2. **Fill in values** from your secure password manager or team secrets

3. **Never commit `.env.local`** (already gitignored)

### CI/CD (GitHub Actions)

Environment variables are managed via:

- **GitHub Secrets**: For sensitive values
- **GitHub Variables**: For non-sensitive configuration
- **Workflow environment variables**: For workflow-specific values

### Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add variables** for each environment (Production, Preview, Development)
3. **Use Vercel CLI** for local development:
   ```bash
   vercel env pull .env.local
   ```

### Best Practices

- **Use different secrets** for development, staging, and production
- **Rotate secrets regularly** (especially API keys and OAuth secrets)
- **Use least privilege** - only grant necessary permissions
- **Document secret sources** in team documentation (not in code)

## Common Variables

### Build-Time Variables

- `NODE_ENV` - Automatically set by Next.js (`development`, `production`, `test`)
- `ANALYZE` - Enable bundle analyzer (`"true"` to enable)

### Next.js Built-in

- `NEXT_PUBLIC_*` - Exposed to browser (must be prefixed)
- All other variables - Server-only by default

## Troubleshooting

### Variable Not Available in Browser

**Problem**: Variable works in server code but not in browser.

**Solution**: Ensure the variable is prefixed with `NEXT_PUBLIC_`:

```bash
# ❌ Wrong
API_KEY=xxx

# ✅ Correct
NEXT_PUBLIC_API_KEY=xxx
```

### Variable Not Loading

**Problem**: Variable defined in `.env.local` but not available.

**Solutions**:

1. Restart the Next.js dev server (env vars are loaded at startup)
2. Check file location (should be in app root, not monorepo root)
3. Check for typos in variable names
4. Verify `.env.local` is not gitignored incorrectly

### Validation Failing in CI

**Problem**: Validation script fails in GitHub Actions.

**Solution**: Ensure validation script skips CI:

```javascript
if (process.env.CI === "true") {
  console.log("⚠️  Skipping validation in CI");
  process.exit(0);
}
```

## Next Steps

1. **Create `.env.example` files** for all apps
2. **Add validation scripts** to apps that need them
3. **Document app-specific variables** in app READMEs
4. **Set up Vercel environment variables** for each deployment
5. **Consider using a secrets management service** for production (e.g., Vault, AWS Secrets Manager)

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
