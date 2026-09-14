# Social Reels — Phase 7

Phase 7 adds assisted five-scene Instagram reels with Pexels clips, an asynchronous Cloudinary render, a Puna cover and manual downloads. It never publishes to Instagram and adds no cron, OAuth or social connector.

## Feature flag and private configuration

Keep `CONTENT_REELS_ENABLED=false` for the first deploy. The feature also requires `CONTENT_COMPOSER_ENABLED=true` and `CONTENT_VISUAL_STUDIO_ENABLED=true`.

Configure only on the Puna server:

- `PEXELS_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Never create `VITE_*` or `NEXT_PUBLIC_*` versions. Cloudinary must accept the production and Preview callback at `/api/webhooks/cloudinary/reel-render`. Assets are uploaded as authenticated resources; signed delivery URLs are generated only when an administrator opens or downloads a reel.

## Database ownership

Apply `supabase/migrations/20260914120000_social_reels_phase7.sql` only to Puna Supabase project `zaerzzgqxvaumhhchijb`. Phase 7 does not have an Autopost migration and must not apply the Phase 5 migration.

Afterward run the read-only check `supabase/verify/20260914_social_reels_phase7.sql`. Before the first reel, `reel_count` and every invalid count must be zero, and the browser-role privilege query must return no rows.

## Safe rollout

1. Disable the legacy n8n reel workflow and verify that neither its trigger nor publishing nodes can execute.
2. Deploy the Autopost cover-format change and keep its scheduler disabled.
3. Deploy Puna with `CONTENT_REELS_ENABLED=false`.
4. Apply and verify the Puna migration.
5. Configure Pexels and Cloudinary in Vercel Preview only, then enable the flag there.
6. Create one Spanish Instagram reel, review its five scenes, fetch three candidates per scene, select each clip and render.
7. Download the muted 1080×1920 MP4 and 1080×1920 JPEG cover. Approve, schedule, reschedule, unschedule and archive it without using any publication action.
8. Add the same provider secrets to Production and enable the flag only after the Preview smoke test passes.

Rollback consists of setting `CONTENT_REELS_ENABLED=false`. Existing storyboards, runs and history remain private and no automatic publication is enabled.
