import { NextApiRequest, NextApiResponse } from "next";
import { createComponentLogger } from "@websites/infrastructure/logging";
import { createGoogleCalendarClient } from "@websites/infrastructure/api/google";

const logger = createComponentLogger("CalendarEventsGoogle", "handler");

/**
 * API route handler for fetching future Google Calendar events.
 *
 * Expects a GET request. It uses a service account to authenticate with the Google Calendar API
 * and fetches up to 50 upcoming events starting from a fixed date (Nov 1, 2024) from the
 * specified calendar (`scatman3333@gmail.com`).
 * Returns the list of events as a JSON array.
 *
 * @param {NextApiRequest} req - The incoming API request object.
 * @param {NextApiResponse} res - The outgoing API response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      logger.info("Fetching Google Calendar events using API client");

      const googleClient = createGoogleCalendarClient();
      const events = await googleClient.getCalendarEvents("primary");

      logger.info("Successfully fetched calendar events", { eventCount: events.length });
      res.status(200).json(events);
    } catch (error) {
      // Error is already handled by the Google client with proper logging
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
