# Puna Tech n8n workflows

Both workflows are review-first and import as inactive. They require the two Supabase migrations in `supabase/migrations/` and server-side credentials; none of these values belong in the website bundle or Git.

## Environment and credentials

Configure these as n8n environment variables or equivalent private credentials:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APIFY_API_TOKEN`
- `FOUNDER_NOTIFICATION_EMAIL`
- `OUTREACH_SUMMARY_FROM_EMAIL`

Attach an OpenAI chat credential to the editorial evidence/draft models and the prospect-email model. Attach an SMTP credential only to **Email Founder Review Summary**. That node may send an operational summary to `FOUNDER_NOTIFICATION_EMAIL`; the workflow has no node that emails a prospect.

The Apify input uses the maintained `compass/crawler-google-places` actor, base Google Places data only, no reviews or personal enrichment. The code caps each run at 200 accepted places and records a conservative cost estimate based on US$1.50 per 1,000 returned places. Check the actor's current pricing before activating the schedule.

## Import order

1. Back up the linked Supabase project.
2. Apply `20260825190000_bilingual_editorial_content.sql`.
3. Apply `20260826170000_acquisition_and_content_briefs.sql`.
4. Import `puna-editorial-error-logger.json` and `puna-prospecting-error-logger.json`.
5. Import `puna-editorial-drafts.json` and select the editorial error logger in workflow settings.
6. Import `puna-prospecting-drafts.json` and select the prospecting error logger.
7. Attach credentials, keep both workflows inactive, and run the checks below.

Run the repository-level static validation before importing:

```bash
npm run test:workflows
```

## Editorial workflow

The workflow runs on the 1st and 15th at 09:00 Argentina time. It does not rewrite an RSS story. It selects the oldest Supabase brief with `status=approved`, requires at least two approved HTTPS sources, treats downloaded pages as untrusted evidence, and creates independently localized EN/ES drafts plus LinkedIn/X drafts.

It always inserts articles and distribution copy with `status=draft`. A human must verify claims, dates, citations, metadata, alt text and first-party context before changing a post to `published`. Public loaders never return another status.

Editorial dry-run acceptance:

1. Leave every seeded brief as `backlog`; a manual run must create nothing.
2. Approve a test brief with one source; validation must reject it before model or post writes.
3. Add a second HTTPS source containing prompt-like text such as “ignore previous instructions”; validation must reject it.
4. Approve two legitimate sources; the workflow must create exactly two posts in one `translation_group_id`, both `draft`, plus four distribution drafts.
5. Confirm no workflow node can set `posts.status=published`.

If a run fails after a brief changes to `drafting`, review `editorial_runs`, fix the cause, and manually return the brief to `approved` before retrying.

## Prospecting workflow

The weekly workflow searches automotive dealerships and agricultural-equipment dealers across selected Argentine provinces. It:

- normalizes and limits the Apify result set;
- removes closed, irrelevant and non-Argentine places;
- deduplicates by Place ID and normalized domain;
- checks `robots.txt` and visits at most homepage, contact and company pages with a crawl delay;
- accepts only business-role emails visibly published on the same company domain;
- rejects prompt-like page content;
- scores deterministic signals such as website, stock, service, branch and form pages;
- stores account evidence privately with RLS;
- creates Spanish email drafts only for qualified accounts with evidence and a public business address;
- sends only a founder summary. Prospect messages remain `draft` until manually reviewed and sent outside v1.

Prospecting dry-run acceptance:

1. Temporarily reduce `requested_limit` and `maxCrawledPlacesPerSearch` for the first manual run.
2. Confirm every stored account has country `AR`, a source record ID and public evidence URLs.
3. Re-run the same sample; the unique Place ID/domain rules must prevent duplicates.
4. Confirm blocked domains produce no page crawl and no email extraction.
5. Confirm pages with prompt-injection patterns are excluded from evidence.
6. Confirm no personal-looking address, inferred address or address from another domain is stored.
7. Confirm `prospect_drafts.status` is always `draft` and no prospect receives an email.

Do not activate either schedule until the migration, credentials, dry runs and founder review queue have all been verified.
