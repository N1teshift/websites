# Cambridge Learner's Book Structure Integration

## Overview
The Content Display tab now shows the Cambridge curriculum organized by the **Learner's Book structure** instead of the official curriculum objectives structure. This makes it easier to align unit planning with the actual textbook students use.

## Implementation Summary

### Files Created

1. **`src/features/modules/edtech/data/cambridgeLearnerBook.ts`**
   - New data structure following the Cambridge Learner's Book table of contents
   - Organized by: Stage → Units → Subsections
   - Links subsections to curriculum objectives via `objectiveIds`
   - Currently complete for Stage 9 (Grade 8/MYP Year 3)
   - Placeholder structures for Stages 7 and 8 (to be filled later)

2. **`src/features/modules/edtech/components/sections/contentDisplay/CambridgeBookView.tsx`**
   - New component to display the book structure
   - Features:
     - Color-coded by strand (Number, Algebra, Geometry, Statistics, Projects)
     - Collapsible units showing subsections
     - Shows page ranges
     - Links to curriculum objectives
     - Unit counts and metadata

### Files Modified

3. **`src/features/modules/edtech/components/sections/ContentDisplaySection.tsx`**
   - Updated to use `CambridgeBookView` instead of generic timeline
   - Shows placeholder message for Stages 7 and 8
   - Maintained BUP curriculum display (unchanged)

4. **Translation Files** (`locales/*/edtech-common.json`)
   - Added `cambridge_book_description`
   - Added `cambridge_book_not_available`
   - Added `how_connections_work`
   - Added `connections_description`

## Data Structure

### Book Structure Hierarchy
```
BookStage (Stage 7, 8, 9)
├── BookUnit (15 units in Stage 9)
│   ├── unitNumber (1-15, 0 for projects/intro)
│   ├── title ("Number and calculation")
│   ├── pages ("9–20")
│   ├── strand ("Number" | "Algebra" | "Geometry and measure" | "Statistics and probability" | "Project")
│   └── subsections[]
│       ├── BookSubsection (1.1, 1.2, etc.)
│       │   ├── code ("1.1")
│       │   ├── title ("Irrational numbers")
│       │   └── objectiveIds[] (["s9-9Ni.01", "s9-9Ni.04"])
```

### Stage 9 (MYP Year 3 / Grade 8) Content

**15 Content Units + 5 Project Units**

| Unit | Title | Pages | Strand | Subsections |
|------|-------|-------|--------|-------------|
| 1 | Number and calculation | 9–20 | Number | 3 (Irrational numbers, Standard form, Indices) |
| 2 | Expressions and formulae | 21–54 | Algebra | 6 (Substitution, Construction, Expansion, etc.) |
| 3 | Decimals, percentages and rounding | 55–81 | Number | 4 (Powers of 10, Decimals, Percentages, Bounds) |
| 4 | Equations and inequalities | 83–102 | Algebra | 3 (Equations, Simultaneous, Inequalities) |
| 5 | Angles | 103–126 | Geometry | 5 (Calculating, Interior, Exterior, Constructions, Pythagoras) |
| 6 | Statistical investigations | 128–137 | Statistics | 2 (Data collection, Bias) |
| 7 | Shapes and measurements | 138–160 | Geometry | 3 (Circle, Compound shapes, Units) |
| 8 | Fractions | 161–189 | Number | 5 (Recurring decimals, Order, Multiply, Divide, Simplify) |
| 9 | Sequences and functions | 191–211 | Algebra | 3 (Generating, nth term, Representing) |
| 10 | Graphs | 212–233 | Algebra | 4 (Functions, Plotting, Gradient, Interpreting) |
| 11 | Ratio and proportion | 235–249 | Number | 2 (Using ratios, Direct/inverse) |
| 12 | Probability | 250–269 | Statistics | 4 (Mutually exclusive, Independent, Combined, Experiments) |
| 13 | Position and transformation | 270–299 | Geometry | 4 (Bearings, Line segments, Transformations, Enlargement) |
| 14 | Volume, surface area and symmetry | 301–316 | Geometry | 3 (Volume, Surface area, Symmetry) |
| 15 | Interpreting and discussing results | 317–347 | Statistics | 5 (Frequency polygons, Scatter, Stem-and-leaf, Grouped data, Representing) |

**Projects**: 5 projects interspersed throughout the book (pp. 82, 127, 190, 234, 300)

### Objective Mapping Examples

The book subsections link to curriculum objectives:

- **1.1 Irrational numbers** → `9Ni.01` (Understand rational/irrational), `9Ni.04` (Estimate surds)
- **4.2 Simultaneous equations** → `9Ae.06` (Solve simultaneous equations)
- **5.5 Pythagoras' theorem** → `9Gg.10` (Know and use Pythagoras)

This allows teachers to:
1. Plan lessons using textbook units
2. See which official objectives are covered
3. Track curriculum compliance
4. Identify connections between book and standards

## UI Features

### Color Coding by Strand
- 🔢 **Number**: Blue (bg-blue-50, border-blue-300)
- 📐 **Algebra**: Purple (bg-purple-50, border-purple-300)
- 📏 **Geometry and measure**: Green (bg-green-50, border-green-300)
- 📊 **Statistics and probability**: Orange (bg-orange-50, border-orange-300)
- 🎯 **Project**: Pink (bg-pink-50, border-pink-300)

### Interactive Elements
- **Expandable units**: Click to show/hide subsections
- **Page ranges**: Shows where to find content in the textbook
- **Objective tags**: Each subsection shows linked curriculum codes
- **Metadata**: Unit count, subsection count

### Responsive Design
- Adapts to screen size
- Maintains readability on mobile/tablet
- Smooth expand/collapse animations

## Status

### ✅ Complete
- Stage 9 (Grade 8 / MYP Year 3) - **100% mapped** (15 units, 55 subsections)
- All 9Ni, 9Ae, 9Gg, 9Gp, 9Ss, 9Sp objectives mapped to book sections
- UI components built and styled
- Translations added (EN, LT, RU)

### 🚧 Pending
- **Stage 8** (Grade 7 / MYP Year 2) - Empty placeholder
- **Stage 7** (Grade 6 / MYP Year 1) - Empty placeholder

### 📋 Future Enhancements
1. Complete Stage 8 and Stage 7 mappings
2. Add search/filter by strand
3. Add "Show only selected strands" toggle
4. Link back to curriculum objectives details
5. Integration with unit plan content selection
6. Export book structure to PDF/Excel for reference

## Usage in Unit Planning

When creating a unit plan:
1. Navigate to **Content Display** tab (visible only for Mathematics MYP Years 2-3)
2. Browse BUP curriculum (left side) and Cambridge book structure (right side)
3. Expand units to see subsections and their objectives
4. Use this to inform your unit content planning
5. Future: Select specific book subsections to include in your unit plan

## Connection to Previous Work

This complements the existing curriculum comparison system:
- **BUP data**: Structured by modules → units → subunits (already complete)
- **Cambridge objectives**: Official curriculum goals (already complete)
- **Cambridge book**: NEW - Textbook structure for practical planning
- **Connections**: Manual mappings showing BUP ↔ Cambridge alignments (8 examples complete, ~50-70 potential)

The book structure provides a **practical teaching perspective**, while the objectives provide the **assessment/standards perspective**.

---

*Last Updated: October 22, 2025*
*Status: Stage 9 complete, Stages 7-8 pending*
*Related: CURRICULUM_CONNECTIONS.md*



