-- Migración 0016: rutinas estándar (catálogo) en la base de datos

-- =========================================================
-- 1. TABLAS
-- =========================================================
create table if not exists public.catalog_routines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 1 and 60),
  name text not null check (char_length(name) between 1 and 80),
  description text not null check (char_length(description) between 1 and 300),
  goal text not null
    check (goal in ('muscle', 'definition', 'strength', 'general_fitness')),
  focus text not null default 'balanced'
    check (focus in ('balanced', 'chest', 'back', 'legs_glutes', 'arms_shoulders', 'core')),
  level text not null
    check (level in ('beginner', 'intermediate', 'advanced')),
  weeks smallint not null check (weeks between 1 and 52),
  equipment text[] not null
    check (
      cardinality(equipment) >= 1
      and equipment <@ array['bodyweight', 'dumbbells', 'barbell', 'machines']
    ),
  notes text[] not null default '{}',
  warnings text[] not null default '{}',
  cover_path text check (cover_path is null or char_length(cover_path) <= 200),
  is_published boolean not null default false,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_routine_days (
  id uuid primary key default gen_random_uuid(),
  catalog_routine_id uuid not null
    references public.catalog_routines (id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 7),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  unique (catalog_routine_id, day_number)
);

create table if not exists public.catalog_routine_day_exercises (
  id uuid primary key default gen_random_uuid(),
  catalog_day_id uuid not null
    references public.catalog_routine_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  sort_order smallint not null check (sort_order between 1 and 30),
  target_sets smallint not null check (target_sets between 1 and 10),
  reps_min smallint not null check (reps_min between 1 and 100),
  reps_max smallint not null check (reps_max between 1 and 100),
  rest_seconds smallint not null default 90 check (rest_seconds between 0 and 600),
  notes text check (notes is null or char_length(notes) <= 200),
  created_at timestamptz not null default now(),
  check (reps_max >= reps_min),
  unique (catalog_day_id, sort_order)
);

create index if not exists catalog_routine_day_exercises_exercise_idx
  on public.catalog_routine_day_exercises (exercise_id);

-- =========================================================
-- 2. FUNCIONES AUXILIARES (para la seguridad de las tablas hijas)
-- =========================================================
create or replace function public.catalog_routine_visible(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.catalog_routines r
    where r.id = p_id
      and (r.is_published or (select public.is_superadmin()))
  );
$$;

create or replace function public.catalog_day_visible(p_day_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.catalog_routine_days d
    join public.catalog_routines r on r.id = d.catalog_routine_id
    where d.id = p_day_id
      and (r.is_published or (select public.is_superadmin()))
  );
$$;

revoke execute on function public.catalog_routine_visible(uuid) from public, anon, authenticated;
revoke execute on function public.catalog_day_visible(uuid) from public, anon, authenticated;
grant execute on function public.catalog_routine_visible(uuid) to authenticated;
grant execute on function public.catalog_day_visible(uuid) to authenticated;

-- =========================================================
-- 3. SEGURIDAD (RLS)
-- Todos leen lo publicado; solo el superadmin ve lo oculto.
-- Las escrituras de rutinas completas van por funciones (más abajo).
-- =========================================================
alter table public.catalog_routines enable row level security;
revoke all on public.catalog_routines from anon, authenticated;
grant select on public.catalog_routines to authenticated;
grant update (is_published, cover_path, sort_order)
  on public.catalog_routines to authenticated;

drop policy if exists "Los usuarios ven las rutinas publicadas" on public.catalog_routines;
create policy "Los usuarios ven las rutinas publicadas"
  on public.catalog_routines for select to authenticated
  using (is_published or (select public.is_superadmin()));

drop policy if exists "El superadmin cambia estado y portada" on public.catalog_routines;
create policy "El superadmin cambia estado y portada"
  on public.catalog_routines for update to authenticated
  using ((select public.is_superadmin()))
  with check ((select public.is_superadmin()));

alter table public.catalog_routine_days enable row level security;
revoke all on public.catalog_routine_days from anon, authenticated;
grant select on public.catalog_routine_days to authenticated;

drop policy if exists "Los usuarios ven los días de rutinas visibles" on public.catalog_routine_days;
create policy "Los usuarios ven los días de rutinas visibles"
  on public.catalog_routine_days for select to authenticated
  using ((select public.catalog_routine_visible(catalog_routine_id)));

alter table public.catalog_routine_day_exercises enable row level security;
revoke all on public.catalog_routine_day_exercises from anon, authenticated;
grant select on public.catalog_routine_day_exercises to authenticated;

drop policy if exists "Los usuarios ven los ejercicios de días visibles" on public.catalog_routine_day_exercises;
create policy "Los usuarios ven los ejercicios de días visibles"
  on public.catalog_routine_day_exercises for select to authenticated
  using ((select public.catalog_day_visible(catalog_day_id)));

drop trigger if exists catalog_routines_set_updated_at on public.catalog_routines;
create trigger catalog_routines_set_updated_at
  before update on public.catalog_routines
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- 4. FUNCIONES DE ESCRITURA (solo superadmin)
-- =========================================================

-- Crea o actualiza una rutina completa (con sus días y ejercicios).
-- Si trae "id", la actualiza (no cambia el slug, el estado ni la portada).
create or replace function public.save_catalog_routine(p_routine jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_day jsonb;
  v_day_id uuid;
  v_ex jsonb;
begin
  if not (select public.is_superadmin()) then
    raise exception 'No autorizado';
  end if;

  v_id := nullif(p_routine ->> 'id', '')::uuid;

  if v_id is null then
    insert into public.catalog_routines (
      slug, name, description, goal, focus, level, weeks,
      equipment, notes, warnings
    )
    values (
      p_routine ->> 'slug',
      p_routine ->> 'name',
      p_routine ->> 'description',
      p_routine ->> 'goal',
      coalesce(nullif(p_routine ->> 'focus', ''), 'balanced'),
      p_routine ->> 'level',
      (p_routine ->> 'weeks')::smallint,
      array(select jsonb_array_elements_text(coalesce(p_routine -> 'equipment', '[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(p_routine -> 'notes', '[]'::jsonb))),
      array(select jsonb_array_elements_text(coalesce(p_routine -> 'warnings', '[]'::jsonb)))
    )
    returning id into v_id;
  else
    update public.catalog_routines
    set name = p_routine ->> 'name',
        description = p_routine ->> 'description',
        goal = p_routine ->> 'goal',
        focus = coalesce(nullif(p_routine ->> 'focus', ''), 'balanced'),
        level = p_routine ->> 'level',
        weeks = (p_routine ->> 'weeks')::smallint,
        equipment = array(select jsonb_array_elements_text(coalesce(p_routine -> 'equipment', '[]'::jsonb))),
        notes = array(select jsonb_array_elements_text(coalesce(p_routine -> 'notes', '[]'::jsonb))),
        warnings = array(select jsonb_array_elements_text(coalesce(p_routine -> 'warnings', '[]'::jsonb)))
    where id = v_id;

    if not found then
      raise exception 'Rutina no encontrada';
    end if;

    delete from public.catalog_routine_days where catalog_routine_id = v_id;
  end if;

  for v_day in
    select value from jsonb_array_elements(coalesce(p_routine -> 'days', '[]'::jsonb))
  loop
    insert into public.catalog_routine_days (catalog_routine_id, day_number, name)
    values (v_id, (v_day ->> 'day_number')::smallint, v_day ->> 'name')
    returning id into v_day_id;

    for v_ex in
      select value from jsonb_array_elements(coalesce(v_day -> 'exercises', '[]'::jsonb))
    loop
      insert into public.catalog_routine_day_exercises (
        catalog_day_id, exercise_id, sort_order, target_sets,
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
        nullif(v_ex ->> 'notes', '')
      );
    end loop;
  end loop;

  return v_id;
end;
$$;

revoke execute on function public.save_catalog_routine(jsonb) from public, anon, authenticated;
grant execute on function public.save_catalog_routine(jsonb) to authenticated;

-- Crea una copia oculta de una rutina (con días y ejercicios).
create or replace function public.duplicate_catalog_routine(p_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.catalog_routines;
  v_new uuid;
  v_base text;
  v_slug text;
  v_n integer := 1;
  v_day public.catalog_routine_days;
  v_new_day uuid;
begin
  if not (select public.is_superadmin()) then
    raise exception 'No autorizado';
  end if;

  select * into v_old from public.catalog_routines where id = p_id;
  if not found then
    raise exception 'Rutina no encontrada';
  end if;

  v_base := left(v_old.slug, 50) || '-copia';
  v_slug := v_base;
  while exists (select 1 from public.catalog_routines where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  insert into public.catalog_routines (
    slug, name, description, goal, focus, level, weeks,
    equipment, notes, warnings, is_published, sort_order
  )
  values (
    v_slug, left(v_old.name, 70) || ' (copia)', v_old.description, v_old.goal,
    v_old.focus, v_old.level, v_old.weeks, v_old.equipment, v_old.notes,
    v_old.warnings, false, v_old.sort_order
  )
  returning id into v_new;

  for v_day in
    select * from public.catalog_routine_days
    where catalog_routine_id = p_id
    order by day_number
  loop
    insert into public.catalog_routine_days (catalog_routine_id, day_number, name)
    values (v_new, v_day.day_number, v_day.name)
    returning id into v_new_day;

    insert into public.catalog_routine_day_exercises (
      catalog_day_id, exercise_id, sort_order, target_sets,
      reps_min, reps_max, rest_seconds, notes
    )
    select v_new_day, exercise_id, sort_order, target_sets,
           reps_min, reps_max, rest_seconds, notes
    from public.catalog_routine_day_exercises
    where catalog_day_id = v_day.id;
  end loop;

  return v_new;
end;
$$;

revoke execute on function public.duplicate_catalog_routine(uuid) from public, anon, authenticated;
grant execute on function public.duplicate_catalog_routine(uuid) to authenticated;

-- =========================================================
-- 5. LAS 6 RUTINAS QUE YA TENÍAS (se saltan las que ya existan)
-- Cada ejercicio: [identificador, series, rep. mín., rep. máx., descanso]
-- =========================================================
do $seed$
declare
  v_data jsonb := $json$[
    {
      "slug": "masa-muscular-principiante",
      "name": "Masa muscular · Principiante",
      "description": "Tres sesiones de cuerpo completo por semana con máquinas y mancuernas. Ideal para empezar.",
      "goal": "muscle", "focus": "balanced", "level": "beginner", "weeks": 8, "sort_order": 10,
      "equipment": ["machines", "dumbbells", "bodyweight"],
      "notes": [
        "Tres sesiones de cuerpo completo por semana, con un día de descanso entre ellas.",
        "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente."
      ],
      "warnings": [],
      "days": [
        { "name": "Cuerpo completo", "exercises": [
          ["press-banca-mancuernas", 3, 8, 12, 90],
          ["jalon-al-pecho", 3, 8, 12, 90],
          ["prensa-de-piernas", 3, 10, 12, 90],
          ["elevaciones-laterales", 2, 12, 15, 60],
          ["curl-biceps-mancuernas", 2, 12, 15, 60],
          ["plancha", 2, 20, 40, 45]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["press-hombros-maquina", 3, 8, 12, 90],
          ["remo-sentado-en-maquina", 3, 8, 12, 90],
          ["sentadilla-goblet", 3, 8, 12, 90],
          ["peso-muerto-rumano-mancuernas", 3, 8, 12, 90],
          ["extension-de-triceps-en-polea", 2, 12, 15, 60],
          ["crunch-abdominal", 2, 12, 15, 45]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["flexiones", 3, 8, 12, 90],
          ["remo-con-mancuerna", 3, 8, 12, 90],
          ["prensa-de-piernas", 3, 10, 12, 90],
          ["curl-femoral-en-maquina", 2, 12, 15, 60],
          ["aperturas-en-maquina", 2, 12, 15, 60],
          ["perro-pajaro", 2, 10, 12, 45]
        ]}
      ]
    },
    {
      "slug": "masa-muscular-intermedio",
      "name": "Masa muscular · Intermedio",
      "description": "Cuatro sesiones por semana alternando parte superior e inferior, con barra, mancuernas y máquinas.",
      "goal": "muscle", "focus": "balanced", "level": "intermediate", "weeks": 8, "sort_order": 20,
      "equipment": ["barbell", "dumbbells", "machines", "bodyweight"],
      "notes": [
        "Alternas parte superior e inferior: dos sesiones de cada una por semana.",
        "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente."
      ],
      "warnings": [
        "Los ejercicios con barra son exigentes: empieza con poco peso y usa topes de seguridad o entrena acompañado."
      ],
      "days": [
        { "name": "Parte superior (pecho, espalda y brazos)", "exercises": [
          ["press-banca-plano", 4, 8, 12, 90],
          ["remo-con-barra", 4, 8, 12, 90],
          ["press-militar-mancuernas", 3, 8, 12, 90],
          ["jalon-al-pecho", 3, 10, 12, 75],
          ["curl-biceps-mancuernas", 3, 10, 15, 60],
          ["extension-de-triceps-en-polea", 3, 10, 15, 60]
        ]},
        { "name": "Parte inferior (piernas y glúteos)", "exercises": [
          ["prensa-de-piernas", 4, 8, 12, 90],
          ["peso-muerto-rumano-barra", 4, 8, 12, 90],
          ["zancadas", 3, 10, 12, 75],
          ["curl-femoral-en-maquina", 3, 10, 15, 60],
          ["elevacion-de-talones", 3, 12, 15, 45],
          ["plancha", 3, 20, 40, 45]
        ]},
        { "name": "Parte superior (pecho, espalda y brazos)", "exercises": [
          ["press-inclinado-mancuernas", 4, 8, 12, 90],
          ["remo-con-mancuerna", 4, 8, 12, 90],
          ["press-hombros-maquina", 3, 8, 12, 90],
          ["remo-sentado-en-maquina", 3, 10, 12, 75],
          ["elevaciones-laterales", 3, 12, 15, 60],
          ["aperturas-en-maquina", 3, 12, 15, 60]
        ]},
        { "name": "Parte inferior (piernas y glúteos)", "exercises": [
          ["sentadilla-goblet", 4, 8, 12, 90],
          ["peso-muerto-rumano-mancuernas", 4, 8, 12, 90],
          ["puente-de-gluteos", 3, 12, 15, 60],
          ["extension-de-cuadriceps", 3, 10, 15, 60],
          ["elevacion-de-talones", 3, 12, 15, 45],
          ["crunch-abdominal", 3, 10, 15, 45]
        ]}
      ]
    },
    {
      "slug": "definir-gimnasio",
      "name": "Definir y perder grasa · Gimnasio",
      "description": "Tres sesiones de cuerpo completo con más repeticiones y descansos cortos, con máquinas y mancuernas.",
      "goal": "definition", "focus": "balanced", "level": "beginner", "weeks": 8, "sort_order": 30,
      "equipment": ["machines", "dumbbells", "bodyweight"],
      "notes": [
        "Más repeticiones y descansos cortos para mantener el ritmo alto.",
        "No se puede perder grasa de una sola zona: el cuerpo la reduce en conjunto.",
        "Para definir, el entrenamiento ayuda, pero la alimentación tiene un peso enorme en el resultado."
      ],
      "warnings": [],
      "days": [
        { "name": "Cuerpo completo", "exercises": [
          ["prensa-de-piernas", 3, 12, 15, 45],
          ["press-banca-mancuernas", 3, 12, 15, 45],
          ["jalon-al-pecho", 3, 12, 15, 45],
          ["elevaciones-laterales", 2, 12, 15, 30],
          ["crunch-abdominal", 2, 15, 20, 30],
          ["plancha", 2, 20, 40, 30]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["sentadilla-goblet", 3, 12, 15, 45],
          ["press-hombros-maquina", 3, 12, 15, 45],
          ["remo-sentado-en-maquina", 3, 12, 15, 45],
          ["peso-muerto-rumano-mancuernas", 3, 12, 15, 45],
          ["curl-biceps-mancuernas", 2, 12, 15, 30],
          ["perro-pajaro", 2, 10, 12, 30]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["zancadas", 3, 12, 15, 45],
          ["flexiones", 3, 10, 15, 45],
          ["remo-con-mancuerna", 3, 12, 15, 45],
          ["curl-femoral-en-maquina", 2, 12, 15, 30],
          ["extension-de-triceps-en-polea", 2, 12, 15, 30],
          ["plancha", 2, 20, 40, 30]
        ]}
      ]
    },
    {
      "slug": "definir-en-casa",
      "name": "Definir y perder grasa · En casa",
      "description": "Tres sesiones de cuerpo completo solo con tu peso corporal y un banco o silla. No necesitas gimnasio.",
      "goal": "definition", "focus": "balanced", "level": "beginner", "weeks": 8, "sort_order": 40,
      "equipment": ["bodyweight"],
      "notes": [
        "Solo con peso corporal: sin material no hay ejercicios de espalda. Si tienes mancuernas o acceso a un gimnasio, la rutina de gimnasio es más completa.",
        "No se puede perder grasa de una sola zona: el cuerpo la reduce en conjunto.",
        "Para definir, el entrenamiento ayuda, pero la alimentación tiene un peso enorme en el resultado."
      ],
      "warnings": [],
      "days": [
        { "name": "Cuerpo completo", "exercises": [
          ["sentadilla-peso-corporal", 3, 15, 20, 45],
          ["flexiones", 3, 10, 15, 45],
          ["puente-de-gluteos", 3, 15, 20, 30],
          ["fondos-en-banco", 2, 10, 15, 45],
          ["crunch-abdominal", 3, 15, 20, 30],
          ["plancha", 3, 20, 40, 30]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["zancadas", 3, 10, 12, 45],
          ["flexiones", 3, 10, 15, 45],
          ["elevacion-de-talones", 3, 15, 20, 30],
          ["perro-pajaro", 2, 10, 12, 30],
          ["crunch-abdominal", 3, 15, 20, 30]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["sentadilla-peso-corporal", 3, 15, 20, 45],
          ["fondos-en-banco", 3, 10, 15, 45],
          ["puente-de-gluteos", 3, 15, 20, 30],
          ["flexiones", 2, 10, 15, 45],
          ["plancha", 3, 20, 40, 30],
          ["perro-pajaro", 2, 10, 12, 30]
        ]}
      ]
    },
    {
      "slug": "fuerza-intermedio",
      "name": "Fuerza · Intermedio",
      "description": "Cuatro sesiones por semana con pocas repeticiones y descansos largos para levantar cada vez más peso.",
      "goal": "strength", "focus": "balanced", "level": "intermediate", "weeks": 8, "sort_order": 50,
      "equipment": ["barbell", "dumbbells", "machines", "bodyweight"],
      "notes": [
        "Pocas repeticiones con mucho peso y descansos largos: descansa lo necesario entre series.",
        "Cuando completes todas las series en el máximo de repeticiones y con buena técnica, sube un poco el peso la semana siguiente."
      ],
      "warnings": [
        "Los ejercicios con barra son exigentes: empieza con poco peso y usa topes de seguridad o entrena acompañado."
      ],
      "days": [
        { "name": "Parte superior (pecho, espalda y brazos)", "exercises": [
          ["press-banca-plano", 4, 4, 6, 150],
          ["remo-con-barra", 4, 4, 6, 150],
          ["press-militar-mancuernas", 3, 6, 8, 120],
          ["jalon-al-pecho", 3, 8, 10, 90],
          ["extension-de-triceps-en-polea", 3, 8, 12, 75]
        ]},
        { "name": "Parte inferior (piernas y glúteos)", "exercises": [
          ["prensa-de-piernas", 4, 5, 8, 150],
          ["peso-muerto-rumano-barra", 4, 4, 6, 150],
          ["zancadas", 3, 8, 10, 90],
          ["curl-femoral-en-maquina", 3, 8, 12, 75],
          ["plancha", 3, 20, 40, 60]
        ]},
        { "name": "Parte superior (pecho, espalda y brazos)", "exercises": [
          ["press-inclinado-mancuernas", 4, 6, 8, 120],
          ["remo-con-mancuerna", 4, 6, 8, 120],
          ["press-hombros-maquina", 3, 6, 8, 120],
          ["remo-sentado-en-maquina", 3, 8, 10, 90],
          ["curl-biceps-mancuernas", 3, 8, 12, 75]
        ]},
        { "name": "Parte inferior (piernas y glúteos)", "exercises": [
          ["sentadilla-goblet", 4, 6, 10, 120],
          ["peso-muerto-rumano-mancuernas", 4, 6, 8, 120],
          ["extension-de-cuadriceps", 3, 8, 12, 75],
          ["elevacion-de-talones", 3, 10, 12, 60],
          ["crunch-abdominal", 3, 8, 12, 60]
        ]}
      ]
    },
    {
      "slug": "condicion-fisica-principiante",
      "name": "Condición física · Principiante",
      "description": "Un mes de tres sesiones suaves de cuerpo completo para ponerte en marcha y coger el hábito.",
      "goal": "general_fitness", "focus": "balanced", "level": "beginner", "weeks": 4, "sort_order": 60,
      "equipment": ["machines", "dumbbells", "bodyweight"],
      "notes": [
        "Tres sesiones suaves por semana: lo importante es crear el hábito.",
        "Si te sobra energía al terminar las series, sube un poco el peso la semana siguiente."
      ],
      "warnings": [],
      "days": [
        { "name": "Cuerpo completo", "exercises": [
          ["sentadilla-peso-corporal", 2, 10, 15, 60],
          ["flexiones", 2, 10, 15, 60],
          ["remo-sentado-en-maquina", 2, 10, 15, 60],
          ["puente-de-gluteos", 2, 12, 15, 45],
          ["plancha", 2, 20, 40, 45]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["prensa-de-piernas", 2, 10, 15, 60],
          ["press-banca-mancuernas", 2, 10, 15, 60],
          ["jalon-al-pecho", 2, 10, 15, 60],
          ["elevaciones-laterales", 2, 12, 15, 45],
          ["perro-pajaro", 2, 10, 12, 45]
        ]},
        { "name": "Cuerpo completo", "exercises": [
          ["sentadilla-goblet", 2, 10, 15, 60],
          ["press-hombros-maquina", 2, 10, 15, 60],
          ["remo-con-mancuerna", 2, 10, 15, 60],
          ["zancadas", 2, 10, 12, 60],
          ["crunch-abdominal", 2, 10, 15, 45]
        ]}
      ]
    }
  ]$json$::jsonb;
  v_r jsonb;
  v_d jsonb;
  v_e jsonb;
  v_rid uuid;
  v_did uuid;
  v_eid uuid;
  v_dn bigint;
  v_en bigint;
begin
  for v_r in select value from jsonb_array_elements(v_data) loop
    if exists (select 1 from public.catalog_routines where slug = v_r ->> 'slug') then
      continue;
    end if;

    insert into public.catalog_routines (
      slug, name, description, goal, focus, level, weeks,
      equipment, notes, warnings, sort_order, is_published
    )
    values (
      v_r ->> 'slug', v_r ->> 'name', v_r ->> 'description',
      v_r ->> 'goal', v_r ->> 'focus', v_r ->> 'level',
      (v_r ->> 'weeks')::smallint,
      array(select jsonb_array_elements_text(v_r -> 'equipment')),
      array(select jsonb_array_elements_text(v_r -> 'notes')),
      array(select jsonb_array_elements_text(v_r -> 'warnings')),
      (v_r ->> 'sort_order')::integer,
      true
    )
    returning id into v_rid;

    for v_d, v_dn in
      select value, ordinality from jsonb_array_elements(v_r -> 'days') with ordinality
    loop
      insert into public.catalog_routine_days (catalog_routine_id, day_number, name)
      values (v_rid, v_dn::smallint, v_d ->> 'name')
      returning id into v_did;

      for v_e, v_en in
        select value, ordinality from jsonb_array_elements(v_d -> 'exercises') with ordinality
      loop
        select id into v_eid from public.exercises where slug = v_e ->> 0;
        if v_eid is null then
          raise exception 'Falta el ejercicio %', v_e ->> 0;
        end if;

        insert into public.catalog_routine_day_exercises (
          catalog_day_id, exercise_id, sort_order, target_sets,
          reps_min, reps_max, rest_seconds
        )
        values (
          v_did, v_eid, v_en::smallint,
          (v_e ->> 1)::smallint, (v_e ->> 2)::smallint,
          (v_e ->> 3)::smallint, (v_e ->> 4)::smallint
        );
      end loop;
    end loop;
  end loop;
end
$seed$;