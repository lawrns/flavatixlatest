# Implementation Plan: Flavatix Codebase Readiness Audit

## Overview

This implementation plan addresses all gaps identified in the codebase audit, organized by priority. Tasks are structured to be executed incrementally with checkpoints for validation.

## Tasks

- [ ] 1. CRITICAL: Database Schema Synchronization
  - [ ] 1.1 Regenerate schema.sql from production database
    - Export current production schema using pg_dump
    - Replace schema.sql content with exported schema
    - Verify all tables from migrations are present
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 1.2 Verify RLS policies are applied
    - Query pg_policies for all tables
    - Compare against expected policies from migrations
    - Document any missing policies
    - _Requirements: 1.2_

  - [ ] 1.3 Add missing indexes on foreign keys
    - Query information_schema for foreign keys without indexes
    - Create migration for missing indexes
    - _Requirements: 1.4_

- [ ] 2. CRITICAL: API Endpoint Completeness
  - [ ] 2.1 Create tasting CRUD endpoints
    - Create `pages/api/tastings/[id]/index.ts` with GET, PUT, DELETE
    - Use withAuth and withValidation middleware
    - Add proper error handling and logging
    - _Requirements: 3.1, 3.7, 3.8_

  - [ ] 2.2 Write integration tests for tasting CRUD
    - Test GET returns tasting with items
    - Test PUT updates tasting fields
    - Test DELETE removes tasting and items
    - Test unauthorized access returns 401
    - _Requirements: 11.2_

  - [ ] 2.3 Create tasting items CRUD endpoints
    - Create `pages/api/tastings/[id]/items/index.ts` with GET, POST
    - Create `pages/api/tastings/[id]/items/[itemId].ts` with GET, PUT, DELETE
    - Validate tasting ownership before item operations
    - _Requirements: 3.2, 3.7, 3.8_

  - [ ] 2.4 Write integration tests for items CRUD
    - Test item creation adds to tasting
    - Test item update modifies fields
    - Test item deletion removes from tasting
    - Test cross-tasting access denied
    - _Requirements: 11.2_

  - [ ] 2.5 Create participants management endpoints
    - Create `pages/api/tastings/[id]/participants/index.ts`
    - Support adding/removing participants
    - Enforce host-only access for management
    - _Requirements: 3.3, 3.7_

- [ ] 3. Checkpoint - Verify API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. CRITICAL: Fix UX State Machine Issues
  - [ ] 4.1 Fix contradictory toast patterns
    - Audit all toast.success calls in components
    - Move success toasts after async completion
    - Ensure error toasts only show on failure
    - Files: `components/quick-tasting/QuickTastingSession.tsx`, `pages/social.tsx`, `hooks/useSocialFeed.ts`
    - _Requirements: 4.2, 4.5_

  - [ ] 4.2 Write tests for toast behavior
    - **Property 6: Feedback Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.5**

  - [ ] 4.3 Add ErrorBoundary to critical sections
    - Wrap QuickTastingSession in ErrorBoundary
    - Wrap competition pages in ErrorBoundary
    - Wrap social feed in ErrorBoundary
    - Create section-specific fallback UIs
    - _Requirements: 6.1_

  - [ ] 4.4 Hide edit controls based on permissions
    - Add permission checks before rendering edit buttons
    - Hide "Add Item" in competition mode
    - Hide management controls for non-hosts
    - Files: `components/quick-tasting/QuickTastingSession.tsx`
    - _Requirements: 5.4_

  - [ ] 4.5 Write tests for permission-based UI
    - **Property 8: Permission-Based UI**
    - **Validates: Requirements 5.4**

- [ ] 5. Checkpoint - Verify UX fixes complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. HIGH: Social Features API
  - [ ] 6.1 Create social likes endpoint
    - Create `pages/api/social/likes.ts` with POST, DELETE
    - Toggle like on POST (create or delete)
    - Return updated like count
    - _Requirements: 7.2_

  - [ ] 6.2 Create social comments endpoint
    - Create `pages/api/social/comments.ts` with GET, POST, DELETE
    - Support threading via parent_comment_id
    - Return comments with user profiles
    - _Requirements: 7.3_

  - [ ] 6.3 Create social follows endpoint
    - Create `pages/api/social/follows.ts` with POST, DELETE
    - Prevent self-follow
    - Return updated follower counts
    - _Requirements: 7.4_

  - [ ] 6.4 Write integration tests for social API
    - Test like toggle behavior
    - Test comment creation and threading
    - Test follow/unfollow
    - Test self-follow prevention
    - _Requirements: 11.2_

- [ ] 7. HIGH: Refactor Frontend to Use API
  - [ ] 7.1 Create API client utility
    - Create `lib/api/client.ts` with typed fetch wrapper
    - Handle authentication token injection
    - Handle error response parsing
    - _Requirements: 4.1_

  - [ ] 7.2 Refactor QuickTastingSession to use API
    - Replace direct Supabase calls with API calls
    - Use API client for item CRUD
    - Maintain optimistic updates with rollback
    - _Requirements: 4.1, 4.2_

  - [ ] 7.3 Refactor social features to use API
    - Replace direct Supabase calls in useSocialFeed
    - Use API client for likes/comments/follows
    - Maintain optimistic updates with rollback
    - _Requirements: 4.1, 4.2_

- [ ] 8. Checkpoint - Verify API integration complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. HIGH: Add Loading and Empty States
  - [ ] 9.1 Add loading states to async operations
    - Add loading spinners to buttons during submission
    - Add skeleton loaders for data fetching
    - Disable buttons during loading
    - _Requirements: 4.3_

  - [ ] 9.2 Add empty states to all lists
    - Add empty state to tasting items list
    - Add empty state to social feed
    - Add empty state to my-tastings page
    - Include call-to-action in empty states
    - _Requirements: 4.4_

- [ ] 10. HIGH: E2E Test Coverage
  - [ ] 10.1 Write E2E test for tasting creation flow
    - Test category selection
    - Test item addition
    - Test score entry
    - Test session completion
    - _Requirements: 11.3_

  - [ ] 10.2 Write E2E test for social features
    - Test like interaction
    - Test comment creation
    - Test follow interaction
    - _Requirements: 11.3_

  - [ ] 10.3 Write E2E test for competition mode
    - Test competition creation with items
    - Test answer submission
    - Test leaderboard display
    - _Requirements: 11.3_

- [ ] 11. Checkpoint - Verify E2E tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. MEDIUM: Security Hardening
  - [ ] 12.1 Apply rate limiting to public endpoints
    - Add withRateLimit to auth endpoints (10 req/min)
    - Add withRateLimit to API endpoints (60 req/min)
    - Add withRateLimit to public endpoints (100 req/min)
    - _Requirements: 3.7_

  - [ ] 12.2 Apply CSRF protection
    - Add withCsrfProtection to state-changing endpoints
    - Generate CSRF token on session creation
    - Validate token on mutations
    - _Requirements: 3.7_

- [ ] 13. MEDIUM: Error Handling Improvements
  - [ ] 13.1 Add retry logic for transient failures
    - Create retry utility in `lib/utils/retry.ts`
    - Apply to network requests
    - Configure exponential backoff
    - _Requirements: 6.2_

  - [ ] 13.2 Improve error messages
    - Map error codes to user-friendly messages
    - Add context to Sentry reports
    - Log request IDs for debugging
    - _Requirements: 6.2, 12.1_

- [ ] 14. MEDIUM: Property-Based Tests
  - [ ] 14.1 Write property test for database security
    - **Property 1: Database Security Completeness**
    - **Validates: Requirements 1.2**

  - [ ] 14.2 Write property test for API authentication
    - **Property 4: API Authentication Enforcement**
    - **Validates: Requirements 3.7**

  - [ ] 14.3 Write property test for mode-specific behavior
    - **Property 7: Mode-Specific Behavior**
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [ ] 15. Final Checkpoint - Production Readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Verify readiness score improved to 90+

## Notes

- All tasks are required for comprehensive production readiness
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
