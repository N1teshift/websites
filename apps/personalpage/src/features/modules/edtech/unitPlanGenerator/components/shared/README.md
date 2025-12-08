# Shared Components

This directory contains shared components used across the edtech feature.

## AIGenerateButton

A small circular button with a robot face icon (🤖) that sends prompts to OpenAI for content generation.

### Features:

- Visual design similar to InfoTooltip component
- Loading state with spinner animation
- Error handling with specific error messages
- Purple color scheme to distinguish from info tooltips

### Usage:

```tsx
<AIGenerateButton
  prompt="Your prompt here"
  onGenerate={(content) => handleGeneratedContent(content)}
  size="sm" // sm, md, lg
  disabled={false}
/>
```

### Props:

- `prompt`: The text prompt to send to OpenAI
- `onGenerate`: Callback function that receives the generated content
- `size`: Button size ('sm', 'md', 'lg') - defaults to 'md'
- `className`: Additional CSS classes
- `disabled`: Whether the button is disabled

### Integration with FormField:

The FormField component supports AI generation through optional props:

- `aiPrompt`: The prompt to send to OpenAI
- `onAIGenerate`: Callback function for generated content

Example:

```tsx
<FormField
  label="Conceptual Understandings"
  value={value}
  onChange={onChange}
  aiPrompt="Generate a conceptual understanding statement..."
  onAIGenerate={(content) => onChange(content)}
/>
```

### Environment Variables Required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_API_BASE_URL`: OpenAI API base URL (defaults to https://api.openai.com/v1)
- `OPENAI_DEFAULT_MODEL`: Default model to use (defaults to gpt-4o-mini)
