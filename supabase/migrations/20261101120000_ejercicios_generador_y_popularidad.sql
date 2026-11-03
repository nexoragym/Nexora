-- Migración 0014: ejercicios en el generador y popularidad

alter table public.exercises
  add column if not exists use_in_generator boolean not null default true;

alter table public.exercises
  add column if not exists popularity smallint not null default 0;

alter table public.exercises
  drop constraint if exists exercises_popularity_range;

alter table public.exercises
  add constraint exercises_popularity_range
  check (popularity between 0 and 3);

comment on column public.exercises.use_in_generator is
  'Si es false, el generador automático no lo elige (sí se puede elegir a mano).';
comment on column public.exercises.popularity is
  '0 normal, 1 algo conocido, 2 conocido, 3 muy conocido.';

-- Valores iniciales (solo si todavía están en 0, así se puede re-ejecutar).
update public.exercises
set popularity = 3
where popularity = 0
  and slug in (
    'flexiones', 'dominadas', 'sentadilla-con-barra', 'press-banca-plano',
    'plancha', 'zancadas', 'jalon-al-pecho', 'curl-biceps-mancuernas',
    'prensa-de-piernas', 'press-militar-mancuernas', 'remo-con-barra',
    'fondos-en-banco', 'puente-de-gluteos', 'crunch-abdominal'
  );

update public.exercises
set popularity = 2
where popularity = 0
  and slug in (
    'press-banca-mancuernas', 'sentadilla-goblet', 'remo-con-mancuerna',
    'elevaciones-laterales', 'peso-muerto-rumano-mancuernas',
    'extension-de-triceps-en-polea', 'sentadilla-peso-corporal'
  );