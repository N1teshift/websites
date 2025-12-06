# Security Guide

**Complete guide to security best practices in @websites/infrastructure**

## Overview

This guide covers security best practices including authentication, input validation, web security, secrets management, and automated security scanning.

## Security Review Guidelines

### Before Deployment

Ensure the following security checks are completed:
- All API routes require authentication where needed (use `requireAuth: true` in `createApiHandler`)
- Firestore security rules configured and tested
- Input validation on all user inputs (use Zod schemas via `validateBody` option)
- Error messages don't expose sensitive information (handled automatically by `createApiHandler` in production)
- Environment variables properly configured (secrets in `.env.local`, not committed)
- File uploads validated (type, size, scanned if applicable)
- Security headers configured in `next.config.ts`
- Secrets not committed to repository (verified with Gitleaks scan)

### Ongoing Security Maintenance

Regular security maintenance should include:
- Review Firestore rules regularly for access control accuracy
- Audit user permissions and roles
- Monitor for suspicious activity (unusual API patterns, failed auth attempts)
- Keep dependencies updated (automated via security scanning workflow)
- Review security logs and error tracking (Sentry, Firebase logs)

## Authentication & Authorization

### Server-Side Checks

Always verify authentication server-side:

```typescript
import { createApiHandler, requireSession } from '@websites/infrastructure/api';

export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // Session is guaranteed when requireAuth: true
  },
  {
    requireAuth: true,
    authConfig: {
      getSession: (req, res) => getSession(req)
    }
  }
);
```

### Admin Access

```typescript
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
    // User is guaranteed to be admin
  },
  {
    requireAuth: true,
    requireAdmin: true,
    authConfig: {
      getSession: (req, res) => getSession(req),
      checkAdmin: async (session) => {
        const user = await getUserById(session.userId);
        return user?.role === 'admin';
      }
    }
  }
);
```

See [Authentication Guide](./authentication.md) for complete authentication patterns.

## Input Validation

### Zod Validation

Use Zod schemas for type-safe runtime validation:

```typescript
import { z } from 'zod';
import { zodValidator } from '@websites/infrastructure/api';

const CreateItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.number().positive('Value must be positive')
});

export default createApiHandler(
  async (req, res) => {
    // Body is already validated
    const data = req.body as z.infer<typeof CreateItemSchema>;
    return { data };
  },
  {
    validateBody: zodValidator(CreateItemSchema)
  }
);
```

**Benefits:**
- Automatic TypeScript type inference
- Consistent validation across all routes
- Better error messages
- Centralized schema definitions

### Sanitization

Sanitize user input before storing:

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

// For text fields
function sanitizeText(text: string): string {
  return text.trim().slice(0, 1000); // Limit length
}
```

## Web Security

### XSS Prevention

React automatically escapes content:

```typescript
// Safe - React escapes HTML
<div>{userInput}</div>

// Dangerous - only use with sanitized content
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### Content Security Policy

CSP is configured in `next.config.ts`:

```typescript
headers: [
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
      }
    ]
  }
]
```

### CSRF Protection

Next.js provides CSRF protection for API routes. Ensure:
- API routes use proper HTTP methods
- State-changing operations use POST/PUT/DELETE
- GET requests are idempotent

### Security Headers

Configure security headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
      ],
    },
  ];
}
```

## Firestore Security Rules

Always set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read, authenticated write
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Server-only writes
    match /playerStats/{playerId} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    
    // User-specific data
    match /userData/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == userId;
    }
  }
}
```

## Secrets Management

### Environment Variables

Never commit secrets to repository:

```bash
# .env.local (in .gitignore)
NEXTAUTH_SECRET=your-secret
FIREBASE_SERVICE_ACCOUNT_KEY=...
GOOGLE_CLIENT_SECRET=...
```

### Public vs Private

- `NEXT_PUBLIC_*` - Exposed to browser (Firebase client config)
- No prefix - Server-only (secrets, API keys)

### Don't Expose Sensitive Info

```typescript
// Production - generic error messages
// Development - full error details
// Automatically handled by createApiHandler

logError(error, 'Operation failed', {
  component: 'myComponent',
  operation: 'myOperation',
  userId: session?.userId, // Log for debugging
  // Don't return sensitive data to client
});
```

## File Uploads

### Validate File Types

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

### Scan Uploads

Consider scanning uploaded files for malware (production).

## Rate Limiting

### API Rate Limiting

Implement rate limiting for API routes:

```typescript
// Simple in-memory rate limiting
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60000; // 1 minute
  const maxRequests = 100;
  
  const requests = rateLimit.get(ip) || [];
  const recent = requests.filter(time => now - time < window);
  
  if (recent.length >= maxRequests) {
    return false;
  }
  
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
}
```

## Automated Security Scanning

### Dependency Vulnerability Scanning

**What it does:**
- Runs `npm audit` on every push and pull request
- Fails build on critical vulnerabilities
- Creates GitHub issues for high vulnerabilities (weekly schedule)

**How to use:**
1. View results in GitHub Actions tab
2. Download `audit-results.json` artifact for details
3. Fix vulnerabilities: `npm audit fix` (if safe)
4. Update dependencies: `npm update` or `npm install package@latest`

**Configuration:**
- Audit level: `moderate` (reports moderate, high, and critical)
- Critical vulnerabilities: Fail build immediately
- High vulnerabilities: Create GitHub issue (weekly)

### Secrets Scanning

**What it does:**
- Scans codebase for accidentally committed secrets
- Uses Gitleaks for detection
- Scans full git history

**What it scans for:**
- API keys and tokens
- Passwords and credentials
- Firebase service account keys
- NextAuth secrets
- OAuth secrets
- Other common secret patterns

**How to use:**
1. View results in GitHub Actions tab
2. Download `gitleaks-results.json` artifact for details
3. If false positive: Add to allowlist in `.gitleaks.toml`
4. If real secret: Rotate the secret immediately

### Manual Security Checks

**Run locally:**
```bash
# Dependency audit
npm audit

# Fix vulnerabilities (if safe)
npm audit fix

# Secrets scan (requires Gitleaks)
gitleaks detect --source . --verbose
```

## Responding to Security Issues

### If Vulnerability Found

1. Review the vulnerability details
2. Check if fix is available: `npm audit fix`
3. Update dependency if needed
4. Test thoroughly after update
5. Re-run audit to verify fix

### If Secret Found

1. **Immediately rotate the secret**
2. Remove secret from git history (if possible)
3. Add to `.gitleaks.toml` allowlist if false positive
4. Review access logs for compromised secret
5. Update documentation if secret format changed

## Quick Reference

### Authentication
```typescript
export default createApiHandler(
  async (req, res, context) => {
    const session = requireSession(context);
  },
  { requireAuth: true }
);
```

### Input Validation
```typescript
export default createApiHandler(
  async (req, res) => {
    const data = req.body as z.infer<typeof CreateItemSchema>;
  },
  { validateBody: zodValidator(CreateItemSchema) }
);
```

### Error Handling
```typescript
// Errors automatically sanitized in production
logError(error, 'Operation failed', {
  component: 'MyComponent',
  operation: 'myOperation',
});
```

## Related Documentation

- [Authentication Guide](./authentication.md) - Authentication patterns
- [Error Handling Guide](./error-handling.md) - Error handling patterns
- [API Patterns Guide](./api-patterns.md) - API route handler patterns
