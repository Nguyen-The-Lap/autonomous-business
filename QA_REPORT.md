# QA report

Run date: 2026-10-23. Runtime: Node.js 22.19.0, npm 11.7.0. No Supabase credentials are configured. Results below distinguish executed checks from authored tests and mocked paths.

## Repository and baseline

- Read `AGENTS.md`, `package.json`, TypeScript/Vitest/Playwright configs, the app routes, server actions, validation schemas, database migration, existing unit/integration tests, and browser tests.
- Git was already on branch `master` with extensive pre-existing modifications and untracked application files. QA changes in this run are limited to `tests/actions.integration.test.ts` and this report; other preexisting work was left untouched.
- The project is a Next.js App Router application using strict TypeScript, Supabase Auth/Postgres, Zod server validation, Vitest/Testing Library, and Playwright.
- Baseline commands were run before this run's test additions:

| Exact command | Outcome |
| --- | --- |
| `npm run lint` | Blocked: `eslint` executable is not recognized. |
| `npm run typecheck` | Failed: global `tsc` ran and reported unresolved Next/React/Supabase/Zod/Vitest/Playwright packages and resulting type errors. This script is configured for real `tsc --noEmit` checking, not syntax-only validation. |
| `npm test` | Blocked: `vitest` executable is not recognized. |
| `npm run test:e2e` | Blocked: `playwright` executable is not recognized. |
| `npm run build` | Blocked: `next` executable is not recognized. |

The local dependency tree was incomplete. `npm install` and two elevated retries (including `npm install --verbose` and `npm install --prefer-offline --no-audit --no-fund`) did not complete or produce usable `node_modules/.bin` executables or a package lock. The verbose attempt read cached registry metadata and stalled during package reification; no successful install is claimed.

## QA changes

Added mocked server-action integration cases in `tests/actions.integration.test.ts` for:

- Updating an existing brief with normalized/validated fields and the requested row ID.
- Returning a not-found error when an update matches no row.
- Avoiding project storage access when authenticated user lookup fails.

These complement existing mocked coverage for server-side ownership on insert, invalid estimates/IDs, expired sessions, database deletion errors, rejected credentials, and invalid signup input. The tests are authored but not executed in this environment.

Existing tests also cover credential and project Zod boundaries, accessible auth form controls, auth callback behavior, and public landing/pricing/signup navigation. Browser tests include a 375px viewport overflow assertion. No confirmed application bug was reproduced during this run, so no application behavior was changed.

## Checks after QA changes

The scripts were retried after adding the cases; the environment remained without runnable local executables. `npm run lint` still reports `'eslint' is not recognized`; `npm test` reports `'vitest' is not recognized`; `npm run test:e2e` reports `'playwright' is not recognized`; and `npm run build` reports `'next' is not recognized`. `npm run typecheck` continues to execute `tsc --noEmit` and reports missing dependency declarations/modules, not a passing check. The new tests have not been run.

## Coverage gaps and limitations

- All server-action integration tests use mocks. There are no live Supabase Auth, Postgres CRUD, RLS ownership isolation, migration, or confirmation-email results.
- No signed-in browser CRUD/authorization scenario has been run; it requires Supabase credentials and test accounts.
- Playwright scenarios are authored but no browser run or layout/accessibility observation occurred because Playwright is unavailable.
- Responsive coverage currently targets a 375px public landing/signup flow. Dashboard breakpoints and browser accessibility audits are not verified.
- Duplicate-submit behavior is not yet covered by an executed test. A UI disabled-pending state exists, but its behavior remains unverified.
- No measured coverage percentage, lint result, typecheck success, test pass, or production build success is available.

## Release readiness

**Not release-ready based on available verification.** Dependency restoration is the immediate blocker to lint, strict typechecking, unit/integration tests, Playwright, and a production build. A configured disposable Supabase project is also needed to validate live authentication, CRUD, and RLS. No deployment, public account creation, or spending was performed.
