# API Route Patterns

Common patterns for API route handlers.

**Important:** All handlers should import from `@websites/infrastructure/api` and include `@/config/auth`:

```typescript
import { createPostHandler, requireSession } from "@websites/infrastructure/api";
// Import auth config to ensure default auth is registered
import "@/config/auth";
```

## Authentication & Authorization

**Public Endpoint:**

```typescript
import { createGetHandler } from "@websites/infrastructure/api";
import "@/config/auth";

export default createGetHandler(
  async (req: NextApiRequest) => {
    // Public - no auth required
    return await getPublicData();
  },
  {
    requireAuth: false,
    cacheControl: { maxAge: 300, public: true },
  }
);
```

**Authenticated Endpoint:**

```typescript
import { createPostHandler, requireSession } from "@websites/infrastructure/api";
import "@/config/auth";

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context); // Guaranteed to exist
    // Use session.discordId, session.user, etc.
    return await createData(req.body);
  },
  {
    requireAuth: true, // Uses default auth config automatically
  }
);
```

**Optional Authentication (Mixed Routes):**

For routes where GET is public but POST needs auth:

```typescript
import { createGetPostHandler, requireSession } from "@websites/infrastructure/api";
import "@/config/auth";

export default createGetPostHandler(
  async (req: NextApiRequest, res, context) => {
    if (req.method === "GET") {
      return await getPublicData();
    }

    if (req.method === "POST") {
      // Session is available even with requireAuth: false
      // because default auth config is registered
      const session = requireSession(context);
      return await createData(req.body);
    }
  },
  {
    requireAuth: false, // GET is public, POST checks auth manually
  }
);
```

**Admin-Only Endpoint:**

```typescript
import { createPostHandler, requireSession } from "@websites/infrastructure/api";
import "@/config/auth";

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context); // Guaranteed to exist and be admin
    return await adminOperation(req.body);
  },
  {
    requireAdmin: true, // Automatically requires auth + admin role using default auth config
  }
);
```

## Query Parameter Parsing

```typescript
import {
  createGetHandler,
  parseQueryString,
  parseQueryInt,
  parsePagination,
} from "@websites/infrastructure/api";
import "@/config/auth";

export default createGetHandler(async (req: NextApiRequest) => {
  const search = parseQueryString(req, "q");
  const page = parseQueryInt(req, "page", 1) || 1;
  const { limit, offset } = parsePagination(req, 20, 100);

  return await searchData(search, { limit, offset });
});
```

## Request Validation

**📘 See [Zod Validation Migration Guide](../../operations/zod-validation-migration.md) for comprehensive validation patterns.**

```typescript
import { createPostHandler, zodValidator } from "@websites/infrastructure/api";
import "@/config/auth";
import { z } from "zod";

// Define schema in src/features/infrastructure/api/schemas.ts
const CreateDataSchema = z.object({
  name: z.string().min(1).max(100, "name must be at most 100 characters"),
  email: z.string().email("email must be a valid email address"),
});

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    // Validation happens automatically via validateBody option
    const data = req.body as z.infer<typeof CreateDataSchema>; // Already validated and typed
    return await createData(data);
  },
  {
    requireAuth: true,
    validateBody: zodValidator(CreateDataSchema),
  }
);
```

## Resource Ownership Check

```typescript
import {
  createPostHandler,
  requireSession,
  parseRequiredQueryString,
} from "@websites/infrastructure/api";
import "@/config/auth";
import { checkResourceOwnership } from "@/lib/api-wrapper";

export default createPostHandler(
  async (req: NextApiRequest, res, context) => {
    const session = requireSession(context);
    const resourceId = parseRequiredQueryString(req, "id");

    const resource = await getResource(resourceId);
    if (!resource) {
      throw new Error("Resource not found");
    }

    // Check if user owns the resource or is admin
    const hasAccess = await checkResourceOwnership(resource, session);
    if (!hasAccess) {
      throw new Error("You do not have permission to modify this resource");
    }

    return await updateResource(resourceId, req.body);
  },
  {
    requireAuth: true,
  }
);
```

## Related Documentation

- [Code Patterns Index](../code-patterns.md)
- [Adding API Routes](../adding-api-routes.md)
- [Authentication & Authorization](../../security/authentication-authorization.md)
- [Input Validation](../../security/input-validation.md)
