# Test Inventory - Websites Monorepo

This document lists all tests in the websites monorepo, organized by category, with their locations and brief descriptions of what each test covers.

## Table of Contents

- [Infrastructure Tests](#infrastructure-tests)
- [Accessibility Tests](#accessibility-tests)
- [API Route Tests](#api-route-tests)
- [E2E Tests](#e2e-tests)
- [Component Tests](#component-tests)
- [Utility Tests](#utility-tests)
- [Game Management Tests](#game-management-tests)
- [Content Tests](#content-tests)
- [Tools Tests](#tools-tests)

---

## Infrastructure Tests

### API Infrastructure

- **Location**: `apps/ittweb/__tests__/infrastructure/api/routeHandlers.test.ts`
- **Description**: Tests the API route handler infrastructure including method validation, authentication, body validation, error handling, cache control, and helper functions.

### Logging Infrastructure

- **Location**: `apps/ittweb/__tests__/infrastructure/logging/logger.test.ts`
- **Description**: Tests the logging infrastructure including log levels, component loggers, error categorization, log formatting, and environment-specific behavior.

### Firebase Infrastructure

- **Location**: `apps/ittweb/__tests__/infrastructure/api/firebase/firestoreHelpers.test.ts`
- **Description**: Tests Firestore helper functions that work with both server-side admin SDK and client-side SDK, including document retrieval and collection queries.

- **Location**: `apps/ittweb/__tests__/infrastructure/api/firebase/firebaseClient.test.ts`
- **Description**: Tests Firebase client initialization, singleton instances for Firestore and Storage, and analytics initialization.

- **Location**: `apps/ittweb/__tests__/infrastructure/api/firebase/config.test.ts`
- **Description**: Tests Firebase client configuration retrieval from environment variables and validation of required fields.

- **Location**: `apps/ittweb/__tests__/infrastructure/api/firebase/admin.test.ts`
- **Description**: Tests Firebase Admin SDK initialization, service account credentials, singleton instances, and error handling.

---

## Accessibility Tests

### Screen Reader Compatibility

- **Location**: `apps/ittweb/__tests__/accessibility/screenReader.test.tsx`
- **Description**: Tests screen reader compatibility including semantic HTML, ARIA labels, dynamic content announcements, form accessibility, and image alt text.

### Keyboard Navigation

- **Location**: `apps/ittweb/__tests__/accessibility/keyboardNavigation.test.tsx`
- **Description**: Tests keyboard accessibility including tab order, focus management, keyboard event handling (Enter, Space, Escape), and focusable element detection.

### Focus Management

- **Location**: `apps/ittweb/__tests__/accessibility/focusManagement.test.tsx`
- **Description**: Tests focus management including logical focus order, modal focus trapping, focus return on modal close, and dynamic content focus handling.

### ARIA Labels

- **Location**: `apps/ittweb/__tests__/accessibility/ariaLabels.test.tsx`
- **Description**: Tests ARIA label presence and correctness for interactive elements, form inputs, buttons, and complex components.

---

## API Route Tests

### Health Check

- **Location**: `apps/ittweb/src/pages/api/__tests__/health.test.ts`
- **Description**: Tests the health check endpoint including database connectivity checks, error handling, and method validation.

### Revalidation

- **Location**: `apps/ittweb/src/pages/api/__tests__/revalidate.test.ts`
- **Description**: Tests the revalidation endpoint for cache invalidation.

### User API

- **Location**: `apps/ittweb/src/pages/api/user/__tests__/delete.test.ts`
- **Description**: Tests user deletion endpoint.

- **Location**: `apps/ittweb/src/pages/api/user/__tests__/data-notice-status.test.ts`
- **Description**: Tests endpoint for checking data notice acceptance status.

- **Location**: `apps/ittweb/src/pages/api/user/__tests__/accept-data-notice.test.ts`
- **Description**: Tests endpoint for accepting data notice.

### Players API

- **Location**: `apps/ittweb/src/pages/api/players/__tests__/index.test.ts`
- **Description**: Tests the players list endpoint including pagination, limits, and caching.

- **Location**: `apps/ittweb/src/pages/api/players/__tests__/[name].test.ts`
- **Description**: Tests individual player lookup by name endpoint.

- **Location**: `apps/ittweb/src/pages/api/players/__tests__/search.test.ts`
- **Description**: Tests player search functionality endpoint.

- **Location**: `apps/ittweb/src/pages/api/players/__tests__/compare.test.ts`
- **Description**: Tests player comparison endpoint.

### Games API

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/index.test.ts`
- **Description**: Tests the games list endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id].test.ts`
- **Description**: Tests individual game detail endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/upload-replay.test.ts`
- **Description**: Tests replay file upload endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id]/upload-replay.test.ts`
- **Description**: Tests replay upload for specific game endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id]/join.test.ts`
- **Description**: Tests joining a game endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id]/join-bot.test.ts`
- **Description**: Tests joining a game as a bot endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id]/leave.test.ts`
- **Description**: Tests leaving a game endpoint.

- **Location**: `apps/ittweb/src/pages/api/games/__tests__/[id]/leave-bot.test.ts`
- **Description**: Tests removing a bot from a game endpoint.

### Entries API

- **Location**: `apps/ittweb/src/pages/api/entries/__tests__/index.test.ts`
- **Description**: Tests the entries list endpoint.

- **Location**: `apps/ittweb/src/pages/api/entries/__tests__/[id].test.ts`
- **Description**: Tests individual entry detail endpoint.

### Posts API

- **Location**: `apps/ittweb/src/pages/api/posts/__tests__/index.test.ts`
- **Description**: Tests the posts list endpoint.

- **Location**: `apps/ittweb/src/pages/api/posts/__tests__/[id].test.ts`
- **Description**: Tests individual post detail endpoint.

### Standings API

- **Location**: `apps/ittweb/src/pages/api/standings/__tests__/index.test.ts`
- **Description**: Tests the standings/leaderboard endpoint.

### Classes API

- **Location**: `apps/ittweb/src/pages/api/classes/__tests__/index.test.ts`
- **Description**: Tests the classes list endpoint.

- **Location**: `apps/ittweb/src/pages/api/classes/__tests__/[className].test.ts`
- **Description**: Tests individual class detail endpoint.

### Items API

- **Location**: `apps/ittweb/src/pages/api/items/__tests__/index.test.ts`
- **Description**: Tests the items list endpoint.

### Icons API

- **Location**: `apps/ittweb/src/pages/api/icons/__tests__/list.test.ts`
- **Description**: Tests the icons list endpoint.

### Analytics API

- **Location**: `apps/ittweb/src/pages/api/analytics/__tests__/activity.test.ts`
- **Description**: Tests player activity analytics endpoint.

- **Location**: `apps/ittweb/src/pages/api/analytics/__tests__/elo-history.test.ts`
- **Description**: Tests ELO rating history analytics endpoint.

- **Location**: `apps/ittweb/src/pages/api/analytics/__tests__/meta.test.ts`
- **Description**: Tests meta analytics endpoint.

- **Location**: `apps/ittweb/src/pages/api/analytics/__tests__/win-rate.test.ts`
- **Description**: Tests win rate analytics endpoint.

### Admin API

- **Location**: `apps/ittweb/src/pages/api/admin/__tests__/wipe-test-data.test.ts`
- **Description**: Tests admin endpoint for wiping test data.

---

## E2E Tests

### Console Errors

- **Location**: `apps/ittweb/e2e/console-errors.spec.ts`
- **Description**: E2E test that checks all public pages for console errors, warnings, and failed network requests.

### Homepage

- **Location**: `apps/ittweb/e2e/homepage.spec.ts`
- **Description**: E2E tests for homepage including page load, navigation to games/players/standings pages.

### Games

- **Location**: `apps/ittweb/e2e/games.spec.ts`
- **Description**: E2E tests for games page including list display, filters, and game detail navigation.

### Authentication

- **Location**: `apps/ittweb/e2e/auth.spec.ts`
- **Description**: E2E tests for authentication including login prompts, unauthenticated access handling, and responsive design across viewports.

---

## Component Tests

### Personal Page - About Me

- **Location**: `apps/personalpage/src/features/modules/aboutme/components/__tests__/AboutMePage.test.tsx`
- **Description**: Tests the About Me page component including header, professional summary, technical skills, experience, projects, education, languages, and interests sections.

### Personal Page - Connecting Vessels

- **Location**: `apps/personalpage/src/features/modules/connecting_vessels/components/__tests__/ConnectingVesselsPage.test.tsx`
- **Description**: Tests the Connecting Vessels project page including project overview, role description, photo gallery, technical details, and open source section.

---

## Utility Tests

### Date Utilities

- **Location**: `apps/personalpage/src/features/modules/calendar/utils/dateUtils.test.ts`
- **Description**: Tests date utility functions including date formatting, end time calculation, and available time gap calculation for calendar events.

### Shared Utilities

- **Location**: `apps/ittweb/src/features/modules/shared/utils/__tests__/index.test.ts`
- **Description**: Tests shared utility functions used across the application.

---

## Game Management Tests

### Scheduled Games

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/utils/__tests__/timezoneUtils.test.ts`
- **Description**: Tests timezone utility functions for scheduled games.

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/lib/__tests__/scheduledGameService.test.ts`
- **Description**: Tests the scheduled game service including game creation, updates, and queries.

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/components/__tests__/CreateGameInlineForm.test.tsx`
- **Description**: Tests the inline form component for creating scheduled games.

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/components/__tests__/EditGameForm.test.tsx`
- **Description**: Tests the form component for editing scheduled games.

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/components/__tests__/ScheduledGamesList.test.tsx`
- **Description**: Tests the scheduled games list component.

- **Location**: `apps/ittweb/src/features/modules/game-management/scheduled-games/components/__tests__/UploadReplayModal.test.tsx`
- **Description**: Tests the modal component for uploading game replays.

### Game Mechanics

- **Location**: `apps/ittweb/src/features/modules/game-management/lib/mechanics/__tests__/eloCalculator.test.ts`
- **Description**: Tests ELO rating calculation including ELO changes, team ELO calculation, and score updates.

- **Location**: `apps/ittweb/src/features/modules/game-management/lib/mechanics/__tests__/replayParser.test.ts`
- **Description**: Tests replay file parsing functionality.

- **Location**: `apps/ittweb/src/features/modules/game-management/lib/mechanics/__tests__/w3mmdUtils.test.ts`
- **Description**: Tests W3MMD (Warcraft 3 Map Metadata) utility functions.

### Games

- **Location**: `apps/ittweb/src/features/modules/game-management/games/lib/__tests__/gameService.test.ts`
- **Description**: Tests the game service including game retrieval, creation, and updates.

- **Location**: `apps/ittweb/src/features/modules/game-management/games/hooks/__tests__/useGame.test.ts`
- **Description**: Tests the useGame hook for fetching individual game data.

- **Location**: `apps/ittweb/src/features/modules/game-management/games/hooks/__tests__/useGames.test.ts`
- **Description**: Tests the useGames hook for fetching games list.

### Entries

- **Location**: `apps/ittweb/src/features/modules/game-management/entries/lib/__tests__/entryService.test.ts`
- **Description**: Tests the entry service for game entries.

---

## Content Tests

### Classes

- **Location**: `apps/ittweb/src/features/modules/content/classes/hooks/__tests__/useClassesData.test.ts`
- **Description**: Tests the hook for fetching classes data.

- **Location**: `apps/ittweb/src/features/modules/content/classes/hooks/__tests__/useClassesData.test.tsx`
- **Description**: Tests the React hook component for classes data.

### Guides

- **Location**: `apps/ittweb/src/features/modules/content/guides/hooks/__tests__/useItemsData.test.ts`
- **Description**: Tests the hook for fetching items/guides data.

---

## Tools Tests

### Icon Mapper

- **Location**: `apps/ittweb/src/features/modules/tools-group/tools/__tests__/icon-mapper.utils.test.ts`
- **Description**: Tests utility functions for the icon mapper tool.

- **Location**: `apps/ittweb/src/features/modules/tools-group/tools/__tests__/useIconMapperData.test.ts`
- **Description**: Tests the hook for icon mapper data.

### Map Analyzer

- **Location**: `apps/ittweb/src/features/modules/tools-group/map-analyzer/utils/__tests__/mapUtils.test.ts`
- **Description**: Tests map analysis utility functions.

- **Location**: `apps/ittweb/src/features/modules/tools-group/map-analyzer/components/__tests__/HeightDistributionChart.test.tsx`
- **Description**: Tests the height distribution chart component for map analysis.

---

## Summary

- **Total Test Files**: 136+ test files
- **Test Categories**:
  - Infrastructure (6 tests)
  - Accessibility (4 tests)
  - API Routes (33+ tests)
  - E2E Tests (4 tests)
  - Component Tests (2 tests)
  - Utility Tests (2+ tests)
  - Game Management (12+ tests)
  - Content (3+ tests)
  - Tools (4+ tests)

All tests use Jest for unit/integration testing and Playwright for E2E testing. The test suite covers infrastructure, API endpoints, accessibility, game mechanics, and UI components.
