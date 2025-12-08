/**
 * @file Utility functions for checking AI system capabilities and limitations.
 * Used to prevent tests from running on systems that don't support certain object types.
 */

import { ObjectType } from "@math/types/mathTypes";

/**
 * Support level for an object type in a given system.
 */
export type SupportLevel = "full" | "partial" | "unsupported";

/**
 * System identifier.
 */
export type AISystem = "legacy" | "langgraph";

/**
 * Capability information for an object type in a system.
 */
export interface ObjectTypeCapability {
  /** The object type */
  objectType: ObjectType;
  /** Support level in the system */
  supportLevel: SupportLevel;
  /** Whether the system can process this type (full or partial) */
  canProcess: boolean;
  /** Reason for the support level (for debugging) */
  reason?: string;
}

/**
 * Object types that are fully supported by both System 1 and System 2.
 * These are the only types that should be used for testing.
 */
const SUPPORTED_OBJECT_TYPES: readonly ObjectType[] = [
  "coefficient",
  "coefficients",
  "term",
] as const;

/**
 * Mapping of object types to their support levels in System 1 (Legacy).
 * System 1 is restricted to only fully supported types: coefficient, coefficients, term.
 * All other types are unsupported.
 */
const LEGACY_CAPABILITIES: Record<ObjectType, SupportLevel> = {
  coefficient: "full",
  coefficients: "full",
  term: "full",
  expression: "unsupported", // Not implemented - restricted to supported types only
  equation: "unsupported", // Not implemented - restricted to supported types only
  terms: "unsupported", // Not implemented - restricted to supported types only
  inequality: "unsupported", // Not implemented - restricted to supported types only
  function: "unsupported", // Not implemented - restricted to supported types only
  point: "unsupported", // Not implemented - restricted to supported types only
  set: "unsupported", // Not implemented - restricted to supported types only
  interval: "unsupported", // Not implemented - restricted to supported types only
};

/**
 * Mapping of object types to their support levels in System 2 (LangGraph).
 * System 2 is restricted to only fully supported types: coefficient, coefficients, term.
 * All other types are unsupported.
 */
const LANGGRAPH_CAPABILITIES: Record<ObjectType, SupportLevel> = {
  coefficient: "full",
  coefficients: "full",
  term: "full",
  expression: "unsupported", // Not implemented - restricted to supported types only
  equation: "unsupported", // Not implemented - restricted to supported types only
  terms: "unsupported", // Not implemented - restricted to supported types only
  inequality: "unsupported", // Not implemented - restricted to supported types only
  function: "unsupported", // Not implemented - restricted to supported types only
  point: "unsupported", // Not implemented - restricted to supported types only
  set: "unsupported", // Not implemented - restricted to supported types only
  interval: "unsupported", // Not implemented - restricted to supported types only
};

/**
 * Reasons for support levels (for debugging/informational purposes).
 */
const SUPPORT_REASONS: Record<ObjectType, { legacy?: string; langgraph?: string }> = {
  coefficient: {},
  coefficients: {},
  term: {},
  expression: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  equation: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  terms: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  inequality: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  function: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  point: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  set: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
  interval: {
    legacy: "System 1 is restricted to coefficient, coefficients, and term only",
    langgraph: "System 2 is restricted to coefficient, coefficients, and term only",
  },
};

/**
 * Gets the list of object types that are fully supported by both systems.
 * @returns Array of supported object types
 */
export function getSupportedObjectTypesList(): readonly ObjectType[] {
  return SUPPORTED_OBJECT_TYPES;
}

/**
 * Checks if a system can process a given object type.
 *
 * @param system The AI system to check
 * @param objectType The object type to check
 * @returns ObjectTypeCapability with support information
 */
export function getObjectTypeCapability(
  system: AISystem,
  objectType: ObjectType
): ObjectTypeCapability {
  const capabilities = system === "legacy" ? LEGACY_CAPABILITIES : LANGGRAPH_CAPABILITIES;
  const supportLevel = capabilities[objectType];
  const reason = SUPPORT_REASONS[objectType]?.[system];

  return {
    objectType,
    supportLevel,
    canProcess: supportLevel === "full" || supportLevel === "partial",
    reason,
  };
}

/**
 * Checks if a system can process a given object type (simple boolean).
 *
 * @param system The AI system to check
 * @param objectType The object type to check
 * @returns true if the system can process this type (full or partial support)
 */
export function canProcessObjectType(system: AISystem, objectType: ObjectType): boolean {
  return getObjectTypeCapability(system, objectType).canProcess;
}

/**
 * Gets all object types that a system can process.
 *
 * @param system The AI system to check
 * @param includePartial If true, includes partially supported types. Default: true
 * @returns Array of object types the system can process
 */
export function getSupportedObjectTypes(
  system: AISystem,
  includePartial: boolean = true
): ObjectType[] {
  const capabilities = system === "legacy" ? LEGACY_CAPABILITIES : LANGGRAPH_CAPABILITIES;
  const allTypes = Object.keys(capabilities) as ObjectType[];

  return allTypes.filter((type) => {
    const level = capabilities[type];
    return level === "full" || (includePartial && level === "partial");
  });
}

/**
 * Gets all object types that a system cannot process.
 *
 * @param system The AI system to check
 * @returns Array of object types the system cannot process
 */
export function getUnsupportedObjectTypes(system: AISystem): ObjectType[] {
  const capabilities = system === "legacy" ? LEGACY_CAPABILITIES : LANGGRAPH_CAPABILITIES;
  const allTypes = Object.keys(capabilities) as ObjectType[];

  return allTypes.filter((type) => capabilities[type] === "unsupported");
}

/**
 * Gets a summary of system capabilities.
 *
 * @param system The AI system to check
 * @returns Summary object with counts and lists
 */
export function getSystemCapabilitySummary(system: AISystem) {
  const capabilities = system === "legacy" ? LEGACY_CAPABILITIES : LANGGRAPH_CAPABILITIES;
  const allTypes = Object.keys(capabilities) as ObjectType[];

  const full = allTypes.filter((type) => capabilities[type] === "full");
  const partial = allTypes.filter((type) => capabilities[type] === "partial");
  const unsupported = allTypes.filter((type) => capabilities[type] === "unsupported");

  return {
    system,
    total: allTypes.length,
    full: {
      count: full.length,
      types: full,
    },
    partial: {
      count: partial.length,
      types: partial,
    },
    unsupported: {
      count: unsupported.length,
      types: unsupported,
    },
  };
}
