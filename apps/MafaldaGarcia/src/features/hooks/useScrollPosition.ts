import { useState, useEffect } from "react";

export const useScrollPosition = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      setScrollY(currentScrollY);

      // Check if we're within 100px of the bottom
      const isNearBottom = currentScrollY + windowHeight >= documentHeight - 100;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { isAtBottom, scrollY };
};
