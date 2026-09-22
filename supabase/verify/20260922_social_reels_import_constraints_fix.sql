do $$
declare
  stage_def text;
  section_def text;
begin
  select pg_get_constraintdef(oid) into stage_def
  from pg_constraint
  where conrelid = 'public.social_generation_runs'::regclass
    and conname = 'social_generation_runs_stage_check';

  select pg_get_constraintdef(oid) into section_def
  from pg_constraint
  where conrelid = 'public.social_generation_runs'::regclass
    and conname = 'social_generation_runs_section_check';

  if stage_def is null or position('importing' in stage_def) = 0
    or section_def is null or position('import:' in section_def) = 0
  then
    raise exception 'social_generation_runs import constraints are not reel-ready';
  end if;
end
$$;
