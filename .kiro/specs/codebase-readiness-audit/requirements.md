# Requirements Document: Flavatix Codebase Readiness Audit

## Introduction

This document captures the requirements for achieving 100% production readiness for the Flavatix (FlavorWheel) application. The audit systematically identifies all gaps, blockers, inconsistencies, and UX violations across database, API, frontend, and integration layers.

## Glossary

- **Flavatix**: The tasting application (also known as FlavorWheel)
- **Quick_Tasting**: A casual tasting session without structured evaluation
- **Study_Mode**: A structured tasting session with custom categories and templates
- **Competition_Mode**: A tasting session with correct answers and participant ranking
- **RLS**: Row Level Security - Supabase/PostgreSQL access control mechanism
- **Flavor_Wheel**: AI-generated visualization of flavor descriptors
- **Social_Feed**: Community feed showing completed tastings with likes/comments/shares

## Requirements

### Requirement 1: Database Schema Completeness

**User Story:** As a system administrator, I want all database tables to have complete CRUD operations, proper RLS policies, and referential integrity, so that data is secure and consistent.

#### Acceptance Criteria

1. THE Database SHALL have all tables defined in schema.sql and migrations applied consistently
2. WHEN a table is created THEN the Database SHALL have RLS enabled with appropriate policies for SELECT, INSERT, UPDATE, DELETE
3. THE Database SHALL have foreign key constraints with proper CASCADE rules to prevent orphan records
4. THE Database SHALL have indexes on all foreign key columns and frequently filtered columns
5. WHEN a record is updated THEN the Database SHALL automatically update the `updated_at` timestamp via triggers

### Requirement 2: Schema Synchronization

**User Story:** As a developer, I want the main schema.sql to reflect all migrations, so that the database state is predictable and documented.

#### Acceptance Criteria

1. THE schema.sql SHALL include all columns added by flavorwheel_upgrade_migration.sql (mode, study_approach, rank_participants, is_blind_*, etc.)
2. THE schema.sql SHALL include the tasting_participants table
3. THE schema.sql SHALL include the tasting_item_suggestions table
4. THE schema.sql SHALL include all social tables (tasting_likes, tasting_comments, tasting_shares, user_follows)
5. THE schema.sql SHALL include all competition mode tables (competition_answer_keys, competition_responses, competition_leaderboard, competition_item_metadata)
6. THE schema.sql SHALL include all study mode tables (study_sessions, study_categories, study_participants, study_items, study_responses, study_ai_cache)
7. THE schema.sql SHALL include all flavor wheel tables (flavor_descriptors, flavor_wheels, aroma_molecules, category_taxonomies, ai_extraction_logs)

### Requirement 3: API Endpoint Completeness

**User Story:** As a frontend developer, I want all necessary API endpoints to exist with proper authentication and validation, so that the UI can perform all required operations.

#### Acceptance Criteria

1. THE API SHALL have endpoints for all CRUD operations on quick_tastings
2. THE API SHALL have endpoints for all CRUD operations on quick_tasting_items
3. THE API SHALL have endpoints for tasting_participants management
4. THE API SHALL have endpoints for competition mode (answer keys, responses, leaderboard)
5. THE API SHALL have endpoints for study mode (sessions, categories, responses)
6. THE API SHALL have endpoints for social features (likes, comments, shares, follows)
7. WHEN an API endpoint requires authentication THEN it SHALL use the withAuth middleware
8. WHEN an API endpoint accepts input THEN it SHALL validate using Zod schemas via withValidation middleware

### Requirement 4: Frontend-Backend Integration

**User Story:** As a user, I want all UI actions to correctly communicate with the backend, so that my data is saved and displayed accurately.

#### Acceptance Criteria

1. WHEN a user creates a tasting session THEN the System SHALL persist it to the database and display success feedback
2. WHEN a backend operation fails THEN the System SHALL display an error message and NOT show success feedback
3. WHEN data is loading THEN the System SHALL display a loading state
4. WHEN no data exists THEN the System SHALL display an appropriate empty state
5. THE System SHALL NOT display contradictory feedback (success followed by error)

### Requirement 5: UX State Machine Correctness

**User Story:** As a user, I want the application to maintain consistent state across modes, so that I am never confused about what actions are available.

#### Acceptance Criteria

1. WHEN in Quick_Tasting mode THEN the System SHALL NOT query tasting_participants table
2. WHEN in Study_Mode THEN the System SHALL load participant roles and permissions
3. WHEN in Competition_Mode THEN the System SHALL prevent adding new items
4. THE System SHALL NOT expose edit controls when user lacks permission
5. WHEN navigating between items THEN the System SHALL maintain the current mode context
6. THE System SHALL NOT allow navigation to invalid states

### Requirement 6: Error Handling and Resilience

**User Story:** As a user, I want the application to handle errors gracefully, so that I can continue using it even when problems occur.

#### Acceptance Criteria

1. THE Application SHALL have ErrorBoundary components at appropriate levels
2. WHEN a network request fails THEN the System SHALL display a user-friendly error message
3. WHEN a database operation fails THEN the System SHALL NOT leave the UI in an inconsistent state
4. THE System SHALL log errors to Sentry with appropriate context
5. THE System SHALL NOT swallow errors silently

### Requirement 7: Social Features Completeness

**User Story:** As a user, I want to interact with other users' tastings through likes, comments, and follows, so that I can engage with the community.

#### Acceptance Criteria

1. THE Social_Feed SHALL display completed tastings from all users
2. WHEN a user likes a tasting THEN the System SHALL persist the like and update the count
3. WHEN a user comments on a tasting THEN the System SHALL persist the comment with threading support
4. WHEN a user follows another user THEN the System SHALL persist the relationship
5. THE Social_Feed SHALL support filtering by "Following" tab
6. THE System SHALL prevent users from following themselves

### Requirement 8: Competition Mode Completeness

**User Story:** As a host, I want to create competition sessions with correct answers and rankings, so that participants can be scored.

#### Acceptance Criteria

1. THE Competition_Mode SHALL require preloaded items with correct answers
2. THE System SHALL score participant responses against answer keys
3. THE System SHALL calculate and display leaderboard rankings
4. THE System SHALL support multiple parameter types (multiple_choice, true_false, range, etc.)
5. WHEN a participant submits a response THEN the System SHALL update the leaderboard

### Requirement 9: Study Mode Completeness

**User Story:** As a host, I want to create study sessions with custom categories, so that participants can evaluate items using structured criteria.

#### Acceptance Criteria

1. THE Study_Mode SHALL support predefined and collaborative approaches
2. THE System SHALL allow hosts to define custom evaluation categories
3. THE System SHALL support text, scale, and boolean parameter types
4. WHEN in collaborative mode THEN participants SHALL be able to suggest items
5. THE System SHALL support real-time collaboration via Supabase Realtime

### Requirement 10: Flavor Wheel Feature Completeness

**User Story:** As a user, I want to see AI-generated flavor wheel visualizations of my tasting notes, so that I can understand my flavor preferences.

#### Acceptance Criteria

1. THE System SHALL extract flavor descriptors from tasting notes using AI
2. THE System SHALL generate flavor wheel visualizations from extracted descriptors
3. THE System SHALL support personal, universal, item, category, and tasting scopes
4. THE System SHALL cache generated wheels with appropriate expiration
5. THE System SHALL allow PDF export of flavor wheels

### Requirement 11: Testing Coverage

**User Story:** As a developer, I want comprehensive test coverage, so that regressions are caught before deployment.

#### Acceptance Criteria

1. THE Codebase SHALL have unit tests for critical business logic
2. THE Codebase SHALL have integration tests for API endpoints
3. THE Codebase SHALL have E2E tests for critical user flows
4. THE Tests SHALL cover error paths, not just happy paths
5. THE Tests SHALL NOT use mocks that hide real failures

### Requirement 12: Production Observability

**User Story:** As an operator, I want comprehensive logging and monitoring, so that I can diagnose issues in production.

#### Acceptance Criteria

1. THE Application SHALL send errors to Sentry with full context
2. THE Application SHALL log API requests with request IDs for tracing
3. THE Application SHALL detect and log slow requests
4. THE Application SHALL have environment separation (dev/staging/prod)
