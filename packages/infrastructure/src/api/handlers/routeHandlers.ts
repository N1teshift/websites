import { NextApiRequest, NextApiResponse } from 'next';
import { createComponentLogger } from '../../logging';

/**
 * Generic session type that can be extended by apps
 * Apps can use their own session types (e.g., NextAuth Session, JWT SessionData)
 */
export type GenericSession = {
  userId?: string;
  user?: { id?: string; email?: string | null;[key: string]: any };
  expires?: string;
  [key: string]: any;
};

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Handler function type for API routes
 * Session is always available in context (may be null if user is not authenticated)
 * Use requireAuth: true to enforce authentication, or check context.session manually
 */
export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<T>>,
  context?: { session: GenericSession | null }
) => Promise<T>;

/**
 * Cache control options
 */
export interface CacheControlOptions {
  /** Max age in seconds - how long the response can be cached */
  maxAge?: number;
  /** Whether the response can be cached by public caches (browsers, CDNs) */
  public?: boolean;
  /** Whether the response must be revalidated with the server */
  mustRevalidate?: boolean;
  /** Whether the response can be stored in shared caches */
  private?: boolean;
}

/**
 * Resource ownership checker function
 * Returns true if the user has permission to access/modify the resource
 */
export type ResourceOwnershipChecker<T = unknown> = (
  resource: T,
  session: GenericSession
) => boolean | Promise<boolean>;

/**
 * Auth configuration for API handlers
 */
export interface AuthConfig {
  /** Function to get session from request */
  getSession: (req: NextApiRequest, res: NextApiResponse) => Promise<GenericSession | null>;
  /** Function to check if user is admin (optional, only used if requireAdmin is true) */
  checkAdmin?: (session: GenericSession) => Promise<boolean>;
}

/**
 * Options for API route handler
 */
export interface ApiHandlerOptions {
  methods?: HttpMethod[];
  requireAuth?: boolean;
  /** Require admin role (implies requireAuth: true) */
  requireAdmin?: boolean;
  /** Auth configuration - required if requireAuth or requireAdmin is true */
  authConfig?: AuthConfig;
  /** Function to check resource ownership - used with requireResourceOwnership */
  checkResourceOwnership?: ResourceOwnershipChecker;
  validateBody?: (body: unknown) => boolean | string;
  logRequests?: boolean;
  /** Cache control options - only applies to GET requests */
  cacheControl?: CacheControlOptions | false;
}

/**
 * Generic API route handler that standardizes:
 * - HTTP method validation
 * - Error handling
 * - Response formatting
 * - Logging
 * - Authentication
 */
export const createApiHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = {}
) => {
  const {
    methods = ['GET'],
    requireAuth = false,
    requireAdmin = false,
    authConfig,
    validateBody,
    logRequests = true,
  } = options;

  // requireAdmin implies requireAuth
  const needsAuth = requireAuth || requireAdmin;

  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    const logger = createComponentLogger('ApiHandler', req.url || 'unknown');
    const startTime = Date.now();

    try {
      // Log request if enabled
      if (logRequests) {
        logger.info('API request received', {
          method: req.method,
          url: req.url,
          body: req.body ? 'present' : 'none',
          query: req.query
        });
      }

      // Validate HTTP method
      if (!methods.includes(req.method as HttpMethod)) {
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`
        });
      }

      // Set cache headers for GET requests if cacheControl is configured
      if (req.method === 'GET' && options.cacheControl !== false && options.cacheControl) {
        const cacheOptions = options.cacheControl;
        const cacheParts: string[] = [];

        if (cacheOptions.maxAge !== undefined) {
          cacheParts.push(`max-age=${cacheOptions.maxAge}`);
        }

        if (cacheOptions.public) {
          cacheParts.push('public');
        } else if (cacheOptions.private) {
          cacheParts.push('private');
        }

        if (cacheOptions.mustRevalidate) {
          cacheParts.push('must-revalidate');
        }

        if (cacheParts.length > 0) {
          res.setHeader('Cache-Control', cacheParts.join(', '));
        }
      } else if (req.method === 'GET' && options.cacheControl === false) {
        // Explicitly disable caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      }

      // Validate request body if validator provided
      if (validateBody && req.body) {
        const validationResult = validateBody(req.body);
        if (typeof validationResult === 'string') {
          return res.status(400).json({
            success: false,
            error: validationResult
          });
        }
        if (!validationResult) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request body'
          });
        }
      }

      // Always fetch session (but only enforce it when requireAuth is true)
      // This allows routes with requireAuth: false to still access session for optional auth checks
      let session: GenericSession | null = null;
      if (authConfig) {
        session = await authConfig.getSession(req, res);
      }

      // Only enforce authentication if requireAuth or requireAdmin is true
      if (needsAuth) {
        if (!authConfig) {
          logger.error('Auth required but authConfig not provided', new Error('Missing authConfig'));
          return res.status(500).json({
            success: false,
            error: 'Server configuration error: authentication required but not configured'
          });
        }

        if (!session) {
          logger.warn('Unauthenticated request to protected endpoint', {
            method: req.method,
            url: req.url
          });
          return res.status(401).json({
            success: false,
            error: 'Authentication required'
          });
        }

        // Admin check if required
        if (requireAdmin) {
          if (!authConfig.checkAdmin) {
            logger.error('Admin check required but checkAdmin not provided', new Error('Missing checkAdmin'));
            return res.status(500).json({
              success: false,
              error: 'Server configuration error: admin check required but not configured'
            });
          }

          const isAdmin = await authConfig.checkAdmin(session);
          if (!isAdmin) {
            logger.warn('Unauthorized admin request', {
              method: req.method,
              url: req.url,
              userId: (session as any).discordId || (session as any).id || 'unknown'
            });
            return res.status(403).json({
              success: false,
              error: 'Admin access required'
            });
          }
        }

        logger.debug('Authentication verified', {
          userId: (session as any).discordId || (session as any).id || 'unknown',
          isAdmin: requireAdmin
        });
      }

      // Execute the handler with context (session is always available, but may be null)
      const context = { session };
      const result = await handler(req, res, context);

      // Log successful response
      if (logRequests) {
        logger.info('API request completed successfully', {
          method: req.method,
          url: req.url,
          duration: Date.now() - startTime
        });
      }

      // Return success response
      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const _errorStack = error instanceof Error ? error.stack : undefined;

      // Check if error has a statusCode property (for custom status codes like 404)
      const statusCode = (error as Error & { statusCode?: number })?.statusCode || 500;

      // Log error
      logger.error('API request failed', error instanceof Error ? error : new Error(errorMessage), {
        method: req.method,
        url: req.url,
        duration: Date.now() - startTime,
        error: errorMessage,
        statusCode
      });

      // Return error response with appropriate status code
      return res.status(statusCode).json({
        success: false,
        error: process.env.NODE_ENV === 'production' && statusCode === 500
          ? 'Internal server error'
          : errorMessage
      });
    }
  };
};

/**
 * Helper to create GET-only API handlers
 */
export const createGetHandler = <T = unknown>(handler: ApiHandler<T>, options?: Omit<ApiHandlerOptions, 'methods'>) => {
  return createApiHandler(handler, { ...options, methods: ['GET'] });
};

/**
 * Helper to create POST-only API handlers
 */
export const createPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['POST'] });
};

/**
 * Helper to create handlers that accept both GET and POST
 */
export const createGetPostHandler = <T = unknown>(
  handler: ApiHandler<T>,
  options?: Omit<ApiHandlerOptions, 'methods'>
) => {
  return createApiHandler(handler, { ...options, methods: ['GET', 'POST'] });
};

/**
 * Standard error response helper
 */
export const errorResponse = (res: NextApiResponse, status: number, message: string) => {
  return res.status(status).json({
    success: false,
    error: message
  });
};

/**
 * Standard success response helper
 */
export const successResponse = <T>(res: NextApiResponse, data: T, message?: string) => {
  return res.status(200).json({
    success: true,
    data,
    message
  });
};

/**
 * Helper to get authenticated session from handler context
 * Throws error if session is not available
 */
export function requireSession(context?: { session: GenericSession | null }): GenericSession {
  if (!context?.session) {
    throw new Error('Authentication required');
  }
  return context.session;
}

