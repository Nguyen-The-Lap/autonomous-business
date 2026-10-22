# Clearbrief

Clearbrief helps independent consultants turn an early client conversation into a saved project outline and starting estimate. This repository contains a complete, self-hostable MVP. It makes no claims about market demand or revenue.

## Run locally

Requirements: Node.js 20 or newer. There are no runtime or development dependencies to install.

```sh
cp .env.example .env
npm start
```

Open <http://localhost:3000>. Create an account using a valid email and a password of at least 10 characters. The first account is ready immediately; there is no external identity, mail, payment, or AI service configured. In PowerShell, use `Copy-Item .env.example .env` for the copy command.

Data is stored in `./data/database.json` and excluded from version control. Back up that directory before upgrades. Sessions are stored in process memory and expire when the process stops. Set `DATA_DIR` to a durable private volume and `COOKIE_SECURE=true` behind HTTPS in production. Keep the data directory private and configure backups and retention appropriate to your customers.

## Product

- Responsive landing page, product explanation, onboarding, and transparent pricing page.
- Account signup and sign-in; passwords are salted and hashed with Node's built-in scrypt.
- Private project CRUD with server-side validation and per-account ownership checks.
- SameSite, HttpOnly sessions; mutating API requests reject a mismatched Origin; security headers and generic server errors.
- No third-party runtime services or analytics.

The MVP intentionally stores project notes and estimates only. It does not generate legal contracts, send proposals, collect payments, or provide accounting advice. Estimates default to USD in the current interface; the server stores a numeric amount. International currency selection is a follow-up before broader launch.

## Production build and deployment

```sh
npm run build
cd dist
node server.js
```

The build copies the application into `dist/`. Deploy to a Node.js host or private VM that supports Node 20+, persistent disk, HTTPS termination, and environment variables. Set `PORT`, `DATA_DIR` to a persistent location outside the release directory, and `COOKIE_SECURE=true`. Run one application process because the MVP uses a JSON file and in-memory sessions; do not horizontally scale it. Use a reverse proxy with request limits and rate limiting, restrictive filesystem permissions, encrypted backups, and monitoring. For multiple instances or higher availability, replace JSON persistence and process memory sessions with a managed SQL database and shared session store before scaling. No paid service has been provisioned and no deployment has been performed.

## Business model and go-to-market hypothesis

Initial positioning: a lightweight scoping workspace for solo brand, web, and strategy consultants who want a repeatable first step between discovery and a formal proposal. The working hypothesis is that keeping a brief and estimate together can reduce scope ambiguity. This is an assumption to validate, not proven customer demand.

Start with a free product to learn which parts consultants reuse. Interview prospective users and seek permission before using their workflow examples. Test acquisition through practical, search-oriented scope templates, independent consultant communities, and partnerships with freelancer educators. Track signup-to-first-brief and repeat use with privacy-respecting aggregate metrics only after a consent and privacy design. Avoid paid ads until retention and willingness to pay are demonstrated. A possible later plan is a paid tier for branded exports, reusable templates, and client collaboration, priced only after interviews and experiments establish value.

Operating cost scenario (not a commitment): Render's [July 2026 cost guide](https://render.com/articles/how-much-does-cloud-application-hosting-cost-for-small-businesses) estimates about $13/month for an always-on Starter web service and Basic 256 MB Postgres on its free Hobby workspace, before bandwidth and storage growth; persistent disk is billed separately where needed. That is a reference point for a small production setup after migrating this MVP from JSON to Postgres, not a quote for every provider. Verify the [current pricing](https://render.com/pricing) before choosing a host. Domain registration, backups, monitoring, email, taxes, founder time, support, security reviews, and legal/privacy review are additional costs and vary by choice and region. No spending has been authorized or incurred.

## Checks

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

This project uses built-in Node syntax checks instead of a separate linter or TypeScript compiler, since the MVP has no external dependencies and is written in JavaScript. The HTTP end-to-end integration test launches the actual server and exercises signup, authentication, validation, project access control, updates, deletes, and origin rejection. There is no browser automation dependency; responsive behavior and keyboard interaction should also be checked manually before public launch. See [TEST_REPORT.md](TEST_REPORT.md) for results.

## Configuration

See [.env.example](.env.example). Do not put credentials in source control. There are no external credentials required for local MVP use. Contact email is a placeholder and should be replaced with a monitored business address before customer launch.
