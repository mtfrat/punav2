-- The Phase 7 reel columns and functions can exist while an older operation
-- constraint remains in place on environments where the original migration
-- was partially applied. Recreate the constraint in a new migration so those
-- environments accept the two reel-specific generation stages.
alter table public.social_generation_runs
  drop constraint if exists social_generation_runs_operation_check;

alter table public.social_generation_runs
  add constraint social_generation_runs_operation_check check (
    operation in (
      'openings',
      'campaign',
      'regenerate_section',
      'render_media',
      'quality_review',
      'carousel',
      'reel_storyboard',
      'reel_sources',
      'reel_render'
    )
  );
