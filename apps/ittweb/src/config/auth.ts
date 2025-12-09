/**
 * Authentication configuration for ITT Web app.
 * This module registers the default auth configuration for all API handlers.
 *
 * This file is imported early to ensure auth is configured before any API routes are accessed.
 * The registration happens at module load time (server-side only).
 */

import { registerDefaultAuthConfig } from "@websites/infrastructure/api";
import { getIttwebAuthConfig } from "@/lib/auth-config";

// Register the default auth config when this module is loaded
// This happens once per Node.js process, so it's safe to call at module level
registerDefaultAuthConfig(getIttwebAuthConfig());
