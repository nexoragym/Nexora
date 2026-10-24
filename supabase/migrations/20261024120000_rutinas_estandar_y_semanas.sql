-- Migración 0007 (se puede ejecutar más de una vez sin errores):
-- rutinas estándar y semana de cada entrenamiento

-- 1. Las rutinas pueden ser estándar (del catálogo) y recuerdan cuál
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.routines'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%source%'
  loop
    execute format('alter table public.routines drop constraint %I', r.conname);
  end loop;
end
$$;

alter table public.routines
  add constraint routines_source_check
  check (source in ('generated', 'custom', 'standard'));

alter table public.routines
  add column if not exists catalog_slug text
    check (catalog_slug is null or char_length(catalog_slug) between 1 and 60);

grant insert (catalog_slug) on public.routines to authenticated;

-- 2. Cada entrenamiento guarda en qué semana del programa se hizo
alter table public.workout_sessions
  add column if not exists week_number smallint
    check (week_number is null or week_number between 1 and 52);

grant insert (week_number) on public.workout_sessions to authenticated;

-- 3. Guardar una rutina completa de una sola vez (ahora también estándar)
create or replace function public.save_generated_routine(p_routine jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_routine_id uuid;
  v_day jsonb;
  v_day_id uuid;
  v_ex jsonb;
  v_source text;
begin
  v_source := coalesce(nullif(p_routine ->> 'source', ''), 'generated');
  if v_source not in ('generated', 'standard') then
    raise exception 'Origen de rutina no válido';
  end if;

  insert into public.routines (
    user_id, name, source, catalog_slug, goal, focus,
    program_weeks, days_per_week, notes, warnings
  )
  values (
    (select auth.uid()),
    p_routine ->> 'name',
    v_source,
    nullif(p_routine ->> 'catalog_slug', ''),
    p_routine ->> 'goal',
    p_routine ->> 'focus',
    (p_routine ->> 'program_weeks')::smallint,
    (p_routine ->> 'days_per_week')::smallint,
    array(select jsonb_array_elements_text(coalesce(p_routine -> 'notes', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_routine -> 'warnings', '[]'::jsonb)))
  )
  returning id into v_routine_id;

  for v_day in
    select value from jsonb_array_elements(coalesce(p_routine -> 'days', '[]'::jsonb))
  loop
    insert into public.routine_days (routine_id, day_number, name)
    values (v_routine_id, (v_day ->> 'day_number')::smallint, v_day ->> 'name')
    returning id into v_day_id;

    for v_ex in
      select value from jsonb_array_elements(coalesce(v_day -> 'exercises', '[]'::jsonb))
    loop
      insert into public.routine_day_exercises (
        routine_day_id, exercise_id, sort_order, target_sets,
        reps_min, reps_max, rest_seconds, notes
      )
      values (
        v_day_id,
        (v_ex ->> 'exercise_id')::uuid,
        (v_ex ->> 'sort_order')::smallint,
        (v_ex ->> 'target_sets')::smallint,
        (v_ex ->> 'reps_min')::smallint,
        (v_ex ->> 'reps_max')::smallint,
        (v_ex ->> 'rest_seconds')::smallint,
        v_ex ->> 'notes'
      );
    end loop;
  end loop;

  perform public.set_active_routine(v_routine_id);
  return v_routine_id;
end;
$$;

revoke execute on function public.save_generated_routine(jsonb)
  from public, anon, authenticated;
grant execute on function public.save_generated_routine(jsonb) to authenticated;