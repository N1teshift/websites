import React from "react";
import Image from "next/image";
import { Tooltip } from "@/features/infrastructure/components";
import { getBuildingByReplayId, formatTimeMMSS } from "../utils/buildingUtils";
import type { BuildingEvent } from "@/features/modules/game-management/lib/mechanics/replay/types";

interface BuildingOrderDisplayProps {
  buildings: BuildingEvent[];
  className?: string;
}

/**
 * Display building order as icons with time badges
 */
export function BuildingOrderDisplay({ buildings, className = "" }: BuildingOrderDisplayProps) {
  if (!buildings || buildings.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {buildings.map((building, index) => {
        const buildingData = getBuildingByReplayId(building.buildingId);
        const timeFormatted = formatTimeMMSS(building.timeSeconds);

        // Use building data if available, otherwise use placeholder
        // Handle iconPath similar to PlayerItems - check if it already includes full path
        const iconPath = buildingData?.iconPath
          ? buildingData.iconPath.startsWith("/")
            ? buildingData.iconPath
            : `/icons/itt/${buildingData.iconPath}`
          : "/icons/itt/btncancel.png"; // Placeholder icon
        const buildingName = buildingData?.name || `Building ${building.buildingId}`;

        return (
          <Tooltip
            key={`${building.buildingId}-${index}-${building.timeSeconds}`}
            content={buildingName}
          >
            <div className="relative w-10 h-10">
              <Image
                src={iconPath}
                alt={buildingName}
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
