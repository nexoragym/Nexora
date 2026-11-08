-- Migración 0018: rutinas personalizadas de cada usuario

-- ¿Esta persona puede construir rutinas propias?
-- HOY: cualquiera con sesión. Cuando exista Premium, se cambia SOLO esta función
-- (por ejemplo, comprobando una suscripción). Todo lo demás lo respeta.
create or replace function public.can_build_custom_routines()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null;
$$;

revoke execute on function public.can_build_custom_routines() from public, anon, authenticated;
grant execute on function public.can_build_custom_routines() to authenticated;

-- Crea o actualiza una rutina propia con todos sus días y ejercicios.
-- Si trae "id", la actualiza SIN borrar los días (así se conserva el progreso).
create or replace function public.save_custom_routine(
  p_routine jsonb,
  p_activate boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_id uuid;
  v_days jsonb;
  v_n integer;
  v_day jsonb;
  v_ord bigint;
  v_day_id uuid;
  v_ex jsonb;
  v_exercise uuid;
begin
  if v_user is null then
    raise exception 'No autorizado';
  end if;
  if not public.can_build_custom_routines() then
    raise exception 'Función no disponible';
  end if;

  v_days := coalesce(p_routine -> 'days', '[]'::jsonb);
  v_n := jsonb_array_length(v_days);
  if v_n < 1 or v_n > 7 then
    raise exception 'Número de días no válido';
  end if;

  v_id := nullif(p_routine ->> 'id', '')::uuid;

  if v_id is null then
    if (
      select count(*) from public.routines
      where user_id = v_user and source = 'custom'
    ) >= 20 then
      raise exception 'Límite de rutinas';
    end if;

    insert into public.routines (
      user_id, name, source, goal, focus, program_weeks, days_per_week, notes, warnings
    )
    values (
      v_user,
      p_routine ->> 'name',
      'custom',
      p_routine ->> 'goal',
      'balanced',
      (p_routine ->> 'program_weeks')::smallint,
      v_n::smallint,
      array(select jsonb_array_elements_text(coalesce(p_routine -> 'notes', '[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(p_routine -> 'warnings', '[]'::jsonb)))
    )
    returning id into v_id;
  else
    update public.routines
    set name = p_routine ->> 'name',
        goal = p_routine ->> 'goal',
        program_weeks = (p_routine ->> 'program_weeks')::smallint,
        days_per_week = v_n::smallint,
        notes = array(select jsonb_array_elements_text(coalesce(p_routine -> 'notes', '[]'::jsonb))),
        warnings = array(select jsonb_array_elements_text(coalesce(p_routine -> 'warnings', '[]'::jsonb)))
    where id = v_id
      and user_id = v_user
      and source = 'custom';

    if not found then
      raise exception 'Rutina no encontrada';
    end if;
  end if;

  for v_day, v_ord in
    select value, ordinality from jsonb_array_elements(v_days) with ordinality
  loop
    v_day_id := null;
    select id into v_day_id
    from public.routine_days
    where routine_id = v_id and day_number = v_ord::smallint;

    if v_day_id is null then
      insert into public.routine_days (routine_id, day_number, name)
      values (v_id, v_ord::smallint, v_day ->> 'name')
      returning id into v_day_id;
    else
      update public.routine_days set name = v_day ->> 'name' where id = v_day_id;
    end if;

    delete from public.routine_day_exercises where routine_day_id = v_day_id;

    for v_ex in
      select value from jsonb_array_elements(coalesce(v_day -> 'exercises', '[]'::jsonb))
    loop
      v_exercise := (v_ex ->> 'exercise_id')::uuid;

      if not exists (
        select 1 from public.exercises where id = v_exercise and is_active
      ) then
        raise exception 'Ejercicio no disponible';
      end if;

      insert into public.routine_day_exercises (
        routine_day_id, exercise_id, sort_order, target_sets,
        reps_min, reps_max, rest_seconds, notes
      )
      values (
        v_day_id,
        v_exercise,
        (v_ex ->> 'sort_order')::smallint,
        (v_ex ->> 'target_sets')::smallint,
        (v_ex ->> 'reps_min')::smallint,
        (v_ex ->> 'reps_max')::smallint,
        (v_ex ->> 'rest_seconds')::smallint,
        nullif(v_ex ->> 'notes', '')
      );
    end loop;
  end loop;

  -- Si ahora tiene menos días, se quitan los que sobran.
  delete from public.routine_days
  where routine_id = v_id and day_number > v_n;

  if p_activate then
    perform public.set_active_routine(v_id);
  end if;

  return v_id;
end;
$$;

revoke execute on function public.save_custom_routine(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.save_custom_routine(jsonb, boolean) to authenticated;