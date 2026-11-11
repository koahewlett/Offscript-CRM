# OFFSCRIPT HQ — Implemented Foundation

This repository is a **working-development starter**, NOT the complete production application requested in the full specification. It includes a Next.js App Router shell, Supabase login, organization-scoped RLS schema, a canonical People CRM CRUD flow, many-to-many roles/affiliations, basic event creation, and intentionally honest empty states. It does not claim a configured POSH integration.

## Stack
- Next.js 15 / React 19 / TypeScript strict mode / Tailwind
- Supabase Auth, PostgreSQL migrations, RLS
- Zod validation
- Responsive charcoal UI

The requested shadcn/ui, TanStack Table, Recharts, advanced imports, commission engine, full POSH pipeline, audit-complete workflows and expanded test coverage are not fully wired into this starter.

## Start locally

1. Create a Supabase project. Its secrets are external prerequisites, not included.
2. Copy `.env.example` to `.env.local`; set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project.
3. Install Node.js 20+ and run:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Database setup

Apply migrations in order using the Supabase SQL editor or Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Alternatively paste the content of `supabase/migrations/0001_core.sql` followed by `0002_person_rpc.sql` into the SQL editor.

### Securely initialize the organization

There is **no public sign-up route** in the application. Create the first authenticated account manually in the Supabase Auth administrator console (or another trusted admin pathway). Find the created user's UUID. From the trusted Supabase SQL editor, run:

```sql
begin;
insert into public.organizations(name) values ('OFFSCRIPT')
returning id;
-- Use returned org ID and the actual auth.users.id below:
insert into public.organization_members (organization_id,user_id,role)
values ('REPLACE-WITH-ORG-UUID','REPLACE-WITH-USER-UUID','owner');
commit;
```

This is intentionally a privileged setup step rather than a public bootstrap API. To add a second manager, create/invite their Auth account through the Supabase administrator console, then insert an `organization_members` row with `role='manager'` from a trusted context. A complete application-owned invite workflow is **not built yet**.

Create the default roles using the Settings UI:
`Promoter`, `DJ`, `Security`, `Venue Manager`, `Venue Owner`, `Influencer`, `Photographer`, `Videographer`, `Event Staff`, `Event Organizer`, `Bartender`, `Business Partner`, `Other`.

## Implemented workflows

- Email/password login, logout, recovery initiation, reset page.
- Authenticated users must be active members of an organization to access private pages.
- Owner and Manager can create, edit, and archive people.
- Contacts may have multiple roles and affiliations, with atomic relational updates via `save_person`.
- Search contacts by first name, last name, email, Instagram; filter by age class; paginate results.
- Basic contact detail view and read-only Viewer access.
- Create and list basic events.
- Promoters list reuses canonical People rows.
- Settings supports adding role types and affiliations.
- Overview counts actual organization records; no invented sales.
- An unconfigured POSH endpoint responds `503`; this is deliberate.
- Unit tests demonstrate integer-cent math and source-order deduplication of snapshots, **not** a working ticketing integration.

## Commands

```bash
npm run dev        # local development
npm run typecheck  # static TypeScript check
npm run test       # unit tests
npm run build      # Next.js production build
npm run start      # serve the production build
```

## Vercel

1. Push this directory to a private Git repository.
2. Create a Vercel project from the repository.
3. Set the two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel project.
4. Ensure the corresponding Supabase project migrations are applied.
5. Configure Supabase Auth URL settings for the Vercel domain and allow the `/reset-password` redirect.
6. Deploy and verify login, tenant membership, People creation, editing, and archiving.

No service-role key should be present in a public environment variable. All sensitive tables rely on server-side membership checks and Supabase RLS. Invite-only Auth requires administrative onboarding and should be complemented by Supabase project settings that prevent undesired registration methods.

## POSH: prerequisites, NOT configured

Requested documentation for verification:
- https://support.posh.vip/en/articles/15091630-mailchimp-webhooks-connecting-external-tools
- https://support.posh.vip/en/articles/15077072-event-marketing-managing-kickback-affiliates-tracking-links-host-sales
- https://support.posh.vip/en/articles/15267292-export-event-report-downloading-your-attendee-info

Because official current POSH webhook schemas, trust/authentication properties, and real organizer payloads have not been verified here, `/api/integrations/posh/webhook` returns 503 and does **not** ingest any data.

Before enabling the endpoint, implement a verified adapter based on real fixtures and official docs, replay protection, an authenticated ingestion mechanism, transaction-based order upserts, net-refund reconciliation, safe tracking identity mapping, CSV column mapping/import reconciliation, attribution review, and provenance-aware analytics. Never treat unverified POSH integration as connected.

## Limitations and next engineering phases

The comprehensive 20-section request exceeds the delivered starter. Key gaps:
- No POSH integration/CSV ingestion or persisted ticketing model yet.
- No production-grade promoter leaderboards, ticket attribution, affiliations analytics, commissions, payments or finance dashboards.
- No event detail/assignment editor, venue CRUD, staffing management, note creation, or contact merge.
- No contact CSV import/export, advanced filters, saved views, consent management or global search.
- No admin invitation UI or optional MFA onboarding. Password recovery must be tested against your configured Supabase redirect settings.
- No comprehensive integration/e2e/RLS tests; run tenant-isolation and authorization checks against a provisioned Supabase test project.
- No rate limiting for API endpoints; do not deploy publicly without adding it.
- Event datetime form interprets the entered local time in the user's browser timezone, while the IANA timezone is stored separately; a timezone-aware form is required for accurate multi-zone event scheduling.
- A basic archive audit write currently occurs as a separate database operation and should be made transactional before production.

### Security note
This code is an engineering foundation, not a security certification. Run dependency audit, full authorization and RLS integration tests, import security checks, and staging verification before processing sensitive contacts or sales data.

## Status of tests

The test files were authored but not run against an installed dependency tree in this environment. `npm run test`, `npm run typecheck`, and `npm run build` must all be executed in an environment able to install the dependencies. No test pass is claimed without such execution.
