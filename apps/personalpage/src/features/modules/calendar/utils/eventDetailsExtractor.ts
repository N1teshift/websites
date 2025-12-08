import { SharedEventDetails } from "../types";
import { NextApiRequest } from "next";

/** Extracts shared event details from the query parameters of a Next.js API request. */
export function extractEventDetailsFromQuery(req: NextApiRequest): SharedEventDetails {
  const { summary, startDateTime, endDateTime } = req.query;

  if (!summary || !startDateTime || !endDateTime) {
    throw new Error("Missing event details.");
  }

  if (
    typeof summary !== "string" ||
    typeof startDateTime !== "string" ||
    typeof endDateTime !== "string"
  ) {
    throw new Error("Invalid event details format.");
  }

  return {
    summary,
    startDateTime,
    endDateTime,
    attendees: [
      {
        email:
          process.env.NEXT_PUBLIC_CALENDAR_EMAIL ??
          (() => {
            throw new Error("NEXT_PUBLIC_CALENDAR_EMAIL is not set");
          })(),
        name: process.env.NEXT_PUBLIC_CALENDAR_ATTENDEE_NAME ?? undefined,
      },
    ],
  };
}

/** Extracts shared event details from the body of a Next.js API request. */
export function extractEventDetailsFromBody(req: NextApiRequest): SharedEventDetails {
  const { summary, startDateTime, endDateTime, userEmail, userName, language, userPhone } =
    req.body;

  if (!summary || !startDateTime || !endDateTime || !userEmail || !language) {
    throw new Error("Missing event details.");
  }

  if (
    typeof summary !== "string" ||
    typeof startDateTime !== "string" ||
    typeof endDateTime !== "string" ||
    typeof userEmail !== "string" ||
    typeof language !== "string"
  ) {
    throw new Error("Invalid event details format.");
  }

  return {
    summary,
    startDateTime,
    endDateTime,
    attendees: [
      {
        email: userEmail,
        name: userName || "",
      },
    ],
    language,
    phoneNumber: userPhone || undefined,
  };
}
