# Puna Tech website

Bilingual acquisition website for Puna Tech, built with React Router Framework Mode, React 19, Tailwind CSS, Supabase, and the Vercel React Router adapter.

## Local development

Requirements: Node.js 22.12 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development server uses port 3000 by default. Run `npm test` before deploying.

## Environment variables

- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: server-side public blog reads.
- `SUPABASE_SERVICE_ROLE_KEY`: server-side project-brief storage and n8n editorial writes. Never expose this value to the browser.
- `OPENAI_API_KEY`: optional server-side assistant. Without it, the assistant returns a safe handoff message.

n8n-only secrets such as `APIFY_API_TOKEN` and SMTP credentials are documented in `n8n/README.md` and must not be added to the frontend environment.

Legacy `VITE_SUPABASE_*` values are accepted temporarily for blog reads, but new environments should use the server variable names above.

## Content and routing

- English is canonical at `/`; Spanish is under `/es`.
- Marketing pages are statically prerendered. Blog indexes and posts are server-rendered from published Supabase records.
- Metadata, canonical URLs, reciprocal language alternates, structured data, `sitemap.xml`, and `llms.txt` are rendered by route loaders.
- `/en/*` and known legacy blog identifiers permanently redirect to their canonical paths.
- Industry guides live at `/industries/automotive-dealers`, `/industries/agricultural-equipment-dealers`, `/es/industrias/concesionarias`, and `/es/industrias/maquinaria-agricola`. They are explicitly illustrative and do not claim undisclosed sector work.
- Open Graph cards are localized, full-frame 1200×630 assets at `/og-en.png` and `/og-es.png`.

## Database and editorial workflow

1. Back up the linked database and apply both migrations in `supabase/migrations/` in timestamp order.
2. Import the error logger and main editorial/prospecting workflows from `n8n/`.
3. Follow `n8n/README.md` to configure credentials and complete both draft-only dry runs.

The public blog loaders return only `published` records. The editorial automation writes English and Spanish records as `draft`; publication is a manual Supabase status change after review. Prospect emails are also drafts and are never sent automatically.

## Deployment checks

Use a Vercel preview before production. Verify both languages, legacy redirects, genuine 404 responses, form and Cal.com events, the generated sitemap, keyboard navigation, and responsive layouts. Apply the database migration and n8n workflow separately; a frontend deployment does not change either system.
