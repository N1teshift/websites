import React from "react";
import Image from "next/image";
import { Tooltip } from "@/features/infrastructure/components";
import { getItemByReplayId } from "@/features/modules/content/guides/data/items";
import { formatTimeMMSS } from "../utils/craftUtils";
import type { CraftEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

interface CraftOrderDisplayProps {
  crafts: CraftEvent[];
  className?: string;
}

/**
 * Display crafting order as icons with time badges
 */
export function CraftOrderDisplay({ crafts, className = "" }: CraftOrderDisplayProps) {
  if (!crafts || crafts.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {crafts.map((craft, index) => {
        const itemData = getItemByReplayId(craft.itemId);
        const timeFormatted = formatTimeMMSS(craft.timeSeconds);

        // Use item data if available, otherwise use placeholder
        // Handle iconPath similar to PlayerItems - check if it already includes full path
        const iconPath = itemData?.iconPath
          ? itemData.iconPath.startsWith("/")
            ? itemData.iconPath
            : `/icons/itt/${itemData.iconPath}`
          : "/icons/itt/btncancel.png"; // Placeholder icon
        const itemName = itemData?.name || `Item ${craft.itemId}`;

        return (
          <Tooltip key={`${craft.itemId}-${index}-${craft.timeSeconds}`} content={itemName}>
            <div className="relative w-10 h-10">
              <Image
                src={iconPath}
                alt={itemName}
                width={40}
                height={40}
                className="w-10 h-10"
                unoptimized
                onError={(e) => {
                  // Fallback to placeholder if icon fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = "/icons/itt/btncancel.png";
                }}
              />
              {/* Time badge in bottom right corner */}
              <div className="absolute bottom-0 right-0 h-4 bg-black border border-amber-700 rounded flex items-center justify-center px-1">
                <span className="text-[9px] text-amber-400 font-bold leading-none whitespace-nowrap">
                  {timeFormatted}
                </span>
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
