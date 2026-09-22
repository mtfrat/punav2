-- Reel clip imports use a distinct stage and a scene-scoped section. The
-- original run constraints predate those values, so extend only reel_sources.
alter table public.social_generation_runs
  drop constraint if exists social_generation_runs_stage_check,
  drop constraint if exists social_generation_runs_section_check;

alter table public.social_generation_runs
  add constraint social_generation_runs_stage_check check (
    stage in ('queued', 'drafting', 'critic', 'visual_drafting', 'persisting', 'rendering', 'complete')
    or (operation = 'reel_sources' and stage = 'importing')
  ),
  add constraint social_generation_runs_section_check check (
    section is null
    or section in ('hook', 'body', 'cta')
    or (
      operation = 'reel_sources'
      and section ~ '^import:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    )
  );
