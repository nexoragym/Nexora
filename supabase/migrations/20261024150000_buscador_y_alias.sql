-- Migración 0010 (se puede ejecutar más de una vez sin errores):
-- buscador de ejercicios. Cada ejercicio guarda sus "alias" (otras formas de
-- escribirlo) y un texto de búsqueda sin tildes ni mayúsculas.

-- 1. Columnas nuevas
alter table public.exercises
  add column if not exists aliases text[] not null default '{}',
  add column if not exists search_text text not null default '';

-- 2. Quita tildes y mayúsculas (sirve para guardar y para buscar)
create or replace function public.normalize_search(p_text text)
returns text
language sql
immutable
set search_path = ''
as $$
  select translate(
    lower(coalesce(p_text, '')),
    'áéíóúüñàèìòùâêîôûç',
    'aeiouunaeiouaeiouc'
  );
$$;

-- 3. El texto de búsqueda se rellena solo al crear o editar un ejercicio
create or replace function public.exercises_set_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_text := public.normalize_search(
    new.name || ' ' || array_to_string(new.aliases, ' ')
  );
  return new;
end;
$$;

drop trigger if exists exercises_set_search_text on public.exercises;
create trigger exercises_set_search_text
  before insert or update of name, aliases on public.exercises
  for each row
  execute function public.exercises_set_search_text();

-- 4. Alias de los 30 ejercicios que ya existían
update public.exercises as e
set aliases = v.aliases
from (values
  ('press-banca-plano', array['press banca', 'banca plana', 'press de banca', 'press plano con barra', 'bench press', 'barbell bench press', 'flat bench press', 'press de pecho con barra', 'press de pecho plano', 'banca', 'press pecho barra', 'pecho con barra', 'press de banca plana', 'press de banca con barra']),
  ('press-banca-mancuernas', array['press con mancuernas', 'press plano con mancuernas', 'press de pecho con mancuernas', 'dumbbell bench press', 'dumbbell press', 'press banca con mancuernas', 'press de banca mancuernas', 'press de pecho mancuernas', 'banca con mancuernas', 'press plano mancuernas', 'press mancuernas', 'press de pecho con pesas', 'press de banca con pesas']),
  ('flexiones', array['flexiones de brazos', 'flexiones de pecho', 'lagartijas', 'push ups', 'push up', 'pushups', 'flexion de brazos', 'flexiones clasicas', 'flexiones normales', 'flexiones basicas', 'flexiones en el suelo', 'flexiones con peso corporal', 'flexiones de brazo']),
  ('press-inclinado-mancuernas', array['press inclinado', 'press inclinado con mancuernas en banco', 'press banca inclinado con mancuernas', 'incline dumbbell press', 'incline press', 'press de pecho inclinado', 'press inclinado mancuernas', 'banca inclinada con mancuernas', 'press de pecho alto con mancuernas', 'press superior de pecho', 'press de pecho inclinado con mancuernas', 'press inclinado con pesas', 'pecho alto con mancuernas']),
  ('aperturas-en-maquina', array['aperturas', 'peck deck', 'pec deck', 'aperturas en pec deck', 'pec deck fly', 'machine fly', 'chest fly machine', 'contractora', 'maquina contractora', 'mariposa', 'maquina mariposa', 'aperturas en mariposa', 'aperturas de pecho en maquina', 'aperturas en contractora']),
  ('press-militar-mancuernas', array['press militar', 'press de hombros con mancuernas', 'press de hombros sentado', 'press de hombro con mancuernas', 'press hombro mancuernas', 'shoulder press', 'dumbbell shoulder press', 'seated dumbbell press', 'seated shoulder press', 'press militar sentado', 'press por encima de la cabeza sentado', 'press de hombros sentado con mancuernas', 'press militar con pesas', 'press militar mancuernas']),
  ('elevaciones-laterales', array['laterales', 'elevaciones laterales con mancuernas', 'elevacion lateral', 'vuelos laterales', 'vuelos laterales con mancuernas', 'aperturas laterales', 'lateral raise', 'lateral raises', 'dumbbell lateral raise', 'side raise', 'hombro lateral con mancuernas', 'elevaciones de hombros laterales', 'elevaciones laterales con pesas', 'aperturas laterales de hombro']),
  ('press-hombros-maquina', array['press de hombros con maquina', 'press hombros maquina', 'press militar en maquina', 'maquina de press de hombros', 'maquina de hombros', 'shoulder press machine', 'machine shoulder press', 'press de hombro sentado en maquina', 'press de hombros guiado', 'press militar guiado', 'maquina de press militar', 'press de hombros sentado en maquina']),
  ('jalon-al-pecho', array['jalon', 'jalon al pecho agarre ancho', 'jalon frontal', 'jalon en polea', 'jalon dorsal', 'lat pulldown', 'pulldown', 'lat pull down', 'jalones al pecho', 'tiron al pecho', 'polea al pecho', 'jalon con barra', 'jalon agarre ancho', 'polea alta al pecho', 'tiron frontal en polea']),
  ('remo-con-mancuerna', array['remo a una mano', 'remo unilateral', 'remo unilateral con mancuerna', 'remo con mancuerna', 'remo mancuerna', 'remo en banco con mancuerna', 'dumbbell row', 'one arm dumbbell row', 'single arm row', 'remo con una mancuerna', 'remo a un brazo', 'remo con pesa', 'remo serrucho', 'remo unilateral en banco']),
  ('remo-con-barra', array['remo inclinado', 'remo inclinado con barra', 'remo barra', 'remo con barra inclinado', 'barbell row', 'bent over row', 'bent over barbell row', 'remo con barra agarre prono', 'remo con barra pronado', 'remo a dos manos', 'remo con barra de pie', 'remo con barra olimpica', 'remo con barra al abdomen', 'remo con barra a la cintura']),
  ('remo-sentado-en-maquina', array['remo en maquina', 'remo sentado', 'remo maquina', 'remo sentado maquina', 'remo con apoyo en el pecho', 'seated row', 'machine row', 'seated cable row', 'remo en polea baja', 'remo en polea sentado', 'remo de pecho apoyado', 'remo guiado', 'remo sentado en polea', 'remo horizontal en maquina', 'maquina de remo']),
  ('dominadas', array['dominada', 'dominadas con peso corporal', 'dominadas agarre prono', 'dominadas en barra', 'pull up', 'pull ups', 'pullup', 'pullups', 'barra fija', 'dominadas pronas', 'dominadas con agarre ancho', 'dominadas de espalda', 'tracciones', 'tracciones en barra', 'chin up']),
  ('curl-biceps-mancuernas', array['curl de biceps', 'curl con mancuernas', 'curl biceps', 'curl de biceps con pesas', 'biceps con mancuernas', 'dumbbell curl', 'bicep curl', 'biceps curl', 'flexiones de codo con mancuernas', 'curl alterno', 'curl de biceps alterno', 'curl de biceps de pie', 'rizo de biceps', 'curl mancuernas', 'curl con pesas']),
  ('extension-de-triceps-en-polea', array['triceps en polea', 'extension de triceps', 'extensiones de triceps en polea', 'jalon de triceps', 'jalon de triceps en polea', 'pushdown', 'triceps pushdown', 'cable pushdown', 'triceps en polea alta', 'empuje de triceps en polea', 'extension de triceps con cuerda', 'triceps con cuerda', 'triceps con barra en polea', 'press de triceps en polea', 'polea de triceps']),
  ('fondos-en-banco', array['fondos de triceps', 'fondos de triceps en banco', 'fondos en silla', 'fondos entre bancos', 'fondos en banco para triceps', 'bench dips', 'triceps dips', 'dips en banco', 'fondos de brazos en banco', 'fondos en banco detras', 'fondos con apoyo en banco', 'fondos de triceps en silla', 'triceps en banco', 'fondos en un banco']),
  ('sentadilla-peso-corporal', array['sentadilla', 'sentadillas', 'sentadillas sin peso', 'sentadilla libre', 'sentadilla sin peso', 'bodyweight squat', 'air squat', 'squat sin peso', 'sentadillas con peso corporal', 'sentadilla basica', 'sentadilla de pie', 'sentadillas en casa', 'sentadilla al aire', 'sentadillas libres']),
  ('sentadilla-goblet', array['goblet squat', 'sentadilla con mancuerna', 'sentadilla con mancuerna al pecho', 'sentadilla copa', 'sentadilla con mancuerna goblet', 'sentadilla frontal con mancuerna', 'sentadilla con pesa al pecho', 'sentadilla con mancuerna en el pecho', 'sentadilla goblet con mancuerna', 'goblet', 'sentadilla con peso al pecho', 'sentadilla con una mancuerna', 'sentadilla con pesa rusa']),
  ('sentadilla-con-barra', array['sentadilla trasera', 'sentadilla con barra libre', 'back squat', 'barbell squat', 'squat con barra', 'sentadilla barra', 'sentadillas con barra', 'sentadilla en rack', 'sentadilla barra trasera', 'sentadilla olimpica', 'sentadilla con peso', 'squat', 'sentadilla de barra alta', 'sentadilla con barra en la espalda']),
  ('prensa-de-piernas', array['prensa', 'prensa de pierna', 'prensa 45', 'prensa inclinada', 'prensa horizontal', 'leg press', 'leg press 45', 'maquina de prensa', 'prensa de piernas 45 grados', 'prensa de muslo', 'press de piernas', 'press de pierna', 'prensa para piernas', 'prensa de cuadriceps', 'maquina de prensa de piernas']),
  ('zancadas', array['zancada', 'zancadas alternas', 'zancadas con peso corporal', 'lunges', 'lunge', 'walking lunges', 'zancadas caminando', 'estocadas', 'estocada', 'zancada hacia delante', 'zancadas hacia delante', 'desplantes', 'desplante', 'zancadas sin peso']),
  ('peso-muerto-rumano-mancuernas', array['peso muerto rumano', 'peso muerto rumano con pesas', 'rumano con mancuernas', 'peso muerto con mancuernas', 'peso muerto mancuernas', 'romanian deadlift', 'rdl', 'dumbbell rdl', 'dumbbell romanian deadlift', 'peso muerto piernas rigidas', 'peso muerto rigido con mancuernas', 'peso muerto con piernas semirrigidas', 'rumano mancuernas']),
  ('peso-muerto-rumano-barra', array['peso muerto rumano con barra olimpica', 'rumano con barra', 'peso muerto rumano', 'peso muerto con barra', 'barbell rdl', 'romanian deadlift con barra', 'peso muerto rigido', 'peso muerto piernas rigidas', 'peso muerto con piernas rectas', 'peso muerto convencional rumano', 'peso muerto de isquios', 'rumano barra', 'rdl con barra', 'stiff leg deadlift']),
  ('puente-de-gluteos', array['puente de gluteo', 'puente gluteo', 'puente de cadera', 'puente de cadera en suelo', 'elevacion de cadera', 'elevaciones de cadera', 'hip bridge', 'glute bridge', 'bridge', 'elevacion de pelvis', 'puente de gluteos en el suelo', 'gluteos en el suelo', 'puente con gluteos']),
  ('extension-de-cuadriceps', array['extension de piernas', 'extensiones de cuadriceps', 'maquina de cuadriceps', 'silla de cuadriceps', 'sillon de cuadriceps', 'leg extension', 'leg extensions', 'extension de rodilla', 'extensiones de piernas en maquina', 'cuadriceps en maquina', 'extensiones de pierna', 'maquina de extension de piernas', 'extension de cuadriceps en maquina', 'silla de extension']),
  ('curl-femoral-en-maquina', array['curl femoral', 'curl de piernas', 'curl femoral tumbado', 'curl femoral sentado', 'curl de isquios', 'curl de isquiotibiales', 'maquina de femorales', 'femoral tumbado', 'femoral sentado', 'leg curl', 'lying leg curl', 'seated leg curl', 'flexion de rodilla en maquina', 'curl de pierna', 'isquios en maquina', 'maquina de isquios']),
  ('elevacion-de-talones', array['elevacion de gemelos', 'elevaciones de talones', 'elevaciones de gemelos', 'gemelos de pie', 'gemelos', 'pantorrillas', 'elevacion de pantorrillas', 'calf raise', 'calf raises', 'standing calf raise', 'elevacion de puntillas', 'subir de puntillas', 'gemelos en escalon', 'gemelos sin peso', 'elevaciones de pantorrilla']),
  ('plancha', array['plancha abdominal', 'planchas', 'plancha frontal', 'plancha con antebrazos', 'plank', 'forearm plank', 'plancha isometrica', 'isometrico abdominal', 'plancha en antebrazos', 'abdominal isometrico', 'plancha de core', 'plancha clasica', 'plancha prona']),
  ('crunch-abdominal', array['crunch', 'crunches', 'abdominales', 'abdominales clasicos', 'abdominales en el suelo', 'encogimientos abdominales', 'abdominales cortos', 'abdominal crunch', 'sit up', 'situps', 'abdominales tradicionales', 'abdominales basicos', 'abdominales de suelo', 'encogimiento abdominal', 'crunch en suelo']),
  ('perro-pajaro', array['bird dog', 'bird-dog', 'perro pajaro', 'perro y pajaro', 'cuadrupedia', 'cuadrupedia brazo y pierna contraria', 'brazo y pierna contraria', 'extension de brazo y pierna contraria', 'perro pajaro abdominal', 'ejercicio de cuatro apoyos', 'elevacion de brazo y pierna opuestos', 'superman en cuadrupedia', 'dog bird', 'pajaro perro'])
) as v(slug, aliases)
where e.slug = v.slug;