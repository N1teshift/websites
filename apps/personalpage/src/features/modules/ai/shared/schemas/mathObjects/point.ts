/**
 * @file Defines a JSON schema for validating the structure of `PointSettings`.
 * This schema specifies the required properties (`coefficients`, `name`, `showName`)
 * and their expected types and enum values.
 *
 * Note: A Zod schema serving a similar purpose may be defined in `src/features/infrastructure/ai/systems/langgraph/runnables.ts`
 *       and is used for structured output parsing in the LangGraph implementation.
 */
export const pointSettingsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "PointSettings",
  type: "object",
  description: "Settings for a mathematical point object",
  properties: {
    coefficients: {
      type: "object",
      description: "Settings for the coefficients representing the point's coordinates",
      properties: {
        collectionCount: {
          type: "number",
          minimum: 1,
          description: "Number of coefficients in the collection",
        },
        rules: {
          type: "array",
          items: {
            type: "string",
            enum: ["increasing", "decreasing", "neq"],
          },
          description: "Rules for the coefficients (e.g., increasing, decreasing, not equal)",
        },
        range: {
          type: "array",
          items: { type: "number" },
          minItems: 2,
          maxItems: 2,
          description: "The numerical range [min, max] for the coefficients",
        },
      },
      required: ["collectionCount", "rules", "range"],
    },
    name: {
      type: "string",
      enum: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ],
      default: "A",
      description: "The name assigned to the point (typically a capital letter)",
    },
    showName: {
      type: "boolean",
      default: true,
      description:
        "If true, displays the point's name (e.g., 'A(1, 2)'). If false, only shows the coordinates '(1, 2)'",
    },
  },
  required: ["coefficients", "name", "showName"],
  additionalProperties: false,
} as const;
