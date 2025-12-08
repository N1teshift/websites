/**
 * @file API route handler for initiating the Microsoft OAuth login flow.
 * It extracts event details from the query, encodes them in the state parameter,
 * generates the Microsoft Graph authorization URL, and redirects the user.
 * @author Your Name
 */

import { NextApiRequest, NextApiResponse } from "next";
import { createMSALClient } from "@websites/infrastructure/api/microsoft/auth/microsoftAuth";
import { extractEventDetailsFromQuery } from "../../../features/modules/calendar/utils/eventDetailsExtractor";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("MicrosoftLogin", "handler");

/**
 * API route handler for initiating the Microsoft OAuth 2.0 authorization code flow.
 *
 * This endpoint is typically triggered when a user wants to authenticate with Microsoft
 * to grant calendar permissions.
 * 1. Extracts potential event details (like date, time, summary) from the request query.
 * 2. Encodes these details into the `state` parameter for the OAuth flow.
 * 3. Defines the necessary Microsoft Graph API scopes (e.g., Calendars.ReadWrite).
 * 4. Uses the MSAL library (`cca`) to generate the authorization URL.
 * 5. Redirects the user to the Microsoft login page with the generated URL.
 * The `state` parameter will be passed back in the callback request.
 *
 * @param {NextApiRequest} req - The incoming API request object (may contain query params for event details).
 * @param {NextApiResponse} res - The outgoing API response object (used for redirection).
 * @returns {Promise<void>} A promise that resolves when the redirection is initiated or an error occurs.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Step 1: Use the shared extractor to get event details
    const EventDetails = extractEventDetailsFromQuery(req);

    // Step 2: Encode the event details into a state parameter
    const state = encodeURIComponent(JSON.stringify(EventDetails));

    // Step 3: Set the required scopes for Microsoft Calendar
    const scopes = [
      "profile",
      "openid",
      "email",
      "https://graph.microsoft.com/Calendars.ReadWrite",
      "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
      "https://graph.microsoft.com/User.Read",
    ];

    // Step 4: Generate the auth URL with event details as state
    const cca = createMSALClient();
    const authCodeUrlParameters = {
      scopes: scopes,
      redirectUri:
        process.env.AZURE_REDIRECT_URI || "http://localhost:3000/api/auth/callback-microsoft",
      state: state,
    };

    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);

    // Step 5: Redirect the user to Microsoft's OAuth login page
    logger.info("Redirecting to Microsoft OAuth login", { hasState: !!state });
    res.redirect(authUrl);
  } catch (error) {
    logger.error(
      "Error during login process",
      error instanceof Error ? error : new Error(String(error))
    );
    res.status(500).json({ message: "Server error during login." });
  }
}
