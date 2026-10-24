-- Migración 0006 (se puede ejecutar más de una vez sin errores):
-- nombre al registrarse, programas con duración y guardado de rutinas

-- 1. El nombre elegido al registrarse pasa a ser el nombre del perfil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nombre text;
begin
  v_nombre := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), '');
  if v_nombre is not null then
    v_nombre := left(v_nombre, 50);
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_nombre);

  return new;
end;
$$;

-- 2. Preferencias: sexo (opcional), enfoque, duración y el objetivo "definición"
alter table public.training_preferences
  add column if not exists sex text
    check (sex is null or sex in ('male', 'female')),
  add column if not exists focus text not null default 'balanced'
    check (focus in ('balanced', 'chest', 'back', 'legs_glutes', 'arms_shoulders', 'core')),
  add column if not exists program_weeks smallint not null default 8
    check (program_weeks in (4, 8, 12));

alter table public.training_preferences
  drop constraint if exists training_preferences_primary_goal_check;
alter table public.training_preferences
  add constraint training_preferences_primary_goal_check
  check (primary_goal in ('muscle', 'definition', 'strength', 'general_fitness'));

grant insert (sex, focus, program_weeks) on public.training_preferences to authenticated;
grant update (sex, focus, program_weeks) on public.training_preferences to authenticated;

-- 3. Las rutinas pasan a ser programas con duración
alter table public.routines
  add column if not exists goal text
    check (goal is null or goal in ('muscle', 'definition', 'strength', 'general_fitness')),
  add column if not exists focus text
    check (focus is null or focus in ('balanced', 'chest', 'back', 'legs_glutes', 'arms_shoulders', 'core')),
  add column if not exists program_weeks smallint
    check (program_weeks is null or program_weeks between 1 and 52),
  add column if not exists days_per_week smallint
    check (days_per_week is null or days_per_week between 1 and 7),
  add column if not exists start_date date not null default current_date,
  add column if not exists notes text[] not null default '{}',
  add column if not exists warnings text[] not null default '{}';

grant insert (goal, focus, program_weeks, days_per_week, notes, warnings)
  on public.routines to authenticated;

-- 4. Guardar una rutina completa de una sola vez (todo o nada)
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
begin
  insert into public.routines (
    user_id, name, source, goal, focus, program_weeks, days_per_week, notes, warnings
  )
  values (
    (select auth.uid()),
    p_routine ->> 'name',
    'generated',
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