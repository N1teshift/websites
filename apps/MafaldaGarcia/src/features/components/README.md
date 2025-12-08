# Components Structure

This directory contains all the components for Mafalda Garcia's artist website, organized into logical groups for better maintainability and understanding.

## Directory Structure

```
components/
├── layout/           # Layout & Navigation Components
│   ├── Navigation.tsx
│   └── LoadingScreen.tsx
├── content/          # Content Section Components
│   ├── HeroSection.tsx
│   ├── HeroContent.tsx
│   ├── PhilosophySection.tsx
│   ├── EducationSection.tsx
│   ├── WorksSection.tsx
│   ├── MajorWorksSection.tsx
│   ├── PublicationsSection.tsx
│   ├── GallerySection.tsx
│   └── ContactMeSection.tsx
├── ui/               # Reusable UI Components
│   └── WorkItem.tsx
├── utilities/        # Utility & Helper Components
│   ├── ArtisticStyles.tsx
│   └── ScrollAnimations.tsx
├── index.ts          # Main export file
└── README.md         # This file
```

## Component Categories

### Layout & Navigation (`layout/`)

Components responsible for the overall page structure and navigation:

- **Navigation.tsx** - Fixed navigation bar with smooth scrolling
- **LoadingScreen.tsx** - Loading state component

### Content Sections (`content/`)

Main content sections that make up the page:

- **HeroSection.tsx** - Hero section with artist intro and image
- **HeroContent.tsx** - Content for the hero section
- **PhilosophySection.tsx** - "body, my canvas. our voice" philosophy section
- **EducationSection.tsx** - Education and training section
- **WorksSection.tsx** - "Major Works and Contributions" section
- **MajorWorksSection.tsx** - Additional major works section
- **PublicationsSection.tsx** - Publications section
- **GallerySection.tsx** - "Visual Journey: Fragments of Creation" gallery
- **ContactMeSection.tsx** - Contact section

### UI Components (`ui/`)

Reusable UI components that can be used across different sections:

- **WorkItem.tsx** - Reusable component for displaying individual works

### Utilities (`utilities/`)

Helper components for styling, animations, and other utilities:

- **ArtisticStyles.tsx** - Global CSS styles and artistic theming
- **ScrollAnimations.tsx** - JavaScript for scroll animations and interactions

## Site Structure

The website follows this section order:

1. **Hero** - Introduction and main artistic statement
2. **Philosophy** - "body, my canvas. our voice" philosophy
3. **Education** - Education and training background
4. **Works** - Major works and contributions
5. **Major Works** - Additional significant works
6. **Publications** - Published works and articles
7. **Gallery** - Visual journey and photo gallery
8. **Contact** - Contact information and social links

## Usage

All components are exported through the main `index.ts` file, so you can import them like this:

```typescript
import {
  Navigation,
  HeroSection,
  PhilosophySection,
  EducationSection,
  WorksSection,
  MajorWorksSection,
  PublicationsSection,
  GallerySection,
  ContactMeSection,
  WorkItem,
  ArtisticStyles,
} from "./components";
```

## Benefits of This Structure

1. **Clear Organization** - Components are grouped by their purpose and function
2. **Easy Navigation** - Developers can quickly find the component they need
3. **Scalability** - Easy to add new components to the appropriate category
4. **Maintainability** - Related components are kept together
5. **Reusability** - UI components are separated for easy reuse
6. **Separation of Concerns** - Layout, content, UI, and utilities are clearly separated
