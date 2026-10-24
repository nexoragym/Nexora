-- Migración 0009 (se puede ejecutar más de una vez sin errores):
-- datos de la pantalla Progreso

create or replace function public.get_my_progress(
  p_timezone text default 'Europe/Madrid',
  p_weeks integer default 8
)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with params as (
    select
      least(greatest(coalesce(p_weeks, 8), 1), 26) as n_semanas,
      (now() at time zone p_timezone)::date as hoy
  ),
  limites as (
    select
      n_semanas,
      hoy,
      date_trunc('week', hoy::timestamp)::date as lunes_actual
    from params
  ),
  serie_semanas as (
    select (l.lunes_actual - (g * 7))::date as inicio_semana
    from limites l, generate_series(0, l.n_semanas - 1) as g
  ),
  mis_sesiones as (
    select s.id, (s.ended_at at time zone p_timezone)::date as dia
    from public.workout_sessions s
    where s.user_id = (select auth.uid())
      and s.status = 'completed'
      and s.ended_at is not null
  ),
  volumen_sesion as (
    select
      ms.id,
      ms.dia,
      coalesce(sum(ws.weight_kg * ws.reps) filter (where ws.is_completed), 0) as volumen
    from mis_sesiones ms
    left join public.workout_sets ws on ws.session_id = ms.id
    group by ms.id, ms.dia
  ),
  semanal as (
    select
      w.inicio_semana,
      count(vs.id) as sesiones,
      coalesce(sum(vs.volumen), 0) as volumen_kg
    from serie_semanas w
    left join volumen_sesion vs
      on date_trunc('week', vs.dia::timestamp)::date = w.inicio_semana
    group by w.inicio_semana
  ),
  mis_series as (
    select ws.exercise_id, ws.exercise_name, ws.weight_kg, ws.reps, ms.dia
    from public.workout_sets ws
    join mis_sesiones ms on ms.id = ws.session_id
    where ws.is_completed
      and ws.weight_kg is not null and ws.weight_kg > 0
      and ws.reps is not null and ws.reps > 0
  ),
  records as (
    select distinct on (exercise_id)
      exercise_id, exercise_name, weight_kg, reps, dia
    from mis_series
    order by exercise_id, weight_kg desc, reps desc, dia desc
  ),
  historial as (
    select exercise_id, exercise_name, dia, max(weight_kg) as peso_max
    from mis_series
    where dia >= (select hoy from limites) - 180
    group by exercise_id, exercise_name, dia
  )
  select jsonb_build_object(
    'weekly', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'week_start', inicio_semana,
          'sessions', sesiones,
          'volume_kg', volumen_kg
        ) order by inicio_semana
      ) from semanal
    ), '[]'::jsonb),
    'records', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'exercise_id', exercise_id,
          'exercise_name', exercise_name,
          'weight_kg', weight_kg,
          'reps', reps,
          'day', dia
        ) order by exercise_name
      ) from records
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'exercise_id', exercise_id,
          'exercise_name', exercise_name,
          'day', dia,
          'weight_kg', peso_max
        ) order by exercise_name, dia
      ) from historial
    ), '[]'::jsonb)
  );
$$;

revoke execute on function public.get_my_progress(text, integer)
  from public, anon, authenticated;
grant execute on function public.get_my_progress(text, integer) to authenticated;