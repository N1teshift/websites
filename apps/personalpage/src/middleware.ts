import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Get allowed origins based on environment.
 * Uses environment variables for configuration, with sensible defaults for development.
 */
function getAllowedOrigins(): string[] {
    // Check for environment variable first
    const envOrigins = process.env.ALLOWED_ORIGINS;
    if (envOrigins) {
        return envOrigins.split(',').map(origin => origin.trim());
    }

    // Default origins for development
    const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', // For test mode
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ];

    // Add production origins if NODE_ENV is production
    if (process.env.NODE_ENV === 'production') {
        // Add your production domain(s) here
        defaultOrigins.push('https://www.simonasbernotas.lt');
        defaultOrigins.push('https://simonasbernotas.vercel.app');
        console.warn('CORS: No ALLOWED_ORIGINS environment variable set for production. Using default production origins.');
    }

    return defaultOrigins;
}

/**
 * Get allowed CORS methods from environment variable or use defaults.
 */
function getAllowedMethods(): string {
    return process.env.CORS_ALLOWED_METHODS || 'GET, POST, PUT, DELETE, OPTIONS';
}

/**
 * Get allowed CORS headers from environment variable or use defaults.
 */
function getAllowedHeaders(): string {
    return process.env.CORS_ALLOWED_HEADERS || 'Content-Type, Authorization';
}

/**
 * Check if the request origin is allowed.
 */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    return allowedOrigins.includes(origin);
}

/**
 * Middleware function to handle CORS for API routes.
 *
 * This function intercepts requests to API endpoints (`/api/*`).
 * It handles OPTIONS preflight requests by returning appropriate CORS headers.
 * For other request methods, it adds CORS headers to the response before passing it on.
 *
 * @param request The incoming Next.js request object.
 * @returns A Next.js response object, either a new response for OPTIONS or the modified original response.
 */
export function middleware(request: NextRequest) {
    // Only run this middleware for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        const allowedOrigins = getAllowedOrigins();
        const allowedMethods = getAllowedMethods();
        const allowedHeaders = getAllowedHeaders();
        const origin = request.headers.get('origin');
        
        // Determine the appropriate origin header
        let corsOrigin = '';
        if (origin && isOriginAllowed(origin, allowedOrigins)) {
            corsOrigin = origin;
        } else if (allowedOrigins.length > 0) {
            // If origin is not allowed, use the first allowed origin as fallback
            corsOrigin = allowedOrigins[0];
        }

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Methods': allowedMethods,
                    'Access-Control-Allow-Headers': allowedHeaders,
                    'Access-Control-Allow-Origin': corsOrigin,
                },
            })
        }

        // Handle actual requests
        const response = NextResponse.next()
        
        // Add CORS headers to all API responses
        response.headers.set('Access-Control-Allow-Origin', corsOrigin)
        response.headers.set('Access-Control-Allow-Methods', allowedMethods)
        response.headers.set('Access-Control-Allow-Headers', allowedHeaders)
        
        return response
    }

    return NextResponse.next()
}

/**
 * Configuration object for the middleware.
 * Specifies which paths the middleware should run on.
 */
export const config = {
    /**
     * A matcher string or array of strings to determine which paths the middleware applies to.
     * This example applies the middleware to all routes under `/api/`.
     * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
     */
    matcher: '/api/:path*',
} 



