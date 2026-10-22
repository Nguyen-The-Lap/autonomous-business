# Security audit

Audit date: 2026-10-23  
Scope: checked-in Clearbrief Next.js application source, Supabase migration, server actions, auth callback, runtime configuration, and declared dependencies. No live Supabase project, production data, or external deployment was accessed.

## Findings and changes

### High — Host-header based auth callback redirect (fixed)

`app/auth/callback/route.ts` previously constructed absolute redirect URLs from `request.url`. On deployments that accept a client-controlled `Host` or forwarded-host header, the auth callback could issue a redirect to an attacker-controlled origin. Both callback outcomes now use a relative `Location` and HTTP 303. `tests/auth-callback.test.ts` covers successful and failed code exchanges with a poisoned host. The regression test is written but could not be executed because dependencies could not be installed (see verification).

### Medium — Declared Supabase client version is unavailable (fixed)

`package.json` requested `@supabase/supabase-js@2.121.0`, which the configured registry returned as not found (HTTP 404). It is now pinned to `2.118.0`, the registry version available during this audit and within `@supabase/ssr@0.12.7`'s declared `^2.114.0` peer range. A complete install, lockfile generation, and vulnerability audit remain blocked by disk exhaustion, so the resolved dependency tree is not verified.

## Controls reviewed

- **Authentication and sessions:** Supabase SSR Auth is used; the dashboard calls `auth.getUser()` before showing data, and project mutations check the server-side user. Login errors are generic. The callback accepts only a code and has fixed relative destinations. Production cookie attributes and refresh behavior were not verified against a running HTTPS deployment.
- **Authorization and RLS:** the migration enables RLS, revokes `anon` table privileges, grants CRUD only to `authenticated`, and applies owner equality checks in `USING` and `WITH CHECK` on all four operations. Inserts assign `user_id` from the authenticated server user. No service-role key is used in the runtime app. These source-level controls were reviewed; isolation was not exercised against Postgres.
- **Injection and XSS:** project inputs use Zod validation and database constraints; rendering uses React text nodes, with no `dangerouslySetInnerHTML`, `innerHTML`, or `eval` usage found in the source scan. No raw SQL interpolation or user-controlled server fetch was found. This is a source review, not dynamic testing.
- **CSRF:** mutations use Next.js Server Actions, which perform origin checks by framework default; no custom cross-origin mutation endpoint was found. This behavior was not tested over HTTP.
- **SSRF and uploads:** no user-controlled outbound fetch or file upload/storage flow exists in the reviewed application.
- **Security headers:** `next.config.ts` disables the powered-by header and sets `nosniff`, `DENY` framing, strict-origin referrer policy, a restrictive permissions policy, and HSTS. A Content Security Policy is not configured; consider adding a nonce-based policy after validating Next.js inline script requirements.
- **Secrets:** the tracked environment template contains public Supabase placeholders only. `.gitignore` excludes `.env*` other than `.env.example`; the tracked-file check found only the template. A pattern scan matched that example file because it documents the service-role variable name; no credential value was found in the checked-in source. The optional importer requires an administrator-supplied service-role key at invocation and does not store it in source.
- **Rate limiting:** no application-level rate limiter is present. Authentication traffic depends on Supabase Auth/provider limits; signup and authenticated write abuse limits must be configured/monitored at the provider or hosting edge. Availability and configuration were not verified.
- **Dependencies:** registry metadata showed the original Supabase JS pin does not exist. `npm audit` could not run because there is no lockfile. No claim about vulnerability status of the complete dependency tree is made.

## Verification results

All commands were run from the repository on 2026-10-23. No result below is represented as a pass unless it completed successfully.

| Check | Command | Result |
| --- | --- | --- |
| Focused source inspection | `rg` scans for HTML injection sinks, dynamic evaluation, redirects, fetches, Supabase clients, and service-role references; read migration and auth/action files | Completed; findings summarized above. |
| Secret/tracked-file scan | `git ls-files` check for env/lock files and `rg` credential-pattern scan | Only `.env.example` is tracked among env files; the scan match was the documented service-role variable name in that template, not a credential. |
| Dependency metadata | `npm view @supabase/supabase-js@2.121.0 version`; `npm view @supabase/supabase-js version`; `npm view @supabase/ssr version peerDependencies` | Confirmed 2.121.0 unavailable; 2.118.0 available and in peer range. |
| Static syntax/config | `node --check scripts/import-legacy.mjs`; parse `package.json` with Node | Passed. |
| Install/lockfile | `npm install` (approved registry access) | Failed: first attempt reported the unavailable 2.121.0 pin; retry after correction failed with `ENOSPC` while fetching `mdn-data`. The environment reports zero free space. No cache or build artifacts were deleted. |
| Regression test | Added `tests/auth-callback.test.ts` | Not run: Vitest is unavailable because installation failed. |
| Lint | `npm run lint` | Not run: `eslint` executable unavailable. |
| TypeScript | `npm run typecheck` | Failed to complete meaningfully: global `tsc` ran but reported unresolved application/test dependencies and resulting type errors because modules are not installed. |
| Unit/integration tests | `npm test` | Not run: `vitest` executable unavailable. |
| End-to-end tests | `npm run test:e2e` | Not run: Playwright executable unavailable. |
| Dependency audit | `npm audit` | Not run: npm returned `ENOLOCK` because no lockfile exists. |
| Production build | `npm run build` | Not run: `next` executable unavailable. |
| Live authentication/RLS | Requires an isolated Supabase project | Not run: credentials/project were not provided; no production data was accessed. |

## Remaining risks and next verification

1. Free disk space without deleting repository/user data, then run `npm install` to generate and review `package-lock.json`; run `npm audit`, lint, typecheck, Vitest, Playwright, and production build.
2. Apply the migration to a disposable Supabase project and test two-user CRUD isolation, signup/login, session refresh, and callback behavior. Confirm production Auth redirect allowlists and provider rate limits.
3. Configure a nonce-based Content Security Policy and an application/edge rate limit appropriate to signup and writes before a public launch.
4. Confirm HTTPS, HSTS behavior, secure cookie attributes, logging/retention, backups, and provider policies in the eventual hosting environment.

## Verification rerun

The repository was rechecked on 2026-10-23 before any audit-pass edits. The working tree was already dirty, including the callback redirect fix, its regression test, and this audit document; those existing changes were treated as user work and preserved. No additional application code changes were warranted by the source review.

| Check | Actual result in this audit pass |
| --- | --- |
| Repository and test inspection | Completed. `AGENTS.md`, `git status`, project files, security-sensitive source, migration, and existing Vitest/Playwright tests were inspected. |
| Source pattern review | Completed. No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, or user-controlled outbound fetch was found in app source. Owner-scoped RLS policies and server-side auth checks were reviewed. |
| Tracked environment files | `git ls-files` found `.env.example`; no lockfile is tracked. The template contains placeholders and a commented service-role variable name only. |
| Unit/integration tests | `npm test` did not run: `vitest` is not installed (`not recognized as an internal or external command`). |
| Lint | `npm run lint` did not run: `eslint` is not installed. |
| TypeScript | `npm run typecheck` failed because project dependencies/types are unavailable; output contains unresolved imports and consequent type errors. This is not a successful type check. |
| End-to-end tests | `npm run test:e2e` did not run: `playwright` is not installed. |
| Production build | `npm run build` did not run: `next` is not installed. |
| Dependency vulnerability scan | `npm audit` failed with `ENOLOCK` because the repository has no lockfile. No dependency vulnerability status is asserted. |
| Dependency installation | Not attempted in this rerun. The prior audit records an `ENOSPC` install failure; no files or caches were deleted to make room. |

The callback regression test already present in `tests/auth-callback.test.ts` covers both callback outcomes with an attacker-controlled Host header, but remains unexecuted until dependencies can be installed. The test and source fix are therefore reviewed, not dynamically verified.
