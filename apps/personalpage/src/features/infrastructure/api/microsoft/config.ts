/**
 * Microsoft API-specific configuration
 * Contains only Microsoft-related environment variables and settings
 */

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  graphApiUrl: string;
  scopes: string[];
  authority: string;
  redirectUri?: string;
}

/**
 * Get Microsoft configuration from environment variables
 */
export function getMicrosoftConfig(): MicrosoftConfig {
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID || process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || process.env.AZURE_CLIENT_SECRET || '',
    tenantId: process.env.MICROSOFT_TENANT_ID || process.env.AZURE_TENANT_ID || '',
    graphApiUrl: 'https://graph.microsoft.com/v1.0',
    scopes: [
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/.default', // For client credentials flow
    ],
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || process.env.AZURE_REDIRECT_URI,
  };
}

/**
 * Validate Microsoft configuration
 */
export function validateMicrosoftConfig(config: MicrosoftConfig): string[] {
  const errors: string[] = [];

  if (!config.clientId) {
    errors.push('MICROSOFT_CLIENT_ID or AZURE_CLIENT_ID is required');
  }
  if (!config.clientSecret) {
    errors.push('MICROSOFT_CLIENT_SECRET or AZURE_CLIENT_SECRET is required');
  }
  if (!config.tenantId) {
    errors.push('MICROSOFT_TENANT_ID or AZURE_TENANT_ID is required');
  }

  return errors;
}



