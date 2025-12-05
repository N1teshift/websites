# Unified Timeline View - Side-by-Side Curriculum Comparison

## Overview
The Content Display tab now shows **BUP and Cambridge curricula in a unified, side-by-side block-based timeline format**. Both curricula are displayed with the same visual structure: **Modules → Units → Subunits**, making it easy to compare and navigate both programs simultaneously.

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│          📚 Curriculum Comparison View                      │
│   Compare side-by-side. Click to expand modules & units    │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────┬──────────────────────────┐
│  🇱🇹 BUP - Grade 7/8      │  🌍 Cambridge - Stage 8/9│
│  4 modules                │  6 modules               │
├──────────────────────────┼──────────────────────────┤
│  📦 Module 1              │  📦 Module 1             │
│  ├─ Unit 1.1              │  ├─ Unit 1               │
│  │  ├─ Subunit 1.1.1      │  │  ├─ 1.1 Section       │
│  │  └─ Subunit 1.1.2      │  │  ├─ 1.2 Section       │
│  └─ Unit 1.2              │  │  └─ 1.3 Section       │
│                           │  ├─ Unit 2               │
│  📦 Module 2              │  └─ Unit 3               │
│  └─ ...                   │                          │
│                           │  📦 Module 2             │
│  📦 Module 3              │  ├─ Unit 4               │
│  └─ ...                   │  └─ Unit 5               │
│                           │                          │
│  📦 Module 4              │  📦 Module 3             │
│  └─ ...                   │  └─ ...                  │
└──────────────────────────┴──────────────────────────┘
```

## Key Features

### 1. **Parallel Display**
- **Left Column**: BUP (Lithuanian) curriculum in blue
- **Right Column**: Cambridge curriculum in green
- Both use identical visual hierarchy and interaction patterns

### 2. **Three-Level Hierarchy**
Both curricula display with consistent structure:

**BUP:**
- **Modules** (e.g., "Skaičiai ir skaičiavimai")
  - **Units** (e.g., "Realieji skaičiai")
    - **Subunits** (e.g., "Laipsnis su sveikuoju rodikliu")

**Cambridge:**
- **Modules** (e.g., "Number and Algebra Foundations")
  - **Units** (e.g., "Number and calculation")
    - **Subsections** (e.g., "1.1 Irrational numbers")

### 3. **Collapsible Blocks**
- Click **module headers** to expand/collapse units
- Click **unit headers** to expand/collapse subunits/subsections
- Independent expansion states for each curriculum
- Smooth animations

### 4. **Color Coding**
- **BUP**: Blue theme (`bg-blue-50`, `border-blue-300`, `text-blue-900`)
- **Cambridge**: Green theme (`bg-green-50`, `border-green-300`, `text-green-900`)
- Consistent visual language throughout

### 5. **Metadata Display**

**BUP shows:**
- Module number and unit count
- Subunit content previews (first 2 sentences)
- Total sentence count indicator

**Cambridge shows:**
- Module number, name, and description
- Unit number, strand, and page references
- Subsection codes (1.1, 2.3, etc.) and objective IDs

## Cambridge Module Groupings (Stage 9)

Per user request, Cambridge units are grouped into 6 logical modules:

| Module # | Name | Units | Description |
|----------|------|-------|-------------|
| **1** | Number and Algebra Foundations | 1, 2, 3 | Numbers, expressions, decimals and percentages |
| **2** | Equations and Geometry | 4, 5 | Solving equations and understanding angles |
| **3** | Statistics and Measurement | 6, 7, 8 | Data analysis, shapes and fractions |
| **4** | Functions and Graphs | 9, 10 | Sequences, functions and graphing |
| **5** | Ratio, Probability and Transformation | 11, 12, 13 | Proportional reasoning, probability and geometric transformations |
| **6** | 3D Geometry and Data Interpretation | 14, 15 | Volume, surface area and statistical analysis |

This grouping creates a more balanced comparison with BUP's 4 modules.

## Technical Implementation

### Files Created

**`src/features/modules/edtech/components/sections/contentDisplay/UnifiedCurriculumTimeline.tsx`**
- Main component displaying side-by-side timelines
- Handles expansion state for both curricula independently
- ~400 lines of React/TypeScript code
- Uses Tailwind CSS for styling

### Files Modified

1. **`src/features/modules/edtech/data/cambridgeLearnerBook.ts`**
   - Added `BookModule` interface
   - Added `modules` array to `BookStage` interface
   - Populated 6 modules for Stage 9
   - Empty module arrays for Stages 7 and 8 (placeholders)

2. **`src/features/modules/edtech/components/sections/ContentDisplaySection.tsx`**
   - Replaced separate BUP and Cambridge views with unified timeline
   - Added comparison intro section
   - Simplified rendering logic

3. **Translation files** (`locales/*/edtech-common.json`)
   - Added `curriculum_comparison_title`
   - Added `curriculum_comparison_description`

### Data Structure Enhancement

```typescript
interface BookModule {
    id: string;
    moduleNumber: number;
    name: string;
    description?: string;
    unitIds: string[]; // References to units in this module
}

interface BookStage {
    stage: number;
    grade: number;
    title: string;
    units: BookUnit[];
    modules: BookModule[]; // NEW
}
```

## Interaction Flow

1. **Initial View**: Both curricula shown with all modules collapsed
2. **Click Module**: Expands to show units within that module
3. **Click Unit**: Expands to show subunits/subsections
4. **Click Again**: Collapses back to previous level
5. **Independent Navigation**: Expanding BUP modules doesn't affect Cambridge and vice versa

## Visual Design Details

### Module Cards
- **Header**: Module number badge, unit count, name
- **Description**: For Cambridge, shows module description
- **Background**: Light blue (BUP) or light green (Cambridge)
- **Border**: 2px solid, colored by curriculum
- **Hover**: Slightly darker background
- **Icon**: Down chevron that rotates 180° when expanded

### Unit Cards
- **Header**: Unit label/number, metadata (pages, strand, subunit count)
- **Background**: Nested within module, slightly lighter
- **Border**: 1px solid, lighter than module border
- **Badges**: Small colored pills for strand, pages, etc.

### Subunit/Subsection Cards
- **Background**: White with subtle border
- **Content**: 
  - BUP: Subunit name + content preview
  - Cambridge: Section code + title + objective IDs
- **Hover**: Shadow effect
- **Text**: Small (text-xs) for readability in compact space

## Responsive Behavior

- **Desktop (lg+)**: Two-column grid (`grid-cols-2`)
- **Tablet/Mobile**: Stacked single column (`grid-cols-1`)
- Sticky headers on scroll (with z-index management)
- Touch-friendly tap targets (44px minimum)

## Benefits

### For Teachers
1. **Easy Comparison**: See BUP and Cambridge content aligned visually
2. **Quick Navigation**: Collapsible structure allows rapid exploration
3. **Context Preservation**: Both curricula visible simultaneously
4. **Consistent UI**: Same interaction pattern for both programs

### For Curriculum Planning
1. **Identify Overlaps**: Visually scan for similar topics
2. **Plan Unit Sequences**: See logical flow in both programs
3. **Reference Textbook**: Cambridge shows page numbers for easy lookup
4. **Standards Alignment**: Cambridge shows objective codes for each section

### For Documentation
1. **Screenshot Friendly**: Clean, professional appearance
2. **Printable**: Can be exported/printed for offline reference
3. **Shareable**: Easy to demonstrate curriculum alignment to stakeholders

## Future Enhancements

### Potential Features
1. **Connection Lines**: Draw visual lines between related topics
2. **Search/Filter**: Find specific topics across both curricula
3. **Strand Filter**: Show only Number, Algebra, Geometry, or Statistics
4. **Highlight Mode**: Highlight selected topic and its connections
5. **Export View**: Generate PDF/Excel of curriculum mapping
6. **Side-by-Side Content**: When clicking a topic, show detailed content comparison
7. **Progress Tracking**: Mark which topics have been covered in unit plans
8. **Auto-Suggestions**: When selecting BUP topic, suggest related Cambridge sections

### Data Completions
1. **Stage 8 modules**: Define 6 modules for Stage 8 Cambridge
2. **Stage 7 modules**: Define 6 modules for Stage 7 Cambridge
3. **Connection data**: Add explicit mappings between BUP and Cambridge topics
4. **Depth indicators**: Show which topics go deeper in one curriculum vs. the other

## Usage in Unit Planning Workflow

### Current State
1. Navigate to **Content Display** tab (Mathematics MYP Years 2-3 only)
2. See both curricula displayed side-by-side
3. Expand modules and units to explore content
4. Manually note connections and references

### Future Integration
1. **Select Topics**: Click checkboxes to select topics for unit plan
2. **Smart Suggestions**: System suggests complementary topics from other curriculum
3. **Auto-Populate Content**: Selected topics automatically added to unit plan content section
4. **Track Coverage**: Visual indicators show which topics are included in current unit
5. **Gap Analysis**: Identify curriculum areas not yet covered in any unit plans

## Performance Considerations

- **Lazy Rendering**: Only expanded sections render their children
- **Memoization**: React components memoized where appropriate
- **State Management**: Uses React hooks (useState) for local expansion state
- **Smooth Animations**: CSS transitions for expand/collapse (200ms duration)
- **Data Size**: 
  - BUP Grade 7: 4 modules, ~15 units, ~60 subunits
  - BUP Grade 8: 4 modules, ~15 units, ~60 subunits
  - Cambridge Stage 9: 6 modules, 15 units, 55 subsections
  - Total: Manageable for client-side rendering

## Testing Checklist

- [ ] Stage 9 displays correctly with 6 modules
- [ ] All modules expand/collapse independently
- [ ] All units expand/collapse independently
- [ ] BUP and Cambridge don't interfere with each other
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] Translations work in EN/LT/RU
- [ ] No console errors or warnings
- [ ] Performance is smooth with all sections expanded
- [ ] Page numbers and objective IDs display correctly
- [ ] Sticky headers work on scroll

## Documentation Files

Related documentation:
- **`CAMBRIDGE_BOOK_STRUCTURE.md`**: Cambridge textbook data structure
- **`CURRICULUM_CONNECTIONS.md`**: Connection strategies and examples
- **`UNIFIED_TIMELINE_VIEW.md`**: This document

---

*Last Updated: October 22, 2025*
*Status: Stage 9 complete with 6 modules, Stages 7-8 pending*
*Component: UnifiedCurriculumTimeline.tsx*



