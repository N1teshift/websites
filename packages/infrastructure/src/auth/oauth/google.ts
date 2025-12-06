/**
 * Google OAuth utilities for user authentication
 */

import { google } from "googleapis";
import { createComponentLogger } from '../../logging';
import { getGoogleConfig, validateGoogleConfig } from '../../clients/google/config';

const logger = createComponentLogger('GoogleOAuth');

export interface OAuthState {
  returnUrl?: string;
  purpose?: 'user-auth' | 'calendar';
  [key: string]: unknown;
}

/**
 * Creates an OAuth2 client specifically for user login/authentication
 * Uses GOOGLE_CLIENT_ID_LOGIN and GOOGLE_CLIENT_SECRET_LOGIN environment variables
 */
export function createLoginOAuth2Client(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID_LOGIN || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET_LOGIN || '';
  
  if (!clientId) {
    const errorMsg = 'GOOGLE_CLIENT_ID_LOGIN is required for user authentication';
    logger.error(errorMsg, new Error(errorMsg));
    throw new Error(errorMsg);
  }
  
  if (!clientSecret) {
    const errorMsg = 'GOOGLE_CLIENT_SECRET_LOGIN is required for user authentication';
    logger.error(errorMsg, new Error(errorMsg));
    throw new Error(errorMsg);
  }
  
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}

/**
 * Creates a reusable OAuth2 client for calendar integration
 * Uses GOOGLE_CLIENT_ID_CALENDAR and GOOGLE_CLIENT_SECRET_CALENDAR
 * Can also be used for other Google API integrations
 */
export function createOAuth2Client(redirectUri: string) {
  const config = getGoogleConfig();
  const configErrors = validateGoogleConfig(config, {
    requireServiceAccountKey: false,
    requireOAuthClient: true,
  });
  
  if (configErrors.length > 0) {
    const errorMsg = `Google configuration errors: ${configErrors.join(', ')}`;
    logger.error(errorMsg, new Error(errorMsg));
    throw new Error(errorMsg);
  }
  
  return new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    redirectUri
  );
}

/**
 * Generates an OAuth authorization URL for user login/authentication
 * Uses login-specific OAuth client credentials
 */
export function generateLoginAuthUrl(
  redirectUri: string,
  scopes: string[],
  state?: OAuthState
): string {
  logger.debug('Generating login OAuth auth URL', { 
    redirectUri, 
    scopes: scopes.length,
    hasState: !!state 
  });
  
  const oauth2Client = createLoginOAuth2Client(redirectUri);
  
  const stateString = state ? encodeURIComponent(JSON.stringify(state)) : undefined;
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: stateString,
    prompt: 'consent'
  });
  
  logger.debug('Login OAuth auth URL generated');
  return url;
}

/**
 * Generates an OAuth authorization URL for calendar and other integrations
 * Uses standard OAuth client credentials
 */
export function generateAuthUrl(
  redirectUri: string,
  scopes: string[],
  state?: OAuthState
): string {
  logger.debug('Generating OAuth auth URL', { 
    redirectUri, 
    scopes: scopes.length,
    hasState: !!state 
  });
  
  const oauth2Client = createOAuth2Client(redirectUri);
  
  const stateString = state ? encodeURIComponent(JSON.stringify(state)) : undefined;
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: stateString,
    prompt: 'consent'
  });
  
  logger.debug('OAuth auth URL generated');
  return url;
}

/**
 * Exchanges authorization code for tokens (for user login)
 * Uses login-specific OAuth client credentials
 */
export async function exchangeLoginCodeForTokens(
  redirectUri: string,
  code: string
) {
  logger.debug('Exchanging login code for tokens');
  
  const oauth2Client = createLoginOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  logger.debug('Login tokens obtained');
  return { oauth2Client, tokens };
}

/**
 * Exchanges authorization code for tokens (for calendar and other integrations)
 * Uses standard OAuth client credentials
 */
export async function exchangeCodeForTokens(
  redirectUri: string,
  code: string
) {
  logger.debug('Exchanging code for tokens');
  
  const oauth2Client = createOAuth2Client(redirectUri);
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  logger.debug('Tokens obtained');
  return { oauth2Client, tokens };
}

/**
 * Gets user info from Google using the OAuth client
 */
export async function getUserInfo(oauth2Client: ReturnType<typeof createOAuth2Client>) {
  logger.debug('Fetching user info from Google');
  
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  });
  
  const userInfo = await oauth2.userinfo.get();
  
  logger.debug('User info fetched', { 
    hasId: !!userInfo.data.id,
    hasEmail: !!userInfo.data.email 
  });
  
  return {
    googleId: userInfo.data.id || '',
    email: userInfo.data.email,
    name: userInfo.data.name,
    picture: userInfo.data.picture
  };
}
