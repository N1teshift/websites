/**
 * @file Barrel file for Zod schemas used within the AI feature.
 * Exports schemas related to object type identification and settings extraction
 * for various mathematical object types, primarily defined in the `mathObjects` subdirectory.
 */
export * from './objectType';
export * from './mathObjects/coefficient';
export * from './mathObjects/coefficients';
export * from './mathObjects/term';
// export * from './mathObjectSettingsSchemas/termsSettings'; // Add export when file exists
export * from './mathObjects/expression';
export * from './mathObjects/equation';
// Add exports for other schema files as they are created
// export * from './mathObjectSettingsSchemas/inequalitySettings';
// export * from './mathObjectSettingsSchemas/pointSettings';
// export * from './mathObjectSettingsSchemas/intervalSettings';
// export * from './mathObjectSettingsSchemas/setSettings';
// export * from './mathObjectSettingsSchemas/functionSettings';
// No longer exporting getSettingsExtractorSchema from here 



