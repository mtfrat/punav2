# Content Studio worker — Phase 0 operations

## Inventory

- Puna Vercel project: `punav2` (`prj_Svi7cESO9zYYCu8zkHuMZgs9N1BV`), production alias `punav2.vercel.app` and custom domain `www.puna-tech.com`.
- Worker Vercel project: `autopost` (`prj_JzzgFPj1A9dfvUTPOLPECgK8LSBb`), production alias `autopost-ochre-two.vercel.app`.
- The projects use different Supabase instances. Their refs are recorded only as SHA-256 prefixes: Puna `046d02c65ebb`, Autopost `8af2e55e1f53`.
- Autopost remains connected to its current Supabase during Phase 0. No tables or Storage objects are migrated.

## Required configuration

Autopost requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (legacy `SUPABASE_KEY` remains a server-only compatibility alias), `PUNA_COMPANY_ID`, `AUTOPOST_WORKER_TOKEN`, `AUTOPOST_SCHEDULER_ENABLED=false` and `AUTOPOST_MUTATIONS_ENABLED=false`.

Puna requires `AUTOPOST_WORKER_URL`, the same `AUTOPOST_WORKER_TOKEN`, and `CONTENT_STUDIO_ENABLED=false`. Never create `VITE_*` or `NEXT_PUBLIC_*` variants for the token.

## Backup utility

The owner explicitly waived the backup for this Phase 0 deployment. The worker does not migrate data and all mutations remain disabled. For a later snapshot, load the Autopost credentials from `backend/.env` and run:

```sh
python scripts/inventory_backup.py --output /absolute/path/outside-the-repository
```

The output contains `schema-openapi.json`, one JSON file per protected table, Storage manifests for `brand-assets` and `generated-media`, and `manifest.json`. Backups and credentials must never be committed.

## Verification and rollback

- Run the worker security tests, then Puna's full test suite.
- With server-only production variables loaded, run `npm run verify:content-worker` from Puna.
- Confirm `/health` is public, `/api/v1/capabilities` is `401` without a token, mutations return `503`, `/docs` is `404`, and the old `/dashboard` redirects to `https://www.puna-tech.com/ops`.
- Rollback may redeploy code, but must retain worker authentication and keep both scheduler and mutation flags disabled.
