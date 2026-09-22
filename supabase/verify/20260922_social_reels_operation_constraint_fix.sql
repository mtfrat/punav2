do $$
declare
  definition text;
begin
  select pg_get_constraintdef(oid)
    into definition
  from pg_constraint
  where conrelid = 'public.social_generation_runs'::regclass
    and conname = 'social_generation_runs_operation_check';

  if definition is null
    or position('reel_sources' in definition) = 0
    or position('reel_render' in definition) = 0
  then
    raise exception 'social_generation_runs_operation_check is not reel-ready';
  end if;
end
$$;
