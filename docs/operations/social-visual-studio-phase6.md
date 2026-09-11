# Social Visual Studio — Phase 6

Phase 6 adds curated single-image presets, approved-image focal points, assisted carousels, and manual downloads. It does not add social connectors, automatic publishing, cron jobs, or image-generation providers.

## Feature flag

`CONTENT_VISUAL_STUDIO_ENABLED=true` enables the new controls only when `CONTENT_COMPOSER_ENABLED=true`. Keep it `false` during the initial deployment and database migration.

## Database ownership

- Apply `supabase/migrations/20260906120000_social_visual_system_phase6.sql` only to the Puna Supabase project `zaerzzgqxvaumhhchijb`.
- Apply `backend/renderer_documents_phase6.sql` from the Autopost repository only to the Autopost Supabase project `ebdvtndvjqtqfhxmhnub`.
- Do not apply Phase 5 migrations for this rollout.

The read-only Puna verification is `supabase/verify/20260906_social_visual_system_phase6.sql`. Expected existing production records remain 5 inactive legacy assets and 10 unchanged variants. New system presets are inserted idempotently.

## Safe rollout

1. Deploy Autopost with `AUTOPOST_MUTATIONS_ENABLED=false`.
2. Apply the Autopost renderer migration and run the worker test suite.
3. Enable worker mutations only for controlled rendering; the scheduler remains disabled.
4. Deploy Puna with `CONTENT_VISUAL_STUDIO_ENABLED=false`.
5. Apply the Puna migration and run the read-only verification.
6. Enable the visual flag in Preview, approve one brand asset, and test a five-slide ES campaign for LinkedIn and Instagram.
7. Verify editing, ordering, regeneration, JPEG slides, LinkedIn PDF, approval, and archival.
8. Enable the visual flag in Production after the Preview smoke test.

Rollback is the feature flag. Existing visual data, history, and media are retained. No automatic publication is configured or performed.
