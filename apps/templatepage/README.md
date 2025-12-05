# Template Page

A Next.js template project with built-in logging and internationalization support.

## Features

- **Next.js 15** with TypeScript
- **Logging Module** - Comprehensive logging with error categorization
- **Internationalization (i18n)** - Multi-language support with fallback mechanism
- **Tailwind CSS** - Utility-first CSS framework
- **Minimal Layout Component** - Provides translation namespace context

## Project Structure

```
templatepage/
├── src/
│   ├── features/
│   │   ├── logging/           # Logging module
│   │   │   ├── logger.ts      # Main logger with error categorization
│   │   │   ├── errorHandler.ts # API error handling utilities
│   │   │   └── index.ts       # Module exports
│   │   ├── i18n/              # Internationalization module
│   │   │   ├── useFallbackTranslation.ts # Hook with fallback logic
│   │   │   ├── TranslationNamespaceContext.tsx # React context
│   │   │   ├── next-i18next.config.ts # i18n configuration
│   │   │   ├── getStaticProps.ts # Server-side translation helper
│   │   │   └── index.ts       # Module exports
│   │   └── shared/
│   │       └── components/
│   │           ├── Layout.tsx # Minimal layout component
│   │           └── ui/        # Shared UI components
│   ├── pages/                 # Next.js pages
│   │   ├── _app.tsx          # App wrapper with i18n
│   │   ├── _document.tsx     # Document wrapper
│   │   └── index.tsx         # Home page example
│   └── styles/               # Global styles
├── locales/                  # Translation files
│   └── en/                   # English translations
├── external/                 # External reference project (gitignored)
└── [config files]           # Next.js, TypeScript, Tailwind configs
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Usage

### Logging

```typescript
import { createComponentLogger } from '@logging/logger';

const logger = createComponentLogger('MyComponent', 'myMethod');

logger.info('Component rendered');
logger.error('Something went wrong', error);
```

### Internationalization

```typescript
import { useTranslation } from 'next-i18next';
import Layout from '@components/Layout';

export default function MyPage() {
  const { t } = useTranslation('common');
  
  return (
    <Layout translationNs={['common', 'myPage']}>
      <h1>{t('welcome')}</h1>
    </Layout>
  );
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'myPage'])),
  },
});
```

### Adding New Languages

1. Create a new folder in `locales/` (e.g., `locales/de/`)
2. Add translation files (e.g., `common.json`)
3. Update `next.config.ts` to include the new locale

## Configuration

- **Languages**: Configured in `next.config.ts` (currently: en)
- **Default Language**: Set to English in `next.config.ts`
- **Path Aliases**: Configured in `tsconfig.json` for easy imports
- **Logging Level**: Controlled by `NODE_ENV` and `ENABLE_DEBUG_LOGS` environment variable

## Extending the Template

1. **Add new features** in `src/features/`
2. **Create new pages** in `src/pages/`
3. **Add translations** in `locales/[language]/`
4. **Extend the Layout component** for additional functionality

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
