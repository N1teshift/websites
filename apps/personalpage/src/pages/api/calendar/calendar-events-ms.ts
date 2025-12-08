import { NextApiRequest, NextApiResponse } from "next";
import { createMicrosoftCalendarClient } from "@websites/infrastructure/api/microsoft";
import { createComponentLogger } from "@websites/infrastructure/logging";

/**
 * API route handler for fetching Microsoft Calendar events.
 *
 * Expects a GET request. It uses the Microsoft Calendar API client to fetch events
 * then calls the Microsoft Graph API (`/v1.0/users/{userPrincipalName}/events`) to fetch events
 * for the user specified by the `USER_PRINCIPAL_NAME` environment variable.
 * Returns the list of events (the `value` array from the Graph API response).
 * Includes detailed error handling for Axios and other potential errors.
 *
 * @param {NextApiRequest} req - The incoming API request object.
 * @param {NextApiResponse} res - The outgoing API response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const logger = createComponentLogger("CalendarEventsMS", "handler");

  if (req.method === "GET") {
    try {
      logger.info("Fetching Microsoft Calendar events using API client");

      // Use the new Microsoft Calendar API client
      const microsoftClient = createMicrosoftCalendarClient();
      const events = await microsoftClient.getCalendarEvents("default");

      logger.info("Successfully fetched calendar events", { eventCount: events.length });
      res.status(200).json(events);
    } catch (error) {
      // Error is already handled by the Microsoft client with proper logging
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        "Failed to fetch calendar events",
        error instanceof Error ? error : new Error(errorMessage)
      );

      res.status(500).json({
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
