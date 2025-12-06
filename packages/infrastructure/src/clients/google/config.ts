/**
 * Google API-specific configuration
 * Contains only Google-related environment variables and settings
 */

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  calendarApiUrl: string;
  scopes: string[];
  serviceAccountKey?: string;
}

export interface GoogleConfigValidationOptions {
  requireServiceAccountKey?: boolean;
  requireOAuthClient?: boolean;
}

/**
 * Get Google configuration from environment variables
 * Uses calendar-specific OAuth credentials
 */
export function getGoogleConfig(): GoogleConfig {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID_CALENDAR || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET_CALENDAR || '',
    calendarApiUrl: 'https://www.googleapis.com/calendar/v3',
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  };
}

/**
 * Validate Google configuration
 */
export function validateGoogleConfig(
  config: GoogleConfig,
  options: GoogleConfigValidationOptions = { requireServiceAccountKey: true }
): string[] {
  const errors: string[] = [];
  const {
    requireServiceAccountKey = true,
    requireOAuthClient = false,
  } = options;

  if (requireServiceAccountKey && !config.serviceAccountKey) {
    errors.push('GOOGLE_SERVICE_ACCOUNT_KEY is required for service account authentication');
  }

  if (requireOAuthClient) {
    if (!config.clientId) {
      errors.push('GOOGLE_CLIENT_ID_CALENDAR is required when using OAuth client credentials');
    }
    if (!config.clientSecret) {
      errors.push('GOOGLE_CLIENT_SECRET_CALENDAR is required when using OAuth client credentials');
    }
  }

  return errors;
}



