# TODO List

## Platform Performance, Testing & Documentation
- [ ] Complete bundle analysis optimization actions
- [ ] Optimize imports per analyzer report
- [ ] Improve code splitting per analyzer report
- [ ] Run SEO audit for meta tags and semantic HTML
- [ ] Run accessibility audit for WCAG compliance
- [ ] Extract custom hooks for complex component logic
- [ ] Increase utility unit test coverage above 80%
- [ ] Add integration tests for Math Generators flows
- [ ] Add integration tests for Unit Plan Generator flows
- [ ] Update documentation for completed features
- [ ] Document new implementation patterns
- [ ] Keep architecture documentation current

## Calendar & External Integrations
- [ ] Investigate Microsoft login route
- [ ] Flesh out calendar API clients and wire hooks
- [ ] Fix email sending for the calendar feature
- [ ] Implement data fetching for mock data in `src/pages/projects/emw/counting-precincts.tsx`

## Product Decisions & Business Logic
- [ ] Evaluate input placeholder templating approach
- [ ] Decide on “shadow event” logic in `src/pages/api/auth/callback-microsoft.ts`

## App Router & Routing Security
- [ ] Create App Router migration plan
- [ ] Replace `next-i18next` with a new i18n strategy
- [ ] Convert `_app.tsx` and layouts to `src/app/layout.tsx`
- [ ] Move pages to App Router starting with static pages
- [ ] Replace `next/head` usage with the Metadata API
- [ ] Identify components suitable for server rendering
- [ ] Add authentication check to `routeHandlers.ts` with `requireAuth`

## AI Platform & Validation
- [ ] Address hardcoded API key and factory in `src/features/infrastructure/ai/lang/runnables.ts`
- [ ] Implement validation checks in `src/features/infrastructure/ai/validation/settingsValidator.ts`
- [ ] Implement placeholder validators in `src/features/infrastructure/ai/validation/structureValidator.ts`
- [ ] Define system prompts in `src/features/infrastructure/ai/prompts/systemPrompts/index.ts`
- [ ] Review OpenAI proxy response parsing resilience
- [ ] Investigate TypeScript errors from `langgraphjs`
- [ ] Replace `validateObjectSettings` casts with Zod schemas
- [ ] Strengthen `generateObjectFactory.ts` typing
- [ ] Remove `any` usage in `src/features/infrastructure/ai/lang/graph.ts` by defining typed reducers
- [ ] Add validation for `rules` array content and types
- [ ] Add validation for `range` array content and types
- [ ] Add validation for `coefficients` array content and types
- [ ] Implement validation for `EquationSettings`
- [ ] Implement validation for `FunctionSettings`
- [ ] Implement validation for `InequalitySettings`
- [ ] Implement validation for `TermSettings`
- [ ] Implement validation for `TermsSettings`
- [ ] Implement validation for `ExpressionSettings`
- [ ] Implement validation for `PointSettings`
- [ ] Implement validation for `IntervalSettings`
- [ ] Implement validation for `SetSettings`
- [ ] Add validation for `minimumLength` in `generateObjectFactory.ts`
- [ ] Rename `rule` to `coefficientRule` in `propertyCategories.ts`

## Math & Generator Enhancements
- [ ] Implement exercise formatting logic in `src/features/modules/math/exercisesGenerator/components/Exercise.ts`
- [ ] Implement exam generator functionality in `src/features/modules/math/examsGenerator/pages/ExamGeneratorPage.tsx`

## Type Safety & Code Quality
- [ ] Review `as any` usage in `src/features/infrastructure/ai/lang/graph.ts`
- [ ] Minimize type assertions in `src/features/modules/math/exercisesGenerator/components/ExerciseDetails.tsx`
- [ ] Consolidate duplicate schemas between JSON and Zod implementations
- [ ] Review code marked with `@remarks` annotations

## Architecture, Caching & Error Handling
- [ ] Evaluate `localStorage` cache strategy in `src/features/infrastructure/shared/utils/cacheUtils.ts`
- [ ] Evaluate `Date.now()` usage in IdBuilder classes
- [ ] Implement project-wide error handling aligned with the logging framework
- [ ] Improve ID parsing robustness in `src/pages/api/firestore/saveExercise.ts`