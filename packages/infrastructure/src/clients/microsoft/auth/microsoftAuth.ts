import { ConfidentialClientApplication } from "@azure/msal-node";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { getMicrosoftConfig, validateMicrosoftConfig } from "../config";

const logger = createComponentLogger('MicrosoftAuth');

/**
 * Creates and returns a Microsoft MSAL Confidential Client Application instance.
 *
 * Uses configuration from the centralized config module.
 * @returns An instance of `ConfidentialClientApplication`.
 */
export function createMSALClient(): ConfidentialClientApplication {
    logger.debug("Creating MSAL client");
    
    const config = getMicrosoftConfig();
    const configErrors = validateMicrosoftConfig(config);
    if (configErrors.length > 0) {
        const errorMsg = `Microsoft configuration errors: ${configErrors.join(', ')}`;
        logger.error(errorMsg, new Error(errorMsg), {
            component: 'MicrosoftAuth',
            operation: 'createMSALClient'
        });
        throw new Error(errorMsg);
    }
    
    const msalConfig = {
        auth: {
            clientId: config.clientId,
            authority: config.authority,
            clientSecret: config.clientSecret,
        },
    };
    
    logger.info("MSAL client created successfully", {
        clientId: config.clientId,
        authority: config.authority
    });
    
    return new ConfidentialClientApplication(msalConfig);
}

/**
 * Gets a valid access token using client credentials flow.
 *
 * @returns A promise that resolves with a valid access token.
 * @throws Will throw an error if token acquisition fails.
 */
export async function getAccessToken(): Promise<string> {
    logger.debug("Getting access token using client credentials flow");
    
    const cca = createMSALClient();
    
    try {
        const clientCredentialRequest = {
            scopes: ["https://graph.microsoft.com/.default"],
        };

        const tokenResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
        if (!tokenResponse || !tokenResponse.accessToken) {
            throw new Error("Failed to acquire access token");
        }

        logger.info("Successfully acquired access token", {
            expiresOn: tokenResponse.expiresOn?.toISOString()
        });
        
        return tokenResponse.accessToken;
    } catch (error) {
        logger.error("Failed to acquire access token", error instanceof Error ? error : new Error(String(error)), {
            component: 'MicrosoftAuth',
            operation: 'getAccessToken'
        });
        throw error;
    }
}

/**
 * Creates and returns a Microsoft Graph API client configuration.
 *
 * @returns Configuration object for Microsoft Graph API calls.
 */
export function getGraphApiConfig() {
    const _config = getMicrosoftConfig();
    return {
        baseUrl: _config.graphApiUrl,
        scopes: _config.scopes,
        authority: _config.authority,
    };
}



