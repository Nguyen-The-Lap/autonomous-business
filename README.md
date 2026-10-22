# Clearbrief

Clearbrief is a private project scoping workspace for independent consultants. Save a client, scope notes, and a starting estimate; return to edit or delete the brief later. The product does not generate contracts, send proposals, take payments, or provide accounting advice. The landing page and pricing state the current free offer; there is no payment integration or validated revenue claim.

## Run locally

Requirements: Node.js 20.19+ and npm. A Supabase project is required for authentication and saved briefs.

1. Create a Supabase project in the [Supabase dashboard](https://supabase.com/dashboard). No service-role key is required by the running application.
2. In **Project Settings → API**, copy the **Project URL** and the **anon/public key**. The public anon key is designed for browser use; access is restricted by Auth and the database's RLS policies.
3. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. In the Supabase SQL Editor, run [`supabase/migrations/202610230001_create_projects.sql`](supabase/migrations/202610230001_create_projects.sql) in full. It creates the projects table, ownership index, timestamp trigger, grants, and RLS policies.
5. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to **Redirect URLs**. Configure your production callback URL before deployment. Keep email confirmation enabled for production; local signup confirmation depends on the email settings in your Supabase project.
6. Install and run:

   ```powershell
   npm install
   npm run dev
   ```

   Open <http://localhost:3000>. Sign up, confirm your email if requested, then create your first brief.

The dashboard requires valid Supabase environment variables and a live project. The landing and account form render without credentials, but authentication, database access, and live RLS behavior cannot be verified without a configured Supabase project.

## Architecture and security

- Next.js App Router, React, strict TypeScript, Tailwind CSS v4, and reusable shadcn-style primitives built on Radix UI. Lucide provides the interface icons.
- Supabase Auth and Postgres; `@supabase/ssr` stores and refreshes sessions through server-managed cookies. Protected data is read in a server component and mutations run as server actions after `auth.getUser()`.
- Zod validates credentials and project fields on the server. The database repeats important text and estimate constraints.
- RLS is enabled for `public.projects`. Authenticated users can select, insert, update, and delete only rows whose `user_id` equals `auth.uid()`. Anonymous table access is revoked. The app never uses a service-role key.
- The sample brief shown on the landing page is illustrative copy, not a customer story or testimonial. Customer data remains private; no analytics, file storage, email marketing, or payments are integrated.
- Project notes can contain client information. Use a private Supabase project and review the provider's data processing, region, backup, and retention settings before storing real client data.

## Existing account and project data

The previous version used a local SQLite file (`DATA_DIR/clearbrief.sqlite`) or `database.json`. That data is not in Git and is not automatically copied to the hosted database. Back up the old data directory before changing deployment. The importer is a one-time administrative operation; it does not run with the web app:

1. Apply the migration above and create/invite each existing account in **Authentication → Users** using the same email address. This intentionally leaves password resets and account invitations under your control.
2. Open a local shell with Node 22.13+ and the package dependencies installed. Set `LEGACY_DATA_DIR` to the old data directory and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in that shell only. The service-role key bypasses RLS; never add it to `.env.local`, a `NEXT_PUBLIC_*` variable, source control, or a browser bundle.
3. Run `node scripts/import-legacy.mjs`. It verifies every legacy account has a matching Supabase Auth account before writing. Brief IDs are stable, so a retry updates the same rows. Existing passwords/sessions are not portable; account owners sign in with their new Supabase credentials.
4. Review the imported brief count in the dashboard before archiving the old data. Keep the original backup until verified.

The importer supports the previous SQLite database and `database.json`. Do not run it against an untrusted source; it requires privileged Supabase credentials and only supports the original Clearbrief schema.

## Checks

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm audit
npm run build
```

Unit tests cover Zod validation and accessible auth form rendering. Mocked server-action integration tests cover invalid input, server-side ownership assignment, and expired sessions without a live Supabase project. Playwright covers public landing, pricing, and sign-in/signup navigation; authenticated browser and live backend tests require configured Supabase credentials and are not simulated. See [`TEST_REPORT.md`](TEST_REPORT.md) for commands and actual results.

## Deployment

Deploy with a Node.js host that supports Next.js App Router. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the production `NEXT_PUBLIC_SITE_URL` as runtime/build environment variables. Apply versioned SQL migrations to the target Supabase project, allow the exact production `/auth/callback` URL in Supabase Auth settings, enforce HTTPS, and leave email confirmation enabled. Configure the host's secure headers, monitoring, log retention, and backup policy. Run `npm run build` and `npm start`; no deployment has been performed.

Never set `SUPABASE_SERVICE_ROLE_KEY` on the web application host. It is only needed for the optional, local legacy import and should be removed from the shell after that task.

## Business model and acquisition hypothesis

The initial audience is solo brand, web, and strategy consultants who want a private place to capture scope and a first estimate. This is a positioning hypothesis, not demonstrated demand. The current product is free. A future paid offer could include branded exports or reusable templates only after interviews demonstrate willingness to pay; no pricing or revenue is validated.

Start acquisition with no-cost interviews (with permission), useful scoping templates, and participation in consultant communities. Measure activation and repeat use only after choosing a privacy-respecting analytics approach. Avoid paid ads until retention and willingness to pay are supported by evidence. For a small commercial launch using Vercel Pro and Supabase Pro, budget about **US$45/month before usage overages, domain, email delivery, monitoring add-ons, taxes, and support**: Vercel Pro lists a $20/month platform fee with one deploy seat and $20 usage credit, while Supabase Pro starts at $25/month. Vercel Hobby is limited to personal, non-commercial use. These are current list prices, not a quote or authorization to purchase; check the [Vercel plan details](https://vercel.com/docs/plans/pro-plan), [Vercel Hobby terms](https://vercel.com/docs/plans/hobby), and [Supabase pricing](https://supabase.com/pricing) before choosing providers. A production Supabase Pro project includes daily backups retained for 7 days; confirm whether that retention suits customer data. No money has been spent, account has been created, or public deployment has been made for this work.
