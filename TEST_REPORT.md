# Test report

Run on 2026-10-23 with Node.js v22.19.0 and npm 11.7.0. No dependencies were installed.

| Check | Command | Result |
| --- | --- | --- |
| Unit and HTTP end-to-end | `npm test` | Passed: 4 tests, 0 failures |
| Lint gate | `npm run lint` | Passed: Node syntax checks for server, browser app, and core module |
| Type-check gate | `npm run typecheck` | Passed: Node syntax checks; project is plain JavaScript, so no static type compiler is configured |
| Production build | `npm run build` | Passed: bundle created in `dist/` |

The end-to-end test launches an isolated HTTP server and covers account registration, duplicate signup, failed login, unauthorized access, cross-origin write rejection, invalid input, project create/read/update/delete, and project ownership between accounts. Unit tests cover input sanitization, estimate validation, and password hashing. Browser automation, screen-reader testing, and load testing were not run because no such tools are configured in this dependency-free repository.
