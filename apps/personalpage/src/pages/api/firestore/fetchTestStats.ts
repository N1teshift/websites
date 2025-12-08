import { NextApiRequest, NextApiResponse } from "next";
import { fetchTestStats } from "@/features/modules/math/tests/services/testResultsService";
import { createComponentLogger } from "@websites/infrastructure/logging";

const logger = createComponentLogger("FetchTestStatsAPI");

/**
 * API route handler for fetching test statistics.
 *
 * Expects a GET request. It calls the `fetchTestStats` service function
 * to retrieve aggregated test statistics from Firestore and returns them.
 *
 * @param {NextApiRequest} req - The incoming API request object.
 * @param {NextApiResponse} res - The outgoing API response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    logger.info("Fetching test stats from service...");
    const result = await fetchTestStats();

    logger.debug("Service result", {
      success: result.success,
      hasTests: !!result.tests,
      testCount: Array.isArray(result.tests) ? result.tests.length : 0,
      error: result.error,
    });

    if (result.success) {
      // Ensure tests is always an array, even if undefined
      const tests = result.tests || [];
      logger.info(`Returning ${tests.length} test statistics`);
      return res.status(200).json({ tests });
    } else {
      logger.error("Service returned error", new Error(result.error || "Unknown error"));
      return res.status(500).json({ error: result.error || "Failed to fetch test statistics" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    logger.error(
      "Error in fetchTestStats API",
      error instanceof Error ? error : new Error(errorMessage)
    );
    return res.status(500).json({ error: errorMessage });
  }
}
