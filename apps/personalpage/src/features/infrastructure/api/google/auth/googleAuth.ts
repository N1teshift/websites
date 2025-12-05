import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { getGoogleConfig, validateGoogleConfig } from "../config";

const logger = createComponentLogger('GoogleAuth');

// Shared helper for service account GoogleAuth creation
function createServiceAccountAuth() {
    logger.debug("Creating service account authentication");
    
    // Get and validate configuration
    const config = getGoogleConfig();
    const configErrors = validateGoogleConfig(config, { requireServiceAccountKey: true });
    if (configErrors.length > 0) {
        const errorMsg = `Google configuration errors: ${configErrors.join(', ')}`;
        logger.error(errorMsg, new Error(errorMsg), {
            component: 'GoogleAuth',
            operation: 'createServiceAccountAuth'
        });
        throw new Error(errorMsg);
    }
    
    const keyFileContent = config.serviceAccountKey;
    if (!keyFileContent) {
        logger.error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is missing", 
            new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY"), {
            component: 'GoogleAuth',
            operation: 'createServiceAccountAuth'
        });
        throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable");
    }
    
    try {
        logger.debug("Parsing service account key JSON");
        const credentials = JSON.parse(keyFileContent);
        
        // Validate that the key has required fields
        if (!credentials.client_email || !credentials.private_key) {
            logger.error("Service account key is missing required fields", 
                new Error("Invalid service account key format"), {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                hasClientEmail: !!credentials.client_email,
                hasPrivateKey: !!credentials.private_key,
                hasProjectId: !!credentials.project_id,
                hasType: !!credentials.type
            });
            throw new Error("Invalid service account key format - missing client_email or private_key");
        }
        
        // Additional validation for service account key structure
        if (credentials.type !== 'service_account') {
            logger.error("Service account key has incorrect type", 
                new Error("Invalid service account key type"), {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                expectedType: 'service_account',
                actualType: credentials.type
            });
            throw new Error("Invalid service account key type - expected 'service_account'");
        }
        
        if (!credentials.project_id) {
            logger.warn("Service account key missing project_id", {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                clientEmail: credentials.client_email
            });
        }
        
        logger.info("Service account key parsed successfully", {
            clientEmail: credentials.client_email,
            projectId: credentials.project_id,
            type: credentials.type
        });
        
        return new google.auth.GoogleAuth({
            credentials,
            scopes: config.scopes,
        });
    } catch (parseError) {
        if (parseError instanceof SyntaxError) {
            logger.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY as JSON", 
                parseError, {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                errorType: 'json_parse_error'
            });
            throw new Error("Invalid JSON format in GOOGLE_SERVICE_ACCOUNT_KEY environment variable");
        } else if (parseError instanceof Error) {
            logger.error("Service account key validation failed", 
                parseError, {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                errorType: 'validation_error'
            });
            throw parseError;
        } else {
            logger.error("Unexpected error during service account key processing", 
                new Error(String(parseError)), {
                component: 'GoogleAuth',
                operation: 'createServiceAccountAuth',
                errorType: 'unexpected_error',
                originalError: parseError
            });
            throw new Error("Unexpected error processing service account key");
        }
    }
}

/**
 * Creates and returns a Google OAuth2 client instance configured for user authentication.
 *
 * Uses configuration from the centralized config module.
 * @returns An instance of `google.auth.OAuth2`.
 */
export function getOAuth2Client() {
    const config = getGoogleConfig();
    const configErrors = validateGoogleConfig(config, {
        requireServiceAccountKey: false,
        requireOAuthClient: true,
    });
    if (configErrors.length > 0) {
        throw new Error(`Google configuration errors: ${configErrors.join(', ')}`);
    }
    
    return new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        process.env.GOOGLE_REDIRECT_URI
    );
}

/**
 * Creates and returns a Google JWT client instance configured for service account authentication.
 *
 * Uses the service account key provided via the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable.
 * @returns A promise that resolves with an instance of `google.auth.JWT`.
 * @throws Will throw an error if the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable is missing or invalid.
 */
export async function getServiceAccountAuth(): Promise<JWT> {
    logger.debug("Getting service account auth client");
    const auth = createServiceAccountAuth();
    const client = await auth.getClient() as JWT;
    logger.info("Service account auth client created successfully");
    return client;
}

// Optional: Create calendar instance for the service account use case
/**
 * Creates and returns a Google Calendar API client instance authenticated using a service account.
 *
 * Uses the service account key provided via the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable.
 * @returns An instance of the Google Calendar API client (v3).
 * @throws Will throw an error if the `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable is missing or invalid.
 */
export function getServiceAccountCalendar() {
    logger.debug("Creating Google Calendar API client");
    const auth = createServiceAccountAuth();
    const calendar = google.calendar({ version: "v3", auth });
    logger.info("Google Calendar API client created successfully");
    return calendar;
}



