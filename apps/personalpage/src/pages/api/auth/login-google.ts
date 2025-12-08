import { NextApiRequest, NextApiResponse } from "next";
import { getOAuth2Client } from "@websites/infrastructure/api/google/auth/googleAuth";
import { extractEventDetailsFromQuery } from "../../../features/modules/calendar/utils/eventDetailsExtractor";

/**
 * @file API route handler for initiating the Google OAuth login flow.
 * It extracts event details from the query, encodes them in the state parameter,
 * generates the Google Calendar authorization URL, and redirects the user.
 * @author Your Name
 */

/**
 * API route handler for initiating the Google OAuth 2.0 authorization code flow.
 *
 * This endpoint is typically triggered when a user wants to authenticate with Google
 * to grant calendar permissions.
 * 1. Extracts potential event details (like date, time, summary) from the request query.
 * 2. Encodes these details into the `state` parameter for the OAuth flow.
 * 3. Defines the necessary Google API scopes (e.g., `https://www.googleapis.com/auth/calendar`).
 * 4. Uses the Google Auth library (`getOAuth2Client`) to generate the authorization URL.
 * 5. Redirects the user to the Google login page with the generated URL.
 * The `state` parameter will be passed back in the callback request.
 *
 * @param {NextApiRequest} req - The incoming API request object (may contain query params for event details).
 * @param {NextApiResponse} res - The outgoing API response object (used for redirection).
 * @returns {Promise<void>} A promise that resolves when the redirection is initiated or an error occurs.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Step 1: Use the shared extractor to get event details
    const eventDetails = extractEventDetailsFromQuery(req);

    // Step 2: Encode the event details into a state parameter
    const state = encodeURIComponent(JSON.stringify(eventDetails));

    // Step 3: Set the required scopes for Google Calendar and user profile
    const scopes = ["https://www.googleapis.com/auth/calendar", "profile", "email"];

    // Step 4: Generate the auth URL with event details as state
    const oauth2Client = getOAuth2Client();

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: state,
    });

    // Step 5: Redirect the user to Google's OAuth login page
    res.redirect(url);
  } catch (error) {
    console.error("Error during login process:", error);
    res.status(500).json({ message: "Server error during login." });
  }
}
