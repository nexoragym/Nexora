-- Migración 0003: cuestionario inicial y biblioteca de ejercicios
--
-- Músculos permitidos (los mismos que usará la silueta del Muscle Rank):
--   chest, upper_back, lats, lower_back, traps, shoulders, biceps, triceps,
--   forearms, abs, quadriceps, hamstrings, glutes, calves

-- =========================================================
-- 1. Preferencias de entrenamiento (respuestas del cuestionario)
-- =========================================================
create table public.training_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  experience_level text not null
    check (experience_level in ('beginner', 'intermediate', 'advanced')),
  primary_goal text not null
    check (primary_goal in ('muscle', 'strength', 'general_fitness')),
  days_per_week smallint not null
    check (days_per_week between 1 and 7),
  session_minutes smallint not null
    check (session_minutes between 20 and 180),
  equipment text[] not null
    check (
      cardinality(equipment) >= 1
      and equipment <@ array['bodyweight', 'dumbbells', 'barbell', 'machines']
    ),
  limitations text[] not null default '{}'
    check (
      limitations <@ array['knees', 'lower_back', 'shoulders', 'wrists', 'avoid_impact']
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.training_preferences is
  'Respuestas del cuestionario. Datos privados: solo las lee su propietario.';

alter table public.training_preferences enable row level security;

revoke all on public.training_preferences from anon, authenticated;
grant select on public.training_preferences to authenticated;
grant insert (
  user_id, experience_level, primary_goal, days_per_week,
  session_minutes, equipment, limitations
) on public.training_preferences to authenticated;
grant update (
  experience_level, primary_goal, days_per_week,
  session_minutes, equipment, limitations
) on public.training_preferences to authenticated;

create policy "Cada usuario lee sus preferencias"
  on public.training_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada usuario crea sus preferencias"
  on public.training_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Cada usuario actualiza sus preferencias"
  on public.training_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create trigger training_preferences_set_updated_at
  before update on public.training_preferences
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- 2. Biblioteca de ejercicios
-- =========================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null
    check (char_length(name) between 2 and 100),
  primary_muscles text[] not null
    check (
      cardinality(primary_muscles) >= 1
      and primary_muscles <@ array[
        'chest', 'upper_back', 'lats', 'lower_back', 'traps', 'shoulders',
        'biceps', 'triceps', 'forearms', 'abs', 'quadriceps', 'hamstrings',
        'glutes', 'calves'
      ]
    ),
  secondary_muscles text[] not null default '{}'
    check (
      secondary_muscles <@ array[
        'chest', 'upper_back', 'lats', 'lower_back', 'traps', 'shoulders',
        'biceps', 'triceps', 'forearms', 'abs', 'quadriceps', 'hamstrings',
        'glutes', 'calves'
      ]
    ),
  equipment text not null
    check (equipment in ('bodyweight', 'dumbbells', 'barbell', 'machines')),
  movement_pattern text not null
    check (
      movement_pattern in ('push', 'pull', 'squat', 'hinge', 'lunge', 'core', 'isolation')
    ),
  difficulty text not null
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  instructions text[] not null
    check (cardinality(instructions) >= 1),
  common_mistakes text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.exercises is
  'Biblioteca de ejercicios. La leen todos los usuarios con sesión; la edita solo el personal administrador.';

alter table public.exercises enable row level security;

revoke all on public.exercises from anon, authenticated;
grant select, insert, update on public.exercises to authenticated;

create policy "Los usuarios ven los ejercicios activos"
  on public.exercises
  for select
  to authenticated
  using (is_active or (select public.is_admin()));

create policy "Los administradores crean ejercicios"
  on public.exercises
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Los administradores editan ejercicios"
  on public.exercises
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create trigger exercises_set_updated_at
  before update on public.exercises
  for each row
  execute function public.set_updated_at();