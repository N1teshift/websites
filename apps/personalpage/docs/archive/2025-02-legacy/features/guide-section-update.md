# Guide Section Update

## Overview

Updated the Guide tab in the Progress Report Dashboard to better reflect the current feature set by removing the outdated "Filter and Sort" section and adding cards for the three major generator features.

## Changes Made

### Removed
- **Step 4: Filter and Sort** - This was outdated and didn't match current functionality

### Added
- **Step 4: Track Learning Objectives** (Amber/Orange)
  - Links to Objectives tab
  - Describes Cambridge Learning Objectives tracking
  - Monitor student progress and mastery

- **Step 5: Generate Final Grades** (Indigo)
  - Links to Grade Generator tab
  - Describes automatic grade calculation
  - Based on MYP levels and performance metrics

- **Step 6: Create Student Comments** (Rose/Pink)
  - Links to Comments Generator tab
  - Describes personalized comment generation
  - Mentions templates for Math and English assessments

## Layout Changes

**Before:** 2-column grid (4 cards)
```
md:grid-cols-2
```

**After:** 3-column grid (6 cards)
```
md:grid-cols-2 lg:grid-cols-3
```

This creates a responsive layout:
- **Mobile**: 1 column
- **Tablet** (md): 2 columns
- **Desktop** (lg): 3 columns

## Visual Design

Each new card follows the existing pattern:
- **Colored background** with matching border
- **Numbered circle badge** (continues 1-6 sequence)
- **Title and description**
- **"Go to..." button** with matching color scheme

### Color Scheme
1. Blue - Data Management
2. Green - Class View
3. Purple - Student View
4. **Amber** - Objectives (new)
5. **Indigo** - Grade Generator (new)
6. **Rose** - Comments Generator (new)

## Benefits

1. **Complete Feature Coverage**
   - All major tabs now have guide cards
   - Users can discover all features easily

2. **Better Navigation**
   - Direct links to each feature
   - Clear descriptions of what each feature does

3. **Up-to-Date Information**
   - Removed outdated content
   - Reflects current dashboard capabilities

4. **Improved Layout**
   - 3-column grid looks better on wide screens
   - Still responsive on smaller devices

## Future Considerations

- Could add "New!" badges to recently added features
- Could differentiate content based on teacher type (Math vs English)
- Could add feature screenshots or GIFs
- Could include keyboard shortcuts or tips

## Files Modified

- `src/features/modules/edtech/progressReport/components/sections/GuideSection.tsx`

## Related Features

- Objectives Tab: `ObjectivesTabContainer.tsx`
- Grade Generator: `GradeGeneratorSection.tsx`
- Comments Generator: `CommentsGeneratorSection.tsx`

## Testing

✅ No linter errors
✅ Responsive layout (1/2/3 columns)
✅ All navigation buttons work
✅ Color scheme is consistent

