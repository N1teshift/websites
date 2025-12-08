# Word Export Documentation

## Overview

This module provides Word document export functionality for the unit plan generator using both the `docx` library and Docxtemplater.

## Files

### Core Files

- `index.ts` - Main export functions and re-exports
- `docxtemplaterExport.ts` - Docxtemplater-based export functionality
- `templateManager.ts` - Template management system
- `DOCXTEMPLATER_GUIDE.md` - Comprehensive guide for creating templates

### Template Files

- `wordTemplate.docx` - Default template file (moved to `public/templates/`)
- `exampleTemplate.txt` - Text example of template structure

### Sections

- `sections/` - Individual document sections for the `docx` library
- `helpers/` - Helper functions
- `styles/` - Document styling

## Default Template

The system automatically loads and uses `wordTemplate.docx` as the default template. This template is:

1. **Automatically Available**: No need to upload - it's built into the system
2. **Always Accessible**: Works even when no custom templates are uploaded
3. **Persistent**: Stored in localStorage for faster loading

### How to Use the Default Template

1. **Automatic Usage**: Simply click "Export Template" without uploading any custom templates
2. **Fallback**: If no custom template is selected, the default template is used automatically
3. **Customization**: You can still upload your own templates to override the default

### Template Location

- **Source**: `src/features/modules/edtech/utils/wordExport/wordTemplate.docx`
- **Public**: `public/templates/wordTemplate.docx` (accessible via web)

## Template Management

### Features

- **Upload Templates**: Upload custom .docx templates
- **Template Storage**: Templates are stored in localStorage
- **Template Selection**: Choose between multiple templates
- **Template Deletion**: Remove unwanted templates

### Template Lifecycle

1. **Upload**: User uploads a .docx file
2. **Storage**: Template is stored in localStorage
3. **Selection**: User selects which template to use
4. **Export**: Template is used to generate the final document

## Export Options

### 1. Standard Word Export (`docx` library)

- **Button**: "Export Word"
- **Format**: Fixed layout based on MYP template
- **Use Case**: Quick export with consistent formatting

### 2. Template-based Export (Docxtemplater)

- **Button**: "Export Template"
- **Format**: Customizable using placeholders
- **Use Case**: Flexible, user-defined layouts

## Placeholder System

The default template supports all standard placeholders:

### Basic Fields

- `{schoolName}`, `{unitTitle}`, `{academicYear}`, `{subject}`, `{mypYear}`
- `{specifiedConcepts}`, `{conceptualUnderstandings}`, `{globalContext}`
- `{inquiryStatement}`, `{objectives}`, `{assessmentTitle}`, `{summativeAssessment}`
- `{resources}`, `{communityEngagement}`, `{contributingTeachers}`, `{lessonCount}`

### Advanced Features

- **Loops**: `{#factualQuestions}...{/factualQuestions}`
- **Conditionals**: `{#hasFactualQuestions}...{/hasFactualQuestions}`
- **Complex Objects**: `{#subunits}...{/subunits}`

## Getting Started

1. **Use Default Template**: Click "Export Template" immediately
2. **Custom Template**: Upload your own .docx file with placeholders
3. **Download Example**: Use "Download Example Template" to see placeholder syntax

## Troubleshooting

### Common Issues

- **Template not loading**: Check if the file is a valid .docx
- **Placeholders not working**: Verify syntax and spelling
- **Export fails**: Ensure template has valid placeholders

### Error Messages

- "No template available": Default template failed to load
- "Template not found": Selected template was deleted
- "Export failed": Check template syntax and data availability

## Development

### Adding New Placeholders

1. Update `prepareTemplateData()` in `docxtemplaterExport.ts`
2. Add corresponding field to `UnitPlanData` interface
3. Update documentation

### Modifying Default Template

1. Edit `public/templates/wordTemplate.docx`
2. Test with sample data
3. Update example template if needed

### Template Validation

Consider adding validation to ensure required fields are present in templates.
