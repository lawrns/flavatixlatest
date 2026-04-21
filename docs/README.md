# Flavatix Docs

This directory contains the maintained project documentation. Historical reports, assessments, and one-off delivery artifacts live under `docs/archive/`.

## Core Docs

- [Getting Started](./GETTING_STARTED.md)
- [Development](./DEVELOPMENT.md)
- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Database](./DATABASE.md)
- [Component Catalog](./COMPONENT_CATALOG.md)
- [Layout System](./LAYOUT_SYSTEM.md)
- [Project Context](./PROJECT_CONTEXT.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Testing Status](./TEST_SUITE_STATUS.md)

## Current Product Shape

- `/dashboard` is the overview surface.
- `/taste` is the action hub for sessions, review, and flavor tools.
- `PageLayout` and `Container` are the canonical width and shell primitives.

## Topic Areas

- `docs/features/` for feature-specific documentation
- `docs/testing/` for test plans and testing notes
- `docs/plans/` for current implementation plans
- `docs/archive/` for historical material that is no longer part of the maintained doc surface

## Canonical Rule

If a document describes the current product or development workflow, keep it in `docs/`.
If it is a snapshot, summary, audit, or implementation report for a past effort, archive it under `docs/archive/`.
