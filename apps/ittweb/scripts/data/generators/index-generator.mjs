/**
 * Index generator - generates index.ts files for items, abilities, and units
 */

import fs from 'fs';
import path from 'path';

/**
 * Generate items index.ts file
 */
export function generateItemsIndex(itemsDir, itemsByCategory) {
  const content = `import { ItemData, ItemsByCategory, ItemCategory, ItemSubcategory } from '@/types/items';
import { RAW_MATERIALS_ITEMS } from './raw-materials';
import { WEAPONS_ITEMS } from './weapons';
import { ARMOR_ITEMS } from './armor';
import { POTIONS_ITEMS } from './potions';
import { SCROLLS_ITEMS } from './scrolls';
import { BUILDINGS_ITEMS } from './buildings';
import { UNKNOWN_ITEMS } from './unknown';

export { getItemIconPathFromRecord } from './iconUtils';
export { getItemByReplayId, getItemsByReplayIds } from './replayItemUtils';

export const ITEMS_DATA: ItemData[] = [
  ...(RAW_MATERIALS_ITEMS || []),
  ...(WEAPONS_ITEMS || []),
  ...(ARMOR_ITEMS || []),
  ...(POTIONS_ITEMS || []),
  ...(SCROLLS_ITEMS || []),
  ...(BUILDINGS_ITEMS || []),
  ...(UNKNOWN_ITEMS || []),
];

export const ITEMS_BY_CATEGORY: ItemsByCategory = ITEMS_DATA.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as ItemsByCategory);

export function getItemById(id: string): ItemData | undefined {
  return ITEMS_DATA.find(item => item.id === id);
}

export function getItemsByCategory(category: ItemCategory): ItemData[] {
  return ITEMS_BY_CATEGORY[category] || [];
}

export function getItemsBySubcategory(subcategory: ItemSubcategory): ItemData[] {
  return ITEMS_DATA.filter(item => item.subcategory === subcategory);
}

export function searchItems(query: string): ItemData[] {
  const lowercaseQuery = query.toLowerCase();
  return ITEMS_DATA.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.recipe?.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery))
  );
}

// getItemByReplayId and getItemsByReplayIds are exported from replayItemUtils.ts
`;
  
  fs.writeFileSync(path.join(itemsDir, 'index.ts'), content, 'utf-8');
  console.log('✅ Generated items/index.ts');
}

/**
 * Generate abilities index.ts file
 */
export function generateAbilitiesIndex(abilitiesDir, abilitiesByCategory) {
  const content = `// Re-export types
export type { AbilityCategory, AbilityData } from './types';

import type { AbilityCategory, AbilityData } from './types';
import { BASIC_ABILITIES } from './basic';
import { BEASTMASTER_ABILITIES } from './beastmaster';
import { GATHERER_ABILITIES } from './gatherer';
import { HUNTER_ABILITIES } from './hunter';
import { ITEM_ABILITIES } from './item';
import { MAGE_ABILITIES } from './mage';
import { PRIEST_ABILITIES } from './priest';
import { SCOUT_ABILITIES } from './scout';
import { THIEF_ABILITIES } from './thief';
import { BUILDING_ABILITIES } from './building';
import { BONUSHANDLER_ABILITIES } from './bonushandler';
import { BUFF_ABILITIES } from './buff';
import { AURADUMMY_ABILITIES } from './auradummy';
import { UNKNOWN_ABILITIES } from './unknown';

export const ABILITIES: AbilityData[] = [
  ...BASIC_ABILITIES,
  ...BEASTMASTER_ABILITIES,
  ...GATHERER_ABILITIES,
  ...HUNTER_ABILITIES,
  ...ITEM_ABILITIES,
  ...MAGE_ABILITIES,
  ...PRIEST_ABILITIES,
  ...SCOUT_ABILITIES,
  ...THIEF_ABILITIES,
  ...BUILDING_ABILITIES,
  ...BONUSHANDLER_ABILITIES,
  ...BUFF_ABILITIES,
  ...AURADUMMY_ABILITIES,
  ...UNKNOWN_ABILITIES,
];

export const ABILITY_CATEGORIES: Record<AbilityCategory, string> = {
  basic: 'Basic Abilities',
  hunter: 'Hunter Abilities',
  beastmaster: 'Beastmaster Abilities',
  mage: 'Mage Abilities',
  priest: 'Priest Abilities',
  thief: 'Thief Abilities',
  scout: 'Scout Abilities',
  gatherer: 'Gatherer Abilities',
  item: 'Item Abilities',
  building: 'Building Abilities',
  bonushandler: 'BonusHandler Abilities',
  buff: 'Buff Abilities',
  auradummy: 'Aura Dummy Abilities',
  unknown: 'Unknown Abilities'
};

export function getAbilitiesByCategory(category: AbilityCategory): AbilityData[] {
  return ABILITIES.filter(ability => ability.category === category);
}

export function getAbilitiesByClass(classSlug: string): AbilityData[] {
  return ABILITIES.filter(ability => ability.classRequirement === classSlug);
}

export function getAbilityById(id: string): AbilityData | undefined {
  return ABILITIES.find(ability => ability.id === id);
}

export function searchAbilities(query: string): AbilityData[] {
  const lowerQuery = query.toLowerCase();
  return ABILITIES.filter(ability => 
    ability.name.toLowerCase().includes(lowerQuery) ||
    ability.description.toLowerCase().includes(lowerQuery) ||
    ability.id.toLowerCase().includes(lowerQuery)
  );
}
`;
  
  fs.writeFileSync(path.join(abilitiesDir, 'index.ts'), content, 'utf-8');
  console.log('✅ Generated abilities/index.ts');
}

/**
 * Generate units index.ts file
 */
export function generateUnitsIndex(unitsDir) {
  const content = `export * from './classes';
export * from './derivedClasses';
export * from './allUnits';
`;
  
  fs.writeFileSync(path.join(unitsDir, 'index.ts'), content, 'utf-8');
  console.log('✅ Generated units/index.ts');
}

/**
 * Generate abilities types.ts file
 * Automatically includes all categories found in the data
 */
export function generateAbilitiesTypes(abilitiesDir, abilitiesByCategory) {
  // Get all categories from the data, sorted alphabetically for consistency
  const categories = Object.keys(abilitiesByCategory || {}).sort();
  
  // Generate the type union string
  const categoryTypeUnion = categories
    .map(cat => `  | '${cat}'`)
    .join('\n');
  
  const content = `export type AbilityCategory = 
${categoryTypeUnion};

export type AbilityData = {
  id: string;
  name: string;
  category: AbilityCategory;
  classRequirement?: string;
  description: string;
  tooltip?: string;
  iconPath?: string;
  manaCost?: number;
  cooldown?: number;
  range?: number;
  duration?: number;
  damage?: string;
  effects?: string[];
  areaOfEffect?: number;
  maxTargets?: number;
  hotkey?: string;
  targetsAllowed?: string;
  castTime?: number | string;
  levels?: Record<string, any>;
  availableToClasses?: string[];
  spellbook?: 'hero' | 'normal';
  visualEffects?: {
    attachmentPoints?: (string | number)[];
    attachmentTarget?: string;
  };
  buttonPosition?: { x: number; y: number };
};
`;
  
  fs.writeFileSync(path.join(abilitiesDir, 'types.ts'), content, 'utf-8');
  console.log(`✅ Generated abilities/types.ts with ${categories.length} categories: ${categories.join(', ')}`);
}

/**
 * Generate items iconUtils.ts file
 */
export function generateItemsIconUtils(itemsDir) {
  const content = `import { ItemData } from '@/types/items';
import { resolveExplicitIcon } from '@/features/modules/content/guides/utils/iconMap';
import { getDefaultIconPath, ITTIconCategory } from '@/features/modules/content/guides/utils/iconUtils';

function toIconCategory(item: ItemData): ITTIconCategory {
  return item.category === 'buildings' ? 'buildings' : 'items';
}

export function getItemIconPathFromRecord(item: ItemData): string {
  if (item.iconPath) return item.iconPath;
  const category = toIconCategory(item);
  const explicit = resolveExplicitIcon(category, item.name);
  if (explicit) return explicit;
  return getDefaultIconPath();
}
`;
  
  fs.writeFileSync(path.join(itemsDir, 'iconUtils.ts'), content, 'utf-8');
  console.log('✅ Generated items/iconUtils.ts');
}


/**
 * Generate top-level data index.ts file (abilities, items, units, icon map, lazy loader)
 */
export function generateDataIndex(dataDir) {
  const exports = [
    "export * from './abilities';",
    "export * from './items';",
    "export * from './units';",
  ];

  // Only export iconMap if it exists in this directory
  const iconMapPath = path.join(dataDir, 'iconMap.ts');
  if (fs.existsSync(iconMapPath)) {
    exports.push("export * from './iconMap';");
  }

  // Only export lazyLoader if it exists in this directory
  const lazyLoaderPath = path.join(dataDir, 'lazyLoader.ts');
  if (fs.existsSync(lazyLoaderPath)) {
    exports.push("export * from './lazyLoader';");
  }

  const content = exports.join('\n') + '\n';

  fs.writeFileSync(path.join(dataDir, 'index.ts'), content, 'utf-8');
  console.log('✅ Generated data/index.ts');
}



