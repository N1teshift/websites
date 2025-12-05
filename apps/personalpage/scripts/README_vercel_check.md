# Vercel Deployment Status Checker

This utility allows you (or the AI agent) to check Vercel deployment status.

## Methods

### 1. Vercel API (Recommended)

Requires a Vercel API token:

```bash
# Set your token
export VERCEL_TOKEN=your_token_here

# Check status
npm run check:vercel
```

Get your token from: https://vercel.com/account/tokens

### 2. Browser Automation (For AI Agent)

The AI agent can use browser automation tools to check the Vercel dashboard directly:

1. Navigate to: https://vercel.com/[your-username]/personalpage
2. Check the latest deployment status
3. Read build logs if needed

This doesn't require any tokens and works immediately.

## Usage by AI Agent

After pushing to git, the agent can:

1. **Wait a few seconds** for Vercel to start the build
2. **Check status** using either method above
3. **Report back** whether the build succeeded or failed

## Example Agent Workflow

```typescript
// After git push
1. Wait 10-15 seconds
2. Navigate to Vercel dashboard
3. Check latest deployment
4. Report: ✅ Build successful or ❌ Build failed with error details
```

