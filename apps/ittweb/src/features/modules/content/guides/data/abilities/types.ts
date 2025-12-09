export type AbilityCategory =
  | "auradummy"
  | "basic"
  | "beastmaster"
  | "bonushandler"
  | "buff"
  | "building"
  | "gatherer"
  | "hunter"
  | "item"
  | "mage"
  | "priest"
  | "scout"
  | "thief"
  | "unknown";

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
  spellbook?: "hero" | "normal";
  visualEffects?: {
    attachmentPoints?: (string | number)[];
    attachmentTarget?: string;
  };
  buttonPosition?: { x: number; y: number };
};
