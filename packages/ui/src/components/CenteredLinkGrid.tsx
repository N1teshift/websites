import React from "react";
import Link from "next/link";
import { useFallbackTranslation } from "@websites/infrastructure/i18n/client";
import { Card } from "./Card";
import { motion, AnimatePresence } from "framer-motion";

interface BaseLinkItem {
  titleKey: string;
  highlighted?: boolean;
  id?: string;
}
interface LeafLinkItem extends BaseLinkItem {
  href: string;
}
interface SplitLinkItem extends BaseLinkItem {
  splitLinks: Array<LeafLinkItem | SplitLinkItem>;
}
type LinkItem = LeafLinkItem | SplitLinkItem;
interface CenteredLinkGridProps {
  links: LinkItem[];
}
type DisplayItem =
  | {
      type: "leaf";
      item: LeafLinkItem;
      key: string;
      depth: number;
      groupSize: number;
    }
  | {
      type: "split";
      item: SplitLinkItem;
      key: string;
      depth: number;
      toggleKey: string;
      isCollapsed?: boolean;
    };

const STORAGE_KEY = "centeredLinkGrid_openSplits";

// Helper function to load state from localStorage (client-side only)
const loadStateFromStorage = (): string[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        return parsed;
      }
    }
  } catch (e) {
    // Note: This is a localStorage error, not critical enough for structured logging
    console.warn("Failed to load expanded state from localStorage:", e);
  }
  return [];
};

const CenteredLinkGrid: React.FC<CenteredLinkGridProps> = ({ links }) => {
  const { t } = useFallbackTranslation();
  // Always start with empty array to match server-side rendering (prevents hydration mismatch)
  const [openSplits, setOpenSplits] = React.useState<string[]>([]);
  const hasMounted = React.useRef(false);

  // Load persisted state from localStorage after mount (client-side only)
  // This runs after hydration, so server and client initial render match
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Load state from localStorage after component has mounted
    const savedState = loadStateFromStorage();
    if (savedState.length > 0) {
      setOpenSplits(savedState);
    }
    hasMounted.current = true;
  }, []);

  // Save state to localStorage whenever openSplits changes (but skip initial load)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip saving until after initial load from localStorage is complete
    if (!hasMounted.current) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openSplits));
    } catch (e) {
      // Note: This is a localStorage error, not critical enough for structured logging
      console.warn("Failed to save expanded state to localStorage:", e);
    }
  }, [openSplits]);

  const handleSplitToggle = React.useCallback((splitKey: string) => {
    setOpenSplits((current) =>
      current.includes(splitKey)
        ? current.filter((key) => key !== splitKey)
        : [...current, splitKey],
    );
  }, []);

  const getChildSpanClasses = React.useCallback(
    (groupSize: number | undefined) => {
      if (!groupSize || groupSize <= 3)
        return "col-span-1 md:col-span-1 lg:col-span-2";
      if (groupSize <= 6) return "col-span-1 md:col-span-1 lg:col-span-1";
      return "col-span-1 md:col-span-1 lg:col-span-1";
    },
    [],
  );

  const getDepthPaddingClass = React.useCallback((depth: number) => {
    if (depth === 0) return "";
    if (depth === 1) return "pl-2";
    if (depth === 2) return "pl-4";
    if (depth === 3) return "pl-6";
    return "pl-8";
  }, []);

  const getConnectorLineStyle = React.useCallback((depth: number) => {
    if (depth === 0) return {};
    const leftOffset = 0.75 + (depth - 1) * 0.5;
    return {
      "--connector-left": `-${leftOffset}rem`,
    } as React.CSSProperties;
  }, []);

  const flattenLinks = React.useCallback(
    (items: LinkItem[], parentKey?: string, depth = 0): DisplayItem[] => {
      const siblingCount = Math.max(1, items.length);
      return items.flatMap((link, index) => {
        const isSplitCard = "splitLinks" in link;
        const baseKey =
          link.id ??
          (isSplitCard
            ? `split-${link.titleKey}`
            : `${(link as LeafLinkItem).href}-${link.titleKey}`);
        const linkKey = parentKey
          ? `${parentKey}::${baseKey}-${index}`
          : `${baseKey}-${index}`;
        if (isSplitCard) {
          const splitItem = link as SplitLinkItem;
          const isActive = openSplits.includes(linkKey);
          if (isActive) {
            const header: DisplayItem = {
              type: "split",
              item: splitItem,
              key: `${linkKey}::header`,
              depth,
              isCollapsed: true,
              toggleKey: linkKey,
            };
            return [
              header,
              ...flattenLinks(splitItem.splitLinks, linkKey, depth + 1),
            ];
          }
          return [
            {
              type: "split",
              item: splitItem,
              key: linkKey,
              depth,
              toggleKey: linkKey,
            },
          ];
        }
        return [
          {
            type: "leaf",
            item: link as LeafLinkItem,
            key: linkKey,
            depth,
            groupSize: siblingCount,
          },
        ];
      });
    },
    [openSplits],
  );

  const displayItems = React.useMemo(
    () => flattenLinks(links),
    [links, flattenLinks],
  );
  return (
    <div className="flex flex-col items-center w-full max-w-6xl">
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8 w-full px-4"
      >
        <AnimatePresence mode="popLayout">
          {displayItems.map((displayItem) => {
            const isSplit = displayItem.type === "split";
            const isCollapsedSplit = isSplit && displayItem.isCollapsed;
            const isNested = displayItem.depth > 0;
            const depth = displayItem.depth;
            const colSpanClass = isSplit
              ? isNested
                ? "col-span-1 md:col-span-2 lg:col-span-2"
                : "col-span-2"
              : displayItem.depth === 0
                ? "col-span-2"
                : getChildSpanClasses(displayItem.groupSize);
            const depthPaddingClass = getDepthPaddingClass(depth);
            const wrapperBaseClasses = `w-full rounded-xl ${colSpanClass} ${depthPaddingClass}`;
            const wrapperShapeClass = isSplit
              ? isCollapsedSplit
                ? "min-h-[4rem]"
                : isNested
                  ? "min-h-[7rem]"
                  : "aspect-link-card"
              : isNested
                ? "min-h-[6.5rem]"
                : "aspect-link-card";
            const textSizeClass = isCollapsedSplit
              ? "text-sm"
              : isNested
                ? "text-base"
                : "text-xl";
            const paddingClass = isSplit
              ? isCollapsedSplit
                ? "p-4"
                : isNested
                  ? "p-5"
                  : "p-6"
              : isNested
                ? "p-4"
                : "p-6";

            // Common motion props
            const motionProps = {
              layout: true,
              initial: { opacity: 0, scale: 0.8 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.8 },
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 25,
              },
            };

            if (displayItem.type === "split") {
              const link = displayItem.item as SplitLinkItem;
              const wrapperHighlightClass = link.highlighted
                ? "relative p-1 rounded-xl overflow-hidden bg-rainbow-border bg-400 animate-animated-border"
                : "";
              const parentIndicatorClass = isNested
                ? "relative before:absolute before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-0.5 before:bg-brand before:rounded before:left-[var(--connector-left)]"
                : "";
              const connectorStyle = isNested
                ? getConnectorLineStyle(depth)
                : {};

              return (
                <motion.div
                  key={displayItem.key}
                  {...motionProps}
                  className={`${wrapperBaseClasses} ${wrapperHighlightClass} ${wrapperShapeClass} ${parentIndicatorClass}`}
                  style={connectorStyle}
                >
                  <button
                    type="button"
                    className="block w-full h-full"
                    onClick={() => handleSplitToggle(displayItem.toggleKey)}
                    title={t(link.titleKey)}
                  >
                    <Card
                      variant={link.highlighted ? "glass" : "default"}
                      className={`w-full h-full flex items-center justify-center ${textSizeClass} font-semibold text-center ${paddingClass} hover:shadow-md hover:border-accent/50 transition-colors ${isNested ? "border-l-4 border-l-brand" : ""}`}
                    >
                      <span
                        className={`break-words ${isCollapsedSplit ? "tracking-wide uppercase text-sm" : ""}`}
                      >
                        {t(link.titleKey)}
                      </span>
                    </Card>
                  </button>
                </motion.div>
              );
            }

            // Leaf item
            const link = displayItem.item as LeafLinkItem;
            const wrapperHighlightClass = link.highlighted
              ? "relative p-1 rounded-xl overflow-hidden bg-rainbow-border bg-400 animate-animated-border"
              : "";
            const childIndicatorClass = isNested
              ? "relative before:absolute before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-0.5 before:bg-brand before:rounded before:left-[var(--connector-left)]"
              : "";
            const connectorStyle = isNested ? getConnectorLineStyle(depth) : {};

            return (
              <motion.div
                key={displayItem.key}
                {...motionProps}
                className={`${wrapperBaseClasses} ${wrapperHighlightClass} ${wrapperShapeClass} ${childIndicatorClass}`}
                style={connectorStyle}
              >
                <Link
                  href={link.href}
                  className="block w-full h-full"
                  title={t(link.titleKey)}
                >
                  <Card
                    variant={link.highlighted ? "glass" : "default"}
                    className={`w-full h-full flex items-center justify-center ${textSizeClass} font-semibold text-center ${paddingClass} hover:shadow-md hover:border-accent/50 transition-colors ${isNested ? "border-l-4 border-l-brand" : ""}`}
                  >
                    <span className="break-words">{t(link.titleKey)}</span>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CenteredLinkGrid;
