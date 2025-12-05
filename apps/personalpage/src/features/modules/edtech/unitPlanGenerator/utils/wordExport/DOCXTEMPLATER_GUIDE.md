# Docxtemplater Template Guide

## Overview
Docxtemplater allows you to create Word document templates with placeholders that get replaced with actual data when exporting. This guide shows you how to create placeholders in your Word document.

## Basic Placeholders

### Simple Text Replacement
Use curly braces `{}` to create simple text placeholders:

```
School Name: {schoolName}
Unit Title: {unitTitle}
Academic Year: {academicYear}
Subject: {subject}
MYP Year: {mypYear}
```

### Available Basic Fields
- `{schoolName}` - School name
- `{unitTitle}` - Unit title
- `{academicYear}` - Academic year
- `{subject}` - Subject
- `{mypYear}` - MYP year
- `{specifiedConcepts}` - Specified concepts (comma-separated)
- `{conceptualUnderstandings}` - Conceptual understandings
- `{globalContext}` - Global context
- `{globalContextExplanation}` - Global context explanation
- `{inquiryStatement}` - Inquiry statement
- `{objectives}` - Objectives (comma-separated)
- `{assessmentTitle}` - Assessment title
- `{assessmentType}` - Assessment type
- `{summativeAssessment}` - Summative assessment
- `{commandTerms}` - Command terms (comma-separated)
- `{resources}` - Resources
- `{communityEngagement}` - Community engagement
- `{contributingTeachers}` - Contributing teachers (comma-separated)
- `{lessonCount}` - Total lesson count

**Note**: For questions (factual, conceptual, debatable), use the loop syntax shown below.

## Advanced Placeholders

### Lists and Arrays
For arrays like questions, use the loop syntax:

```
Factual Questions:
{#factualQuestions}
• {.}
{/factualQuestions}

Conceptual Questions:
{#conceptualQuestions}
• {.}
{/conceptualQuestions}

Debatable Questions:
{#debatableQuestions}
• {.}
{/debatableQuestions}
```

**Note**: Each question will automatically start on a new line with a bullet point.

### Complex Objects (Subunits)
For subunits with multiple properties:

```
Subunits:
{#subunits}
Subunit {number}: {title}
Description: {description}
Lessons: {lessonsPerSubunit}
Interim Assessment: {interimAssessment}
Formative Assessment: {formativeAssessment}

{/subunits}
```

### Conditional Content
Use conditional placeholders to show/hide content:

```
{#hasFactualQuestions}
Factual Questions:
{#factualQuestions}
• {.}
{/factualQuestions}
{/hasFactualQuestions}

{#hasContributingTeachers}
Contributing Teachers: {contributingTeachers}
{/hasContributingTeachers}
```

## Creating Your Template

### Step 1: Create a Word Document
1. Open Microsoft Word or any compatible word processor
2. Create your document with the desired layout and formatting
3. Add placeholders where you want dynamic content

### Step 2: Add Placeholders
Insert placeholders using the syntax above. For example:

```
UNIT PLAN

School: {schoolName}
Unit Title: {unitTitle}
Subject: {subject}
Academic Year: {academicYear}

INQUIRY STATEMENT
{inquiryStatement}

CONCEPTUAL UNDERSTANDINGS
{conceptualUnderstandings}

GLOBAL CONTEXT
{globalContext}
{globalContextExplanation}

ASSESSMENT
Title: {assessmentTitle}
Type: {assessmentType}
Objectives: {objectives}

Summative Assessment:
{summativeAssessment}

SUBUNITS
{#subunits}
Subunit {number}: {title}
Description: {description}
Lessons: {lessonsPerSubunit}
Interim Assessment: {interimAssessment}
Formative Assessment: {formativeAssessment}

{/subunits}

RESOURCES
{resources}

REFLECTION
Prior to Teaching: {reflectionPriorToTeaching}
During Teaching: {reflectionDuringTeaching}
After Teaching: {reflectionAfterTeaching}
Future Planning: {reflectionFuturePlanning}
```

### Step 3: Save as .docx
Save your document as a .docx file (not .doc).

### Step 4: Upload Template
1. Go to the Data Management tab in your unit plan generator
2. Click "Upload Template" and select your .docx file
3. The template will be stored and available for export

## Template Examples

### Simple Template
```
UNIT PLAN TEMPLATE

Basic Information:
School: {schoolName}
Unit: {unitTitle}
Subject: {subject}
Year: {academicYear}

Inquiry: {inquiryStatement}
Assessment: {summativeAssessment}
```

### Detailed Template
```
MYP UNIT PLAN

SCHOOL INFORMATION
School Name: {schoolName}
Academic Year: {academicYear}
Subject: {subject}
MYP Year: {mypYear}

UNIT OVERVIEW
Unit Title: {unitTitle}

CONCEPTS AND UNDERSTANDINGS
Specified Concepts: {specifiedConcepts}
Conceptual Understandings: {conceptualUnderstandings}

GLOBAL CONTEXT
Context: {globalContext}
Explanation: {globalContextExplanation}

INQUIRY
Statement: {inquiryStatement}

Questions:
Factual:
{#factualQuestions}
• {.}
{/factualQuestions}

Conceptual:
{#conceptualQuestions}
• {.}
{/conceptualQuestions}

Debatable:
{#debatableQuestions}
• {.}
{/debatableQuestions}

ASSESSMENT
Title: {assessmentTitle}
Type: {assessmentType}
Objectives: {objectives}
Command Terms: {commandTerms}

Summative Assessment:
{summativeAssessment}

TEACHING AND LEARNING
Subunits:
{#subunits}
Subunit {number}: {title}
Description: {description}
Lessons: {lessonsPerSubunit}
Interim Assessment: {interimAssessment}
Formative Assessment: {formativeAssessment}

{/subunits}

RESOURCES
{resources}

COMMUNITY ENGAGEMENT
{communityEngagement}

REFLECTION
Prior to Teaching: {reflectionPriorToTeaching}
During Teaching: {reflectionDuringTeaching}
After Teaching: {reflectionAfterTeaching}
Future Planning: {reflectionFuturePlanning}

CONTRIBUTING TEACHERS
{contributingTeachers}

Total Lessons: {lessonCount}
```

## Tips and Best Practices

1. **Test Your Template**: Always test with sample data to ensure placeholders work correctly
2. **Use Conditional Logic**: Use `{#hasField}` to show/hide sections based on data availability
3. **Formatting**: Apply Word formatting (bold, italic, etc.) to your template - it will be preserved
4. **Tables**: You can use placeholders in tables for structured data
5. **Images**: Docxtemplater supports image placeholders (advanced feature)
6. **Backup**: Keep a backup of your template before making changes

## Troubleshooting

### Common Issues
1. **Placeholders not replaced**: Check spelling and case sensitivity
2. **Formatting lost**: Ensure you're using .docx format, not .doc
3. **Special characters**: Some special characters in placeholders may cause issues
4. **Large files**: Very large templates may take longer to process

### Error Messages
- "Template file is required": Upload a template first
- "Selected template not found": Template may have been deleted, upload again
- "Export failed": Check template syntax and data availability

## Advanced Features

### Custom Functions
You can extend Docxtemplater with custom functions for more complex logic:

```javascript
// Example of custom function for formatting dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
```

### Multiple Templates
You can upload multiple templates and switch between them for different export formats or styles.

### Template Validation
Consider adding validation to ensure all required fields are present in your template.
