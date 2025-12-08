import { NextApiRequest, NextApiResponse } from "next";
import { createImageService } from "@websites/infrastructure/firebase/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const imageService = createImageService();
    const prefixParam = (req.query.prefix as string) || "";

    // List actual images available in the bucket under optional prefix
    const availableImages = await imageService.getAvailableImages(prefixParam);

    // Get signed URLs for the available images
    const images = await imageService.getImageUrlsWithPlaceholders(availableImages);

    return res.status(200).json({
      prefix: prefixParam,
      availableImages,
      images,
      count: availableImages.length,
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return res.status(500).json({ error: "Failed to list images" });
  }
}
