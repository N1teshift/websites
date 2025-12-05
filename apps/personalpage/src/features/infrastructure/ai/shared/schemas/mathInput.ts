/**
 * @file Defines a comprehensive JSON schema (`mathInputSchema`) for validating the structure of
 * an array of `MathInput` objects.
 *
 * This schema mirrors the TypeScript interfaces found in `@math/types/mathObjectSettingsInterfaces.ts`,
 * providing detailed definitions for each variant of the `MathInput` discriminated union and their
 * corresponding settings objects (e.g., `CoefficientSettings`, `TermSettings`).
 *
 * It includes:
 * - The top-level structure expecting an `objects` array.
 * - Definitions for each specific settings type (`CoefficientSettings`, `TermSettings`, etc.) specifying
 *   properties, types, enums, defaults, and required fields.
 * - Definitions for each `MathInput` variant (`CoefficientMathInput`, `TermMathInput`, etc.) which
 *   enforce the correct `objectType` and reference the corresponding settings definition.
 *
 * This schema was likely used for validating data structures, possibly in conjunction with legacy
 * systems or for validation outside the primary LLM interaction flow where Zod schemas are now preferred
 * (see `runnables.ts` and `src/features/infrastructure/ai/schemas/mathObjects/`).
 */
export const mathInputSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "MathInputObjects",
    "type": "object",
    "properties": {
        "objects": {
            "type": "array",
            "items": {
                "oneOf": [
                    { "$ref": "#/definitions/CoefficientMathInput" },
                    { "$ref": "#/definitions/CoefficientsMathInput" },
                    { "$ref": "#/definitions/TermMathInput" },
                    { "$ref": "#/definitions/TermsMathInput" },
                    { "$ref": "#/definitions/ExpressionMathInput" },
                    { "$ref": "#/definitions/EquationMathInput" },
                    { "$ref": "#/definitions/InequalityMathInput" },
                    { "$ref": "#/definitions/FunctionMathInput" },
                    { "$ref": "#/definitions/PointMathInput" },
                    { "$ref": "#/definitions/SetMathInput" },
                    { "$ref": "#/definitions/IntervalMathInput" }
                ]
            }
        }
    },
    "required": ["objects"],
    "definitions": {
        "CoefficientSettings": {
            "type": "object",
            "properties": {
                "numberSet": {
                    "type": "string",
                    "enum": ["real", "rational", "irrational", "integer", "natural"],
                    "default": "integer"
                },
                "representationType": {
                    "type": "string",
                    "enum": ["fraction", "mixed", "decimal", "root", "logarithm"],
                    "default": "decimal"
                },
                "rules": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["odd", "even", "square", "cube", "prime", "nonzero", "positive", "negative", "unit"]
                    },
                    "default": []
                },
                "range": {
                    "type": "array",
                    "items": { "type": "number" },
                    "minItems": 2,
                    "maxItems": 2,
                    "default": [-10, 10]
                }
            },
            "required": ["numberSet", "representationType", "rules", "range"]
        },
        "CoefficientsSettings": {
            "type": "object",
            "properties": {
                "coefficients": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/CoefficientSettings" }
                },
                "collectionCount": {
                    "type": "number",
                    "default": 1
                },
                "rules": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": ["increasing", "decreasing", "neq"]
                    },
                    "default": []
                }
            },
            "required": ["coefficients", "collectionCount", "rules"]
        },
        "TermSettings": {
            "type": "object",
            "properties": {
                "coefficients": { "$ref": "#/definitions/CoefficientsSettings" },
                "power": {
                    "type": "array",
                    "items": { "type": "number" },
                    "minItems": 2,
                    "maxItems": 2,
                    "default": [1, 1]
                },
                "termIds": {
                    "type": "array",
                    "items": { "type": "string" },
                    "default": ["2"]
                },
                "powerOrder": {
                    "type": "boolean",
                    "default": true
                },
                "variableName": {
                    "type": "string",
                    "default": "x"
                }
            },
            "required": ["coefficients", "power", "termIds", "powerOrder", "variableName"]
        },
        "TermsSettings": {
            "type": "object",
            "properties": {
                "terms": {
                    "type": "array",
                    "items": { "$ref": "#/definitions/TermSettings" }
                },
                "power": {
                    "type": "array",
                    "items": { "type": "number" },
                    "minItems": 2,
                    "maxItems": 2,
                    "default": [1, 1]
                },
                "powerOrder": {
                    "type": "boolean",
                    "default": true
                },
                "combinationType": {
                    "type": "string",
                    "enum": ["addition", "subtraction", "multiplication", "division", "power", "root_sq_div", "none"],
                    "default": "addition"
                }
            },
            "required": ["terms", "power", "powerOrder", "combinationType"]
        },
        "ExpressionSettings": {
            "type": "object",
            "properties": {
                "expressions": {
                    "type": "array",
                    "items": {
                        "oneOf": [
                            { "$ref": "#/definitions/TermSettings" },
                            { "$ref": "#/definitions/TermsSettings" },
                            { "$ref": "#/definitions/ExpressionSettings" }
                        ]
                    }
                },
                "combinationType": {
                    "type": "string",
                    "enum": ["addition", "subtraction", "multiplication", "division", "power", "root_sq_div", "none"],
                    "default": "none"
                },
                "power": {
                    "type": "array",
                    "items": { "type": "number" },
                    "minItems": 2,
                    "maxItems": 2,
                    "default": [1, 1]
                },
                "powerOrder": {
                    "type": "boolean",
                    "default": true
                }
            },
            "required": ["expressions", "combinationType", "power", "powerOrder"]
        },
        "EquationSettings": {
            "type": "object",
            "properties": {
                "terms": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 2,
                    "items": { "$ref": "#/definitions/ExpressionSettings" }
                }
            },
            "required": ["terms"]
        },
        "InequalitySettings": {
            "type": "object",
            "properties": {
                "terms": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 2,
                    "items": { "$ref": "#/definitions/ExpressionSettings" }
                },
                "inequalityType": {
                    "type": "string",
                    "enum": ["less", "greater", "leq", "geq"],
                    "default": "less"
                }
            },
            "required": ["terms", "inequalityType"]
        },
        "FunctionSettings": {
            "type": "object",
            "properties": {
                "expression": { "$ref": "#/definitions/ExpressionSettings" },
                "functionName": {
                    "type": "string",
                    "default": "f"
                }
            },
            "required": ["expression", "functionName"]
        },
        "PointSettings": {
            "type": "object",
            "properties": {
                "coefficients": { "$ref": "#/definitions/CoefficientsSettings" },
                "name": {
                    "type": "string",
                    "enum": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
                    "default": "A"
                },
                "showName": {
                    "type": "boolean",
                    "default": true
                }
            },
            "required": ["coefficients", "name", "showName"]
        },
        "SetSettings": {
            "type": "object",
            "properties": {
                "coefficients": { "$ref": "#/definitions/CoefficientsSettings" },
                "name": {
                    "type": "string",
                    "enum": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
                    "default": "A"
                },
                "showName": {
                    "type": "boolean",
                    "default": true
                }
            },
            "required": ["coefficients", "name", "showName"]
        },
        "IntervalSettings": {
            "type": "object",
            "properties": {
                "coefficients": { "$ref": "#/definitions/CoefficientsSettings" },
                "minimumLength": {
                    "type": "number",
                    "default": 1
                },
                "intervalType": {
                    "type": "string",
                    "enum": ["open", "closed", "closed_open", "open_closed"],
                    "default": "closed"
                },
                "name": {
                    "type": "string",
                    "enum": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
                    "default": "A"
                },
                "showName": {
                    "type": "boolean",
                    "default": true
                }
            },
            "required": ["coefficients", "minimumLength", "intervalType", "name", "showName"]
        },
        "CoefficientMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "coefficient" },
                "coefficientSettings": { "$ref": "#/definitions/CoefficientSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "coefficientSettings"]
        },
        "CoefficientsMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "coefficients" },
                "coefficientsSettings": { "$ref": "#/definitions/CoefficientsSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "coefficientsSettings"]
        },
        "TermMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "term" },
                "termSettings": { "$ref": "#/definitions/TermSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "termSettings"]
        },
        "TermsMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "terms" },
                "termsSettings": { "$ref": "#/definitions/TermsSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "termsSettings"]
        },
        "ExpressionMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "expression" },
                "expressionSettings": { "$ref": "#/definitions/ExpressionSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "expressionSettings"]
        },
        "EquationMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "equation" },
                "equationSettings": { "$ref": "#/definitions/EquationSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "equationSettings"]
        },
        "InequalityMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "inequality" },
                "inequalitySettings": { "$ref": "#/definitions/InequalitySettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "inequalitySettings"]
        },
        "FunctionMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "function" },
                "functionSettings": { "$ref": "#/definitions/FunctionSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "functionSettings"]
        },
        "PointMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "point" },
                "pointSettings": { "$ref": "#/definitions/PointSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "pointSettings"]
        },
        "SetMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "set" },
                "setSettings": { "$ref": "#/definitions/SetSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "setSettings"]
        },
        "IntervalMathInput": {
            "type": "object",
            "properties": {
                "objectType": { "const": "interval" },
                "intervalSettings": { "$ref": "#/definitions/IntervalSettings" },
                "example": { "type": "string", "default": "" },
                "priority": { "type": "number", "default": 0 },
                "dependency": { "type": "string", "default": "none" }
            },
            "required": ["objectType", "intervalSettings"]
        }
    }
};



