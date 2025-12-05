# PersonalPage

**Short Description:**  
This is my personal page featuring the solutions to problems I face every day.

## Table of Contents

- [Project Structure](#project-structure)
- [Website Structure](#website-structure)
- [Internationalization (i18n)](#internationalization-i18n)
- [Deployment](#deployment)

## Project Structure

A high-level overview of the directories and files:

```
personalpage/
├─ public/                # Static assets (images, icons, etc.)
├─ src/
│  ├─ pages/              # Next.js pages (routes defining website structure)
│  ├─ components/         # Shared UI components (potentially documented in /docs)
│  ├─ features/           # Feature modules organized by domain
│  ├─ services/           # Backend services or API interactions
│  ├─ styles/             # Global and component-specific styles
│  ├─ types/              # TypeScript type definitions
│  ├─ scripts/            # Utility or build scripts
│  └─ middleware.ts       # Next.js middleware
├─ locales/               # Internationalization translation files
├─ scripts/               # Build and utility scripts
├─ docs/                  # Documentation hub (architecture/, archive/, features/)
├─ config/                # Configuration files
│  ├─ tailwind.config.ts  # Tailwind CSS configuration
│  └─ tsconfig.test.json  # TypeScript test configuration
├─ .eslintrc.json         # ESLint configuration
├─ i18next-scanner.config.cjs  # i18next scanner configuration
├─ next-env.d.ts          # Next.js environment types (auto-generated)
├─ next.config.ts         # Next.js configuration
├─ next-i18next.config.ts # Next.js i18next configuration
├─ package.json           # Project dependencies and scripts
├─ package-lock.json      # Locked dependency versions
├─ postcss.config.mjs     # PostCSS configuration
├─ tsconfig.json          # TypeScript configuration
└─ ...
```

More details will be added as the project evolves.

## Website Structure

Key routes currently exposed via the Next.js `pages/` directory:

- `/`: Landing page rendered from `src/pages/index.tsx`
- `/projects/aboutme`: About Me experience module
- `/projects/edtech/*`: EdTech suite (lessons, generators, progress reports)
- `/projects/connecting-vessels`: Math modeling utilities
- `/projects/music`: Music practice utilities
- `/projects/emw/*`: EMW tooling (counties, voting, tasks, etc.)
- `/api/...`: API endpoints under `src/pages/api`

## Internationalization (i18n)

The application supports multiple languages using `next-i18next`. Refer to the auto-generated [Documentation](#documentation) for details on how internationalization might be implemented within specific components or features.


## Documentation

Documentation is curated manually as Markdown and organized inside `docs/`:

- `docs/architecture/README.md` – index for platform-wide references and investigations
- `docs/archive/` – historical snapshots, retired plans, legacy reports
- `docs/features/` – feature-level briefs plus actionable TODO trackers (e.g., `docs/features/TODO.md`)

Refer to these Markdown files directly when updating or consuming documentation; there is no automated TypeDoc pipeline at the moment.

## Math Tools & Generators

This project includes several math-related modules:

- **Math Lessons Scheduler**: Manages the scheduling and organization of math lessons.
- **Math Object Generator**: Generates and configures various mathematical objects (e.g., coefficients) for problem generation.
- **Exercise Generator**: Dynamically creates math exercises for practice and learning.

## Deployment

The application is hosted on Vercel, with backend data stored in Firestore. It integrates with the OpenAI API for certain AI-powered features.