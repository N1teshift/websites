import { ItemData } from "@/types/items";
import { resolveExplicitIcon } from "@/features/modules/content/guides/utils/iconMap";
import {
  getDefaultIconPath,
  ITTIconCategory,
} from "@/features/modules/content/guides/utils/iconUtils";

function toIconCategory(item: ItemData): ITTIconCategory {
  return item.category === "buildings" ? "buildings" : "items";
}

export function getItemIconPathFromRecord(item: ItemData): string {
  if (item.iconPath) return item.iconPath;
  const category = toIconCategory(item);
  const explicit = resolveExplicitIcon(category, item.name);
  if (explicit) return explicit;
  return getDefaultIconPath();
}
