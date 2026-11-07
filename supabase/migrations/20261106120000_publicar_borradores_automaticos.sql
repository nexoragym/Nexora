-- Migración 0017: publicar u ocultar de una vez las rutinas automáticas
-- (las que tienen el identificador que empieza por "auto-")

-- Publica las automáticas que estén completas: sin días vacíos y sin ejercicios desactivados.
create or replace function public.publish_auto_catalog_routines()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_publicadas integer;
  v_pendientes integer;
begin
  if not (select public.is_superadmin()) then
    raise exception 'No autorizado';
  end if;

  with candidatas as (
    select r.id
    from public.catalog_routines r
    where r.slug like 'auto-%'
      and not r.is_published
      and exists (
        select 1 from public.catalog_routine_days d
        where d.catalog_routine_id = r.id
      )
      and not exists (
        select 1 from public.catalog_routine_days d
        where d.catalog_routine_id = r.id
          and not exists (
            select 1 from public.catalog_routine_day_exercises e
            where e.catalog_day_id = d.id
          )
      )
      and not exists (
        select 1
        from public.catalog_routine_days d
        join public.catalog_routine_day_exercises e on e.catalog_day_id = d.id
        join public.exercises x on x.id = e.exercise_id
        where d.catalog_routine_id = r.id
          and not x.is_active
      )
  ),
  actualizadas as (
    update public.catalog_routines r
    set is_published = true
    from candidatas c
    where r.id = c.id
    returning r.id
  )
  select count(*)::integer into v_publicadas from actualizadas;

  select count(*)::integer into v_pendientes
  from public.catalog_routines r
  where r.slug like 'auto-%' and not r.is_published;

  return jsonb_build_object('published', v_publicadas, 'pending', v_pendientes);
end;
$$;

-- Vuelve a ocultar todas las automáticas publicadas.
create or replace function public.unpublish_auto_catalog_routines()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ocultadas integer;
begin
  if not (select public.is_superadmin()) then
    raise exception 'No autorizado';
  end if;

  with ocultadas as (
    update public.catalog_routines
    set is_published = false
    where slug like 'auto-%' and is_published
    returning id
  )
  select count(*)::integer into v_ocultadas from ocultadas;

  return jsonb_build_object('unpublished', v_ocultadas);
end;
$$;

revoke execute on function public.publish_auto_catalog_routines() from public, anon, authenticated;
revoke execute on function public.unpublish_auto_catalog_routines() from public, anon, authenticated;
grant execute on function public.publish_auto_catalog_routines() to authenticated;
grant execute on function public.unpublish_auto_catalog_routines() to authenticated;