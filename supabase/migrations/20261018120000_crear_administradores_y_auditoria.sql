-- Migración 0002: administradores y registro de auditoría
-- La lista de administradores no se puede leer ni modificar desde la web.
-- Cada acción de administración queda anotada en el registro de auditoría.

-- 1. Tabla de administradores
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'superadmin')),
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Cuentas administradoras. Solo se modifica desde el panel de Supabase.';

alter table public.admin_users enable row level security;

-- Sin permisos ni políticas para la API: nadie puede leerla ni cambiarla desde la web.
revoke all on public.admin_users from anon, authenticated;

-- 2. Funciones que responden: ¿esta cuenta es administradora?
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

create function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'superadmin'
  );
$$;

revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.is_superadmin() from public, anon, authenticated;
grant execute on function public.is_superadmin() to authenticated;

-- 3. Registro de auditoría
create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) between 1 and 100),
  target_table text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Registro de las acciones de administración. Solo lectura desde la web.';

alter table public.admin_audit_log enable row level security;

-- Solo lectura para la API; las anotaciones se hacen con log_admin_action().
revoke all on public.admin_audit_log from anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create policy "Solo los superadministradores leen el registro"
  on public.admin_audit_log
  for select
  to authenticated
  using ((select public.is_superadmin()));

-- 4. Función para anotar una acción (solo la pueden usar los administradores)
create function public.log_admin_action(
  p_action text,
  p_target_table text default null,
  p_target_id text default null,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), p_action, p_target_table, p_target_id, p_details);
end;
$$;

revoke execute on function public.log_admin_action(text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.log_admin_action(text, text, text, jsonb)
  to authenticated;