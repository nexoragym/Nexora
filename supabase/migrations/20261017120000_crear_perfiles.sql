-- Migración 0001: perfiles de usuario
-- Un perfil por cuenta. Cada persona solo ve y modifica el suyo.

-- 1. Tabla
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text
    check (display_name is null or char_length(display_name) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de cada cuenta. Se crea automáticamente al registrarse.';

-- 2. Seguridad: RLS activado (sin políticas no se puede acceder a nada)
alter table public.profiles enable row level security;

-- 3. Permisos mínimos de los roles de la API
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- 4. Políticas: cada persona solo accede a su propia fila
create policy "Cada usuario lee su propio perfil"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Cada usuario actualiza su propio perfil"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 5. Actualiza updated_at automáticamente al modificar el perfil
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 6. Crea el perfil automáticamente cuando alguien se registra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 7. Crea el perfil de las cuentas que ya existían antes de esta migración
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;