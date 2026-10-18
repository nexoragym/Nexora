-- Migración 0005: rutinas y entrenamientos
--
-- Idea clave: el historial nunca debe cambiar. Cada sesión y cada serie guardan
-- una COPIA de los nombres (rutina, día, ejercicio) tal como eran ese día.
-- Así, si luego editas o borras una rutina, lo que ya entrenaste se mantiene.

-- =========================================================
-- 1. TABLAS
-- =========================================================

-- Rutinas de cada usuario
create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  source text not null default 'generated'
    check (source in ('generated', 'custom')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index routines_user_id_idx on public.routines (user_id);

-- Cada usuario solo puede tener UNA rutina activa
create unique index routines_one_active_per_user
  on public.routines (user_id)
  where is_active;

-- Días de cada rutina
create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 7),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (routine_id, day_number)
);

-- Ejercicios de cada día
create table public.routine_day_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  sort_order smallint not null check (sort_order between 1 and 30),
  target_sets smallint not null check (target_sets between 1 and 10),
  reps_min smallint not null check (reps_min between 1 and 100),
  reps_max smallint not null check (reps_max between 1 and 100),
  rest_seconds smallint not null default 90 check (rest_seconds between 0 and 600),
  notes text check (notes is null or char_length(notes) <= 200),
  created_at timestamptz not null default now(),
  check (reps_max >= reps_min),
  unique (routine_day_id, sort_order)
);

-- Sesiones de entrenamiento (cada vez que alguien entrena)
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid references public.routines (id) on delete set null,
  routine_day_id uuid references public.routine_days (id) on delete set null,
  routine_name text not null check (char_length(routine_name) between 1 and 80),
  day_name text not null check (char_length(day_name) between 1 and 80),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'paused', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at),
  check ((status in ('completed', 'abandoned')) = (ended_at is not null))
);

create index workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);

-- Series registradas en cada sesión
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  exercise_name text not null check (char_length(exercise_name) between 1 and 100),
  set_number smallint not null check (set_number between 1 and 50),
  weight_kg numeric(6, 2) check (weight_kg is null or (weight_kg >= 0 and weight_kg <= 1000)),
  reps smallint check (reps is null or (reps >= 0 and reps <= 1000)),
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, exercise_id, set_number)
);

create index workout_sets_exercise_id_idx on public.workout_sets (exercise_id);

-- =========================================================
-- 2. FUNCIONES AUXILIARES
-- =========================================================

-- ¿La rutina es del usuario que hace la petición?
create function public.owns_routine(p_routine_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.routines
    where id = p_routine_id
      and user_id = (select auth.uid())
  );
$$;

-- ¿El día pertenece a una rutina del usuario?
create function public.owns_routine_day(p_day_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.routine_days d
    join public.routines r on r.id = d.routine_id
    where d.id = p_day_id
      and r.user_id = (select auth.uid())
  );
$$;

-- ¿La sesión es del usuario?
create function public.owns_session(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workout_sessions
    where id = p_session_id
      and user_id = (select auth.uid())
  );
$$;

revoke execute on function public.owns_routine(uuid) from public, anon, authenticated;
revoke execute on function public.owns_routine_day(uuid) from public, anon, authenticated;
revoke execute on function public.owns_session(uuid) from public, anon, authenticated;
grant execute on function public.owns_routine(uuid) to authenticated;
grant execute on function public.owns_routine_day(uuid) to authenticated;
grant execute on function public.owns_session(uuid) to authenticated;

-- Marca una rutina como activa y desactiva las demás, todo de una vez
create function public.set_active_routine(p_routine_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.routines
  set is_active = false
  where user_id = (select auth.uid())
    and is_active
    and id <> p_routine_id;

  update public.routines
  set is_active = true
  where id = p_routine_id
    and user_id = (select auth.uid());

  if not found then
    raise exception 'Rutina no encontrada';
  end if;
end;
$$;

revoke execute on function public.set_active_routine(uuid) from public, anon, authenticated;
grant execute on function public.set_active_routine(uuid) to authenticated;

-- =========================================================
-- 3. SEGURIDAD (RLS): cada usuario solo accede a lo suyo
-- =========================================================

-- ---- routines ----
alter table public.routines enable row level security;
revoke all on public.routines from anon, authenticated;
grant select, delete on public.routines to authenticated;
grant insert (user_id, name, source) on public.routines to authenticated;
grant update (name, is_active) on public.routines to authenticated;

create policy "Cada usuario lee sus rutinas"
  on public.routines for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus rutinas"
  on public.routines for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario edita sus rutinas"
  on public.routines for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario borra sus rutinas"
  on public.routines for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---- routine_days ----
alter table public.routine_days enable row level security;
revoke all on public.routine_days from anon, authenticated;
grant select, delete on public.routine_days to authenticated;
grant insert (routine_id, day_number, name) on public.routine_days to authenticated;
grant update (day_number, name) on public.routine_days to authenticated;

create policy "Cada usuario lee los días de sus rutinas"
  on public.routine_days for select to authenticated
  using ((select public.owns_routine(routine_id)));

create policy "Cada usuario crea días en sus rutinas"
  on public.routine_days for insert to authenticated
  with check ((select public.owns_routine(routine_id)));

create policy "Cada usuario edita los días de sus rutinas"
  on public.routine_days for update to authenticated
  using ((select public.owns_routine(routine_id)))
  with check ((select public.owns_routine(routine_id)));

create policy "Cada usuario borra los días de sus rutinas"
  on public.routine_days for delete to authenticated
  using ((select public.owns_routine(routine_id)));

-- ---- routine_day_exercises ----
alter table public.routine_day_exercises enable row level security;
revoke all on public.routine_day_exercises from anon, authenticated;
grant select, delete on public.routine_day_exercises to authenticated;
grant insert (
  routine_day_id, exercise_id, sort_order, target_sets,
  reps_min, reps_max, rest_seconds, notes
) on public.routine_day_exercises to authenticated;
grant update (
  exercise_id, sort_order, target_sets,
  reps_min, reps_max, rest_seconds, notes
) on public.routine_day_exercises to authenticated;

create policy "Cada usuario lee los ejercicios de sus días"
  on public.routine_day_exercises for select to authenticated
  using ((select public.owns_routine_day(routine_day_id)));

create policy "Cada usuario añade ejercicios a sus días"
  on public.routine_day_exercises for insert to authenticated
  with check ((select public.owns_routine_day(routine_day_id)));

create policy "Cada usuario edita los ejercicios de sus días"
  on public.routine_day_exercises for update to authenticated
  using ((select public.owns_routine_day(routine_day_id)))
  with check ((select public.owns_routine_day(routine_day_id)));

create policy "Cada usuario borra los ejercicios de sus días"
  on public.routine_day_exercises for delete to authenticated
  using ((select public.owns_routine_day(routine_day_id)));

-- ---- workout_sessions ----
alter table public.workout_sessions enable row level security;
revoke all on public.workout_sessions from anon, authenticated;
grant select, delete on public.workout_sessions to authenticated;
grant insert (user_id, routine_id, routine_day_id, routine_name, day_name)
  on public.workout_sessions to authenticated;
grant update (status, ended_at) on public.workout_sessions to authenticated;

create policy "Cada usuario lee sus sesiones"
  on public.workout_sessions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus sesiones"
  on public.workout_sessions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (routine_id is null or (select public.owns_routine(routine_id)))
    and (routine_day_id is null or (select public.owns_routine_day(routine_day_id)))
  );

create policy "Cada usuario actualiza sus sesiones"
  on public.workout_sessions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario borra sus sesiones"
  on public.workout_sessions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---- workout_sets ----
alter table public.workout_sets enable row level security;
revoke all on public.workout_sets from anon, authenticated;
grant select, delete on public.workout_sets to authenticated;
grant insert (
  session_id, exercise_id, exercise_name, set_number,
  weight_kg, reps, is_completed
) on public.workout_sets to authenticated;
grant update (weight_kg, reps, is_completed) on public.workout_sets to authenticated;

create policy "Cada usuario lee las series de sus sesiones"
  on public.workout_sets for select to authenticated
  using ((select public.owns_session(session_id)));

create policy "Cada usuario crea series en sus sesiones"
  on public.workout_sets for insert to authenticated
  with check ((select public.owns_session(session_id)));

create policy "Cada usuario edita las series de sus sesiones"
  on public.workout_sets for update to authenticated
  using ((select public.owns_session(session_id)))
  with check ((select public.owns_session(session_id)));

create policy "Cada usuario borra las series de sus sesiones"
  on public.workout_sets for delete to authenticated
  using ((select public.owns_session(session_id)));

-- =========================================================
-- 4. updated_at automático
-- =========================================================
create trigger routines_set_updated_at
  before update on public.routines
  for each row
  execute function public.set_updated_at();

create trigger workout_sets_set_updated_at
  before update on public.workout_sets
  for each row
  execute function public.set_updated_at();