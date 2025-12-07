# Mafalda Garcia Feature

This feature contains all the components and logic for Mafalda Garcia's artist website.

## Structure

```
src/features/mafalda-garcia/
├── components/
│   ├── layout/                     # Layout & Navigation Components
│   │   ├── Navigation.tsx          # Fixed navigation bar
│   │   └── LoadingScreen.tsx       # Loading state component
│   ├── content/                    # Content Section Components
│   │   ├── HeroSection.tsx         # Hero section with artist intro
│   │   ├── HeroContent.tsx         # Hero content component
│   │   ├── CanvasSection.tsx       # "body, my canvas. our voice" section
│   │   ├── ExplorationSection.tsx  # "Exploration Through Performance" section
│   │   ├── PerformancesSection.tsx # "Artistic Performances and Collaborations" section
│   │   ├── WorksSection.tsx        # "Major Works and Contributions" section
│   │   ├── PublicationsSection.tsx # Publications section
│   │   ├── VisualJourneySection.tsx# "Visual Journey: Fragments of Creation" section
│   │   └── ContactMeSection.tsx    # Contact section
│   ├── ui/                         # Reusable UI Components
│   │   └── WorkItem.tsx            # Reusable component for individual works
│   ├── utilities/                  # Utility & Helper Components
│   │   ├── ArtisticStyles.tsx      # Global CSS styles
│   │   └── ScrollAnimations.tsx    # JavaScript for scroll animations
│   ├── index.ts                    # Export all components
│   └── README.md                   # Components documentation
├── MafaldaGarciaPage.tsx           # Main page component
└── README.md                       # This file
```

## Components

### HeroSection
- Displays artist name and title
- Contains the main artistic statement
- Features hero image with photo credit
- Call-to-action button

### Navigation
- Fixed navigation bar with smooth scrolling
- Links to all major sections
- Responsive design

### CanvasSection
- "body, my canvas. our voice" content
- Artivism, rituals, and well-being philosophy
- Side-by-side layout with image

### ExplorationSection
- Education and training history
- Journey in performance art
- Text-only section

### PerformancesSection
- Collaboration history
- International festivals and venues
- Notable partnerships

### WorkItem (Reusable)
- Displays individual work with title, description, and image
- Supports quotes and credits
- Alternating layout (left/right image placement)
- Fade-in animations

### WorksSection
- Contains 6 major works using WorkItem components
- "Connecting Souls", "Yūs Esate", "Lines of Separation"
- "Collaborative Movement", "Borderline Manifesto", "Freedom Manifesto"

### PublicationsSection
- Two publication entries with images
- Grid layout for publications

### VisualJourneySection
- Photo grid showcasing work
- Quote from Mafalda Garcia
- Dark background with artistic styling

### ContactMeSection
- Contact information and social links
- Simple centered layout

### ScrollAnimations
- Smooth navigation between sections
- Intersection Observer for fade-in animations
- Client-side JavaScript

### ArtisticStyles
- Global CSS variables and utility classes
- Custom fonts (Playfair Display, Inter)
- Animation classes and hover effects
- Responsive design utilities

## Usage

The main page component (`MafaldaGarciaPage.tsx`) orchestrates all these components together. The original page file (`src/pages/mafalda-garcia.tsx`) now simply imports and uses this feature.

## Component Organization

The components are now organized into logical groups for better maintainability:

### Layout & Navigation (`components/layout/`)
- **Navigation.tsx** - Fixed navigation bar with smooth scrolling
- **LoadingScreen.tsx** - Loading state component

### Content Sections (`components/content/`)
- **HeroSection.tsx** - Hero section with artist intro and image
- **HeroContent.tsx** - Content for the hero section
- **CanvasSection.tsx** - "body, my canvas. our voice" section
- **ExplorationSection.tsx** - "Exploration Through Performance" section
- **PerformancesSection.tsx** - "Artistic Performances and Collaborations" section
- **WorksSection.tsx** - "Major Works and Contributions" section
- **PublicationsSection.tsx** - Publications section
- **VisualJourneySection.tsx** - "Visual Journey: Fragments of Creation" section
- **ContactMeSection.tsx** - Contact section

### UI Components (`components/ui/`)
- **WorkItem.tsx** - Reusable component for displaying individual works

### Utilities (`components/utilities/`)
- **ArtisticStyles.tsx** - Global CSS styles and artistic theming
- **ScrollAnimations.tsx** - JavaScript for scroll animations and interactions

## Benefits of Refactoring

1. **Modularity**: Each section is now a separate, reusable component
2. **Maintainability**: Easier to update individual sections
3. **Reusability**: Components can be used in other parts of the application
4. **Testing**: Individual components can be tested in isolation
5. **Organization**: Clear separation of concerns with logical grouping
6. **Scalability**: Easy to add new sections or modify existing ones
7. **Structure**: Components are organized by purpose (layout, content, UI, utilities)

## Styling

All artistic styling is contained in the `ArtisticStyles` component, which provides:
- CSS custom properties for consistent theming
- Utility classes for animations and effects
- Responsive design utilities
- Custom font loading and application
