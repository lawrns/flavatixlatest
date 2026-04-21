# Flavatix Guide Index

This file is the curated index for the maintained documentation set. Historical reports and one-off delivery notes live under `docs/archive/`.

## Start Here

- [GETTING_STARTED.md](./GETTING_STARTED.md) for first-time setup
- [DEVELOPMENT.md](./DEVELOPMENT.md) for day-to-day workflow
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for the command cheat sheet
- [ONBOARDING.md](./ONBOARDING.md) for team onboarding and first-week tasks

## Build and Change the Product

- [ARCHITECTURE.md](./ARCHITECTURE.md) for the system overview
- [ARCHITECTURE_STATE_MANAGEMENT.md](./ARCHITECTURE_STATE_MANAGEMENT.md) for auth, hooks, and app state patterns
- [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md) for endpoint implementation patterns
- [DATABASE.md](./DATABASE.md) for schema and data model details
- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) for reusable UI inventory
- [API_REFERENCE.md](./API_REFERENCE.md) for the current endpoint surface

## Test and Debug

- [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md) for Jest and RTL usage
- [TEST_SUITE_STATUS.md](./TEST_SUITE_STATUS.md) for the current suite baseline and ownership notes
- [COVERAGE_MATRIX.md](./COVERAGE_MATRIX.md) for coverage expectations
- [DEBUG_API_ERRORS.md](./DEBUG_API_ERRORS.md) for request/response debugging
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common local and CI issues

## Deploy and Operate

- [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md) for required variables
- [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md) for release workflow
- [SECURITY.md](./SECURITY.md) for security posture and expectations
- [redis-rate-limiting.md](./redis-rate-limiting.md) for production rate limiting
- [api-design-patterns.md](./api-design-patterns.md) for middleware and response conventions
- [api-versioning.md](./api-versioning.md) for compatibility strategy

## Supporting Areas

- `docs/features/` for feature-specific notes
- `docs/testing/` for focused test plans
- `docs/plans/` for active implementation plans
- `docs/archive/` for superseded material

## Suggested Paths

### New contributor

1. Read [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Skim [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Review [DEVELOPMENT.md](./DEVELOPMENT.md)
4. Keep [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) open

### Shipping a feature

1. Review [FEATURES_API_ENDPOINTS.md](./FEATURES_API_ENDPOINTS.md)
2. Check [DATABASE.md](./DATABASE.md) if data changes are involved
3. Verify against [TESTING_UNIT_TESTS.md](./TESTING_UNIT_TESTS.md) and [TEST_SUITE_STATUS.md](./TEST_SUITE_STATUS.md)
4. Finish with [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)

### Investigating a failure

1. Start with [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Use [DEBUG_API_ERRORS.md](./DEBUG_API_ERRORS.md) for API issues
3. Check [TEST_SUITE_STATUS.md](./TEST_SUITE_STATUS.md) for known test debt
4. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for verification commands
