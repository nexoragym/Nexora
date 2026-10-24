-- Migración 0008 (se puede ejecutar más de una vez sin errores):
-- estadísticas del usuario para la pantalla de Inicio

create or replace function public.get_my_stats(p_timezone text default 'Europe/Madrid')
returns table (
  completed_sessions bigint,
  total_volume_kg numeric,
  training_days date[]
)
language sql
stable
set search_path = ''
as $$
  select
    (
      select count(*)
      from public.workout_sessions s
      where s.user_id = (select auth.uid())
        and s.status = 'completed'
    ),
    coalesce((
      select sum(ws.weight_kg * ws.reps)
      from public.workout_sets ws
      join public.workout_sessions s on s.id = ws.session_id
      where s.user_id = (select auth.uid())
        and s.status = 'completed'
        and ws.is_completed
    ), 0),
    coalesce((
      select array_agg(d.dia order by d.dia desc)
      from (
        select distinct ((s.ended_at at time zone p_timezone)::date) as dia
        from public.workout_sessions s
        where s.user_id = (select auth.uid())
          and s.status = 'completed'
          and s.ended_at >= now() - interval '400 days'
      ) d
    ), '{}'::date[]);
$$;

revoke execute on function public.get_my_stats(text) from public, anon, authenticated;
grant execute on function public.get_my_stats(text) to authenticated;