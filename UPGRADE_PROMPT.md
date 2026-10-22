Upgrade the existing business app to a modern, complete full-stack React application.

STACK:
- Next.js App Router, React, strict TypeScript
- Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons
- Supabase hosted backend for database, authentication, and file storage when needed
- @supabase/ssr for secure Next.js cookie-based authentication
- Zod for input validation
- Vitest, React Testing Library, Playwright
- ESLint and genuine TypeScript type checking

BACKEND:
- Use Supabase for persistent data and authentication.
- Do not use MongoDB, SQLite, local JSON files, or in-memory persistence for production.
- Keep secrets server-side. Never expose service-role keys in frontend code.
- Configure Row Level Security (RLS) policies so users can only access authorized data.
- Use secure server-side authorization and validate all untrusted inputs.
- Add database schema migrations and indexes.
- Use environment variables and provide a complete .env.example.
- Do not assume external credentials exist.

UI/UX:
- Redesign the product with premium visual quality, excellent usability, responsive layouts, accessible forms, clear navigation, loading/empty/error states, and consistent design tokens.
- Preserve existing working business functionality and user data.

TESTING:
- Run lint, type checking, unit tests, integration tests, browser tests, dependency audits, and production build.
- Fix failures and rerun tests.
- Never fabricate test results.
- If Supabase credentials are unavailable, use mocked tests where appropriate and clearly mark live integrations as unverified.

EXECUTION:
- Inspect the repository and Git status first.
- Create a safe checkpoint before risky changes.
- Implement the upgrade instead of merely writing a plan.
- Optimize token use by reading relevant files only, avoiding repeated scans and unnecessary dependencies.
- Never spend money, create accounts, or deploy publicly without authorization.

FINAL:
- Document the exact setup steps, Supabase dashboard configuration, required environment variables, database migrations, deployment instructions, and actual test results.
- Continue until the product is implemented and verified or genuinely blocked.
