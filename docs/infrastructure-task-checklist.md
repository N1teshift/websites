# Infrastructure Centralization Analysis

## Analysis Phase
- [x] Explore monorepo structure
- [x] Examine existing packages
- [x] Analyze ittweb infrastructure
- [x] Analyze personalpage infrastructure
- [x] Analyze MafaldaGarcia infrastructure
- [x] Identify duplication patterns
- [x] Create comprehensive analysis document
- [x] Present findings to user

## Planning Phase
- [x] Prioritize centralization candidates
- [x] Design package structure
- [x] Plan migration strategy
- [x] Create implementation plan
- [x] Create detailed step-by-step guide

## Phase 1: Core API Infrastructure
- [ ] Extract route handlers from ittweb
- [ ] Extract query parsers from ittweb
- [ ] Extract Zod validation from ittweb
- [ ] Create package structure
- [ ] Add tests
- [ ] Update ittweb imports
- [ ] Update personalpage imports
- [ ] Verify all apps

## Phase 2: Firebase Integration
- [ ] Extract Firebase admin from both apps
- [ ] Extract Firebase client from both apps
- [ ] Consolidate Firestore helpers
- [ ] Create unified error handling
- [ ] Add tests
- [ ] Update all app imports
- [ ] Verify all apps

## Phase 3: Authentication
- [ ] Extract OAuth from personalpage
- [ ] Extract session management
- [ ] Extract user service
- [ ] Integrate next-auth patterns from ittweb
- [ ] Create AuthContext
- [ ] Add tests
- [ ] Update app imports
- [ ] Verify auth flows

## Phase 4: External API Clients
- [ ] Extract OpenAI client from personalpage
- [ ] Extract Google client from personalpage
- [ ] Extract Microsoft client from personalpage
- [ ] Extract email client
- [ ] Add tests for each client
- [ ] Update app imports
- [ ] Verify integrations

## Phase 5: Caching
- [ ] Extract SWR config from ittweb
- [ ] Extract request cache from ittweb
- [ ] Extract analytics cache from ittweb
- [ ] Consolidate cache strategies
- [ ] Add tests
- [ ] Update app imports
- [ ] Verify caching behavior

## Phase 6: Utils & Hooks
- [ ] Extract hooks from ittweb
- [ ] Extract utilities from both apps
- [ ] Organize by category
- [ ] Add tests
- [ ] Update app imports
- [ ] Verify functionality

## Phase 7: Monitoring
- [ ] Extract monitoring from ittweb
- [ ] Create monitoring package
- [ ] Add tests
- [ ] Update app imports
- [ ] Verify monitoring

## Phase 8: Testing Infrastructure
- [ ] Expand test-utils package
- [ ] Add mock factories
- [ ] Add test helpers
- [ ] Update all test files
- [ ] Verify all tests pass

## Final Verification
- [ ] Run all tests across all apps
- [ ] Build all apps
- [ ] Manual testing of each app
- [ ] Update documentation
- [ ] Clean up old code
