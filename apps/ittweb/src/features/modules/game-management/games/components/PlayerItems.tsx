import React from "react";
import Image from "next/image";
import { Tooltip } from "@/features/infrastructure/components";
import {
  getItemsByReplayIds,
  getItemByReplayId,
} from "@/features/modules/content/guides/data/items";
import { getItemIconPathFromRecord } from "@/features/modules/content/guides/data/items";

interface PlayerItemsProps {
  items?: number[];
  itemCharges?: number[]; // Item charges/stacks (parallel array to items)
  className?: string;
  showEmptySlots?: boolean; // If true, show empty slots (gray boxes) for items that are 0 or missing
}

/**
 * Helper function to determine if we should show the charge badge
 * Only show if itemCharges exists, matches items length, and charge > 1
 */
function shouldShowCharge(itemCharges: number[] | undefined, index: number): boolean {
  if (!itemCharges || itemCharges.length <= index) {
    return false;
  }
  const charge = itemCharges[index];
  return charge > 1;
}

/**
 * Display player inventory items as icons with tooltips
 */
export function PlayerItems({
  items,
  itemCharges,
  className = "",
  showEmptySlots = false,
}: PlayerItemsProps) {
  // If showEmptySlots is true, we show slots (even if empty) when items array exists
  if (showEmptySlots && items !== undefined) {
    // Ensure we have 8 slots (6 inventory + 2 equipment slots)
    const slots = items || [];
    const paddedSlots = [...slots];
    while (paddedSlots.length < 8) {
      paddedSlots.push(0);
    }

    return (
      <div className={`flex gap-1 flex-wrap items-center ${className}`}>
        {paddedSlots.slice(0, 8).map((itemId, index) => {
          const isEmpty = !itemId || itemId === 0;
          const isEquipmentSlot = index >= 6; // Slots 6-7 are equipment slots

          return (
            <React.Fragment key={`slot-${index}`}>
              {isEmpty ? (
                // Show empty slot icon
                <Tooltip content={isEquipmentSlot ? "Empty equipment slot" : "Empty slot"}>
                  <div className="w-10 h-10 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center overflow-hidden">
                    <Image
                      src="/icons/itt/nightelf-inventory-slotfiller.png"
                      alt="Empty slot"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover opacity-50"
                      unoptimized
                      onError={(e) => {
                        // Fallback to gray box if icon fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                </Tooltip>
              ) : (
                (() => {
                  // Use getItemByReplayId to get individual item (doesn't filter zeros)
                  const item = getItemByReplayId(itemId);

                  if (!item) {
                    // Unknown item - show placeholder
                    return (
                      <Tooltip key={`unknown-${index}`} content={`Unknown item (ID: ${itemId})`}>
                        <div className="w-10 h-10 bg-gray-800/30 border border-gray-600/30 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">?</span>
                        </div>
                      </Tooltip>
                    );
                  }

                  const iconPath = item.iconPath || getItemIconPathFromRecord(item);
                  // iconPath from getItemIconPathFromRecord already includes /icons/itt/ prefix
                  // If item.iconPath is just a filename, we need to construct the full path
                  const iconUrl = iconPath
                    ? iconPath.startsWith("/")
                      ? iconPath
                      : `/icons/itt/${iconPath}`
                    : null;

                  const showCharge = shouldShowCharge(itemCharges, index);

                  return (
                    <Tooltip
                      key={`${item.id}-${index}`}
                      content={item.name + (isEquipmentSlot ? " (Equipped)" : "")}
                    >
                      <div
                        className={`w-10 h-10 ${isEquipmentSlot ? "bg-blue-900/30 border-blue-500/30" : "bg-amber-900/30 border-amber-500/30"} border rounded flex items-center justify-center overflow-hidden relative`}
                      >
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                            unoptimized={iconUrl.startsWith("/icons/itt/")}
                            onError={(e) => {
                              // Fallback to text if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              if (target.nextSibling) {
                                (target.nextSibling as HTMLElement).style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          className="text-xs text-amber-400 font-bold"
                          style={{ display: iconUrl ? "none" : "block" }}
                        >
                          {item.name.substring(0, 2).toUpperCase()}
                        </span>
                        {showCharge && itemCharges && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-black border border-amber-700 rounded flex items-center justify-center">
                            <span className="text-[10px] text-amber-400 font-bold leading-none">
                              {itemCharges[index]}
                            </span>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  );
                })()
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Original behavior: only show items if they exist
  if (!items || items.length === 0) {
    return <span className="text-gray-600">-</span>;
  }

  // Build item data with original indices for itemCharges lookup
  const itemDataWithIndices: Array<{
    item: ReturnType<typeof getItemsByReplayIds>[0];
    originalIndex: number;
  }> = [];
  items.forEach((itemId, originalIndex) => {
    if (itemId && itemId !== 0) {
      const item = getItemByReplayId(itemId);
      if (item) {
        itemDataWithIndices.push({ item, originalIndex });
      }
    }
  });

  if (itemDataWithIndices.length === 0) {
    return <span className="text-gray-600">-</span>;
  }

  return (
    <div className={`flex gap-1 flex-wrap ${className}`}>
      {itemDataWithIndices.map(({ item, originalIndex }, index) => {
        const iconPath = item.iconPath || getItemIconPathFromRecord(item);
        // iconPath from getItemIconPathFromRecord already includes /icons/itt/ prefix
        // If item.iconPath is just a filename, we need to construct the full path
        const iconUrl = iconPath
          ? iconPath.startsWith("/")
            ? iconPath
            : `/icons/itt/${iconPath}`
          : null;

        const showCharge = shouldShowCharge(itemCharges, originalIndex);

        return (
          <Tooltip key={`${item.id}-${index}`} content={item.name}>
            <div className="w-10 h-10 bg-amber-900/30 border border-amber-500/30 rounded flex items-center justify-center overflow-hidden relative">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={item.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized={iconUrl.startsWith("/icons/itt/")}
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.nextSibling) {
                      (target.nextSibling as HTMLElement).style.display = "block";
                    }
                  }}
                />
              ) : null}
              <span
                className="text-xs text-amber-400 font-bold"
                style={{ display: iconUrl ? "none" : "block" }}
              >
                {item.name.substring(0, 2).toUpperCase()}
              </span>
              {showCharge && itemCharges && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-black border border-amber-700 rounded flex items-center justify-center">
                  <span className="text-[10px] text-amber-400 font-bold leading-none">
                    {itemCharges[originalIndex]}
                  </span>
                </div>
              )}
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
