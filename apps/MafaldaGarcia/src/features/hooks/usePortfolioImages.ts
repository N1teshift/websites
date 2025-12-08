import { useState, useEffect } from "react";

interface UsePortfolioImagesOptions {
  numImageSlots?: number;
  placeholderImage?: string;
  prefix?: string;
}

export function usePortfolioImages(options: UsePortfolioImagesOptions = {}) {
  const { numImageSlots = 16, placeholderImage = "education.jpg", prefix = "" } = options;

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        setError(null);
        // Single-placeholder mode: if a global placeholder is set, skip API
        const globalPlaceholder = process.env.NEXT_PUBLIC_PLACEHOLDER_URL;
        if (globalPlaceholder) {
          setImages(Array.from({ length: numImageSlots }, () => globalPlaceholder));
          return;
        }

        // Otherwise, try API for real images (will gracefully fallback server-side)
        const response = await fetch(
          `/api/images${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ""}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch images (${response.status})`);
        }

        const data: { availableImages: string[]; images: Record<string, string> } =
          await response.json();

        const resolvedUrls = (data.availableImages || [])
          .map((p) => data.images?.[p])
          .filter((u): u is string => Boolean(u));

        const placeholderUrl = `https://via.placeholder.com/800x600/f3f4f6/6b7280?text=${encodeURIComponent(placeholderImage)}`;
        const filled =
          resolvedUrls.length >= numImageSlots
            ? resolvedUrls.slice(0, numImageSlots)
            : [
                ...resolvedUrls,
                ...Array.from(
                  { length: numImageSlots - resolvedUrls.length },
                  () => placeholderUrl
                ),
              ];

        setImages(filled);
      } catch (error) {
        console.error("Error preparing images:", error);
        setError("Failed to load images");
        const globalPlaceholder = process.env.NEXT_PUBLIC_PLACEHOLDER_URL;
        const fallbackUrl =
          globalPlaceholder ||
          `https://via.placeholder.com/800x600/f3f4f6/6b7280?text=${encodeURIComponent(placeholderImage)}`;
        setImages(Array.from({ length: numImageSlots }, () => fallbackUrl));
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, [numImageSlots, placeholderImage, prefix]);

  return { images, loading, error };
}
