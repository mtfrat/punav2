# Puna Operations dashboard

Private SSR dashboard available at `https://www.puna-tech.com/ops` after the database and Auth setup below.

## One-time activation

1. Back up the existing Supabase database.
2. Apply the migrations through the normal workflow, in this order (all are safe to retry after a failed first run):
   - `supabase/migrations/20260825190000_bilingual_editorial_content.sql`
   - `supabase/migrations/20260826170000_acquisition_and_content_briefs.sql`
   - `supabase/migrations/20260826220000_private_operations_dashboard.sql`
   - `supabase/migrations/20260827013000_agency_positioning.sql`

   The production `public.posts` table was verified as the legacy six-column
   schema (`id`, `created_at`, `title`, `content`, `image_url`, `status`). The
   first migration backfills from those exact fields and does not assume an
   `author` column. The existing `public.leads` table belongs to the historical
   ROI calculator and intentionally remains separate from `public.website_leads`,
   which stores project-brief submissions for the operations dashboard.
3. In Supabase Auth, disable public user signups.
4. Create or invite the user `punatechba@gmail.com`.
5. Add these exact redirect URLs to the Supabase Auth allowlist:
   - `https://www.puna-tech.com/ops/auth/callback`
   - `http://localhost:3000/ops/auth/callback` for local development only.
6. Configure these server-only environment variables in the production runtime:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL=punatechba@gmail.com`
7. Build and release through the existing deployment process. No platform-specific dashboard action is required by the application.

## Operational boundaries

- The browser never receives the service-role key and never queries private tables directly.
- Draft approval never publishes an article or sends an email.
- Publishing a content pair is a separate confirmed action affecting both locales.
- Prospect and distribution approvals are records of human review; messages remain manual.
- The executions page is read-only and cannot start, pause or retry n8n.
- `/ops/*` is excluded from the sitemap, public navigation, GA4, Clarity and Cal.com, and is served with `noindex` and `no-store` headers.

## Local verification

Use a local environment containing the four variables above, run `npm run dev`, then open `http://localhost:3000/ops/login`. Request the magic link with the allowlisted email and confirm that the callback returns to `/ops`.

Before release, run:

```bash
npm test
```
