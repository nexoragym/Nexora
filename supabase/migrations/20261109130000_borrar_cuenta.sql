-- Migración 0020: borrar la propia cuenta

-- Borra al usuario que hace la petición. Todo lo suyo (perfil, preferencias, rutinas,
-- entrenamientos y series) se borra en cascada. Los administradores no pueden usarla.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'No autorizado';
  end if;

  if public.is_admin() then
    raise exception 'Administrador';
  end if;

  delete from auth.users where id = v_user;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon, authenticated;
grant execute on function public.delete_my_account() to authenticated;