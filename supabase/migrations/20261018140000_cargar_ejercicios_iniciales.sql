-- Migración 0004: ejercicios iniciales de la biblioteca
-- Contenido propio de NEXORA, orientativo y de carácter general.
-- Se puede ejecutar más de una vez: ignora los ejercicios que ya existen.

insert into public.exercises (
  slug, name, primary_muscles, secondary_muscles, equipment,
  movement_pattern, difficulty, instructions, common_mistakes
) values

-- ---------- PECHO ----------
(
  'press-banca-plano', 'Press de banca plano',
  array['chest'], array['triceps', 'shoulders'],
  'barbell', 'push', 'intermediate',
  array[
    'Túmbate en el banco con los ojos bajo la barra, los pies firmes en el suelo y los omóplatos juntos y hacia abajo.',
    'Agarra la barra algo más ancha que los hombros y sácala del soporte con los brazos estirados.',
    'Baja la barra de forma controlada hasta rozar la parte media del pecho.',
    'Empuja hacia arriba hasta estirar los brazos sin despegar la espalda ni los glúteos del banco.',
    'Usa los topes de seguridad o pide ayuda a alguien si trabajas con cargas exigentes.'
  ],
  array[
    'Rebotar la barra contra el pecho.',
    'Despegar los glúteos del banco o arquear la espalda en exceso.',
    'Abrir los codos en cruz en lugar de llevarlos algo más cerca del cuerpo.'
  ]
),
(
  'press-banca-mancuernas', 'Press de banca con mancuernas',
  array['chest'], array['triceps', 'shoulders'],
  'dumbbells', 'push', 'beginner',
  array[
    'Siéntate en el banco con las mancuernas sobre los muslos y túmbate llevándolas con cuidado hasta el pecho.',
    'Empieza con las mancuernas a la altura del pecho y las palmas hacia delante o mirándose entre sí.',
    'Empuja hacia arriba hasta casi juntarlas sin que choquen.',
    'Baja de forma controlada, en unos 2 o 3 segundos, hasta notar un estiramiento cómodo en el pecho.',
    'Mantén los pies firmes y la espalda apoyada durante toda la serie.'
  ],
  array[
    'Bajar tanto las mancuernas que el hombro quede forzado.',
    'Subir una mancuerna más rápido que la otra.',
    'Arquear mucho la zona lumbar.'
  ]
),
(
  'flexiones', 'Flexiones',
  array['chest'], array['triceps', 'shoulders', 'abs'],
  'bodyweight', 'push', 'beginner',
  array[
    'Apoya las manos en el suelo algo más separadas que los hombros, con el cuerpo en línea recta de la cabeza a los talones.',
    'Aprieta el abdomen y los glúteos para mantener esa línea.',
    'Baja el pecho hacia el suelo con los codos a unos 45 grados del tronco.',
    'Empuja el suelo hasta estirar los brazos sin bloquear los codos con fuerza.',
    'Si te resultan muy difíciles, apoya las rodillas o coloca las manos en un banco.'
  ],
  array[
    'Dejar caer la cadera o levantarla demasiado.',
    'Adelantar la cabeza en lugar de mantener el cuello alineado.',
    'Abrir los codos hacia los lados.'
  ]
),
(
  'press-inclinado-mancuernas', 'Press inclinado con mancuernas',
  array['chest', 'shoulders'], array['triceps'],
  'dumbbells', 'push', 'intermediate',
  array[
    'Ajusta el banco con una inclinación suave, de unos 30 grados.',
    'Sujeta las mancuernas a los lados de la parte alta del pecho, con los omóplatos hacia atrás.',
    'Empuja hacia arriba y ligeramente hacia dentro hasta estirar los brazos.',
    'Baja de forma controlada hasta volver a la posición inicial.'
  ],
  array[
    'Inclinar demasiado el banco, de modo que trabajen sobre todo los hombros.',
    'Mover el cuerpo para ayudarte a subir la carga.',
    'Bajar las mancuernas sin control.'
  ]
),
(
  'aperturas-en-maquina', 'Aperturas en máquina',
  array['chest'], array['shoulders'],
  'machines', 'isolation', 'beginner',
  array[
    'Ajusta el asiento para que las asas queden a la altura del pecho y apoya bien la espalda.',
    'Con los codos ligeramente flexionados, lleva las asas hacia delante hasta juntarlas.',
    'Vuelve de forma controlada hasta notar un estiramiento suave, sin llevar los codos por detrás del torso.'
  ],
  array[
    'Usar demasiado peso y encoger los hombros.',
    'Forzar el estiramiento al final del recorrido.',
    'Despegar la espalda del respaldo.'
  ]
),

-- ---------- HOMBROS ----------
(
  'press-militar-mancuernas', 'Press militar con mancuernas sentado',
  array['shoulders'], array['triceps', 'traps'],
  'dumbbells', 'push', 'intermediate',
  array[
    'Siéntate con la espalda apoyada en un respaldo casi vertical.',
    'Sujeta las mancuernas a la altura de los hombros, con los antebrazos verticales.',
    'Empuja hacia arriba hasta estirar los brazos, sin que las mancuernas choquen.',
    'Baja de forma controlada hasta la altura de las orejas, con el abdomen firme.'
  ],
  array[
    'Arquear la zona lumbar para ayudarte a subir.',
    'Encoger los hombros hacia las orejas.',
    'Usar el impulso de las piernas.'
  ]
),
(
  'elevaciones-laterales', 'Elevaciones laterales',
  array['shoulders'], array['traps'],
  'dumbbells', 'isolation', 'beginner',
  array[
    'De pie, con mancuernas ligeras a los lados y los codos ligeramente flexionados.',
    'Eleva los brazos hacia los lados hasta la altura de los hombros.',
    'Haz una pausa breve y baja de forma controlada, en unos 2 o 3 segundos.',
    'Evita balancear el cuerpo para subir el peso.'
  ],
  array[
    'Usar demasiado peso y balancear el cuerpo.',
    'Subir por encima de los hombros encogiéndolos.',
    'Soltar el peso de golpe en la bajada.'
  ]
),
(
  'press-hombros-maquina', 'Press de hombros en máquina',
  array['shoulders'], array['triceps'],
  'machines', 'push', 'beginner',
  array[
    'Ajusta el asiento para que las asas queden a la altura de los hombros y apoya la espalda.',
    'Empuja hacia arriba hasta estirar los brazos, sin bloquear los codos con fuerza.',
    'Baja de forma controlada hasta la posición inicial.'
  ],
  array[
    'Subir los hombros hacia las orejas.',
    'Despegar la espalda del respaldo.',
    'Hacer un recorrido muy corto.'
  ]
),

-- ---------- ESPALDA ----------
(
  'jalon-al-pecho', 'Jalón al pecho',
  array['lats'], array['biceps', 'upper_back', 'forearms'],
  'machines', 'pull', 'beginner',
  array[
    'Ajusta la almohadilla sobre los muslos y agarra la barra algo más ancha que los hombros.',
    'Saca el pecho y inclínate ligeramente hacia atrás.',
    'Tira de la barra hacia la parte alta del pecho, llevando los codos hacia abajo y hacia atrás.',
    'Vuelve de forma controlada hasta estirar los brazos.'
  ],
  array[
    'Tirar solo con los brazos y balancearse hacia atrás.',
    'Llevar la barra por detrás de la nuca.',
    'Soltar el peso de golpe al subir.'
  ]
),
(
  'remo-con-mancuerna', 'Remo con mancuerna a una mano',
  array['lats', 'upper_back'], array['biceps', 'forearms'],
  'dumbbells', 'pull', 'beginner',
  array[
    'Apoya una mano y la rodilla del mismo lado en un banco, con la espalda recta y paralela al suelo.',
    'Sujeta la mancuerna con el brazo estirado.',
    'Tira hacia la cadera llevando el codo cerca del cuerpo.',
    'Haz una pausa y baja de forma controlada. Repite y cambia de lado.'
  ],
  array[
    'Girar el torso para subir la carga.',
    'Redondear la espalda.',
    'Tirar hacia el hombro en lugar de hacia la cadera.'
  ]
),
(
  'remo-con-barra', 'Remo con barra',
  array['lats', 'upper_back'], array['biceps', 'lower_back', 'forearms'],
  'barbell', 'pull', 'intermediate',
  array[
    'Coloca los pies a la anchura de las caderas, con las rodillas ligeramente flexionadas.',
    'Inclina el torso hacia delante, con la espalda neutra, y agarra la barra algo más ancha que los hombros.',
    'Tira de la barra hacia la parte baja del abdomen.',
    'Baja de forma controlada sin perder la postura.',
    'Empieza con poco peso hasta dominar la técnica.'
  ],
  array[
    'Redondear la zona lumbar.',
    'Usar el impulso del torso para subir la barra.',
    'Subir la barra hacia el pecho en lugar de hacia el abdomen.'
  ]
),
(
  'remo-sentado-en-maquina', 'Remo sentado en máquina',
  array['upper_back', 'lats'], array['biceps', 'forearms'],
  'machines', 'pull', 'beginner',
  array[
    'Ajusta el asiento y el apoyo del pecho, y agarra las asas con los brazos estirados.',
    'Tira llevando los codos hacia atrás y juntando los omóplatos.',
    'Haz una pausa breve y vuelve de forma controlada.'
  ],
  array[
    'Encoger los hombros al tirar.',
    'Balancear el torso hacia atrás.',
    'Soltar el peso rápidamente al volver.'
  ]
),
(
  'dominadas', 'Dominadas',
  array['lats'], array['biceps', 'upper_back', 'forearms'],
  'bodyweight', 'pull', 'advanced',
  array[
    'Cuélgate de la barra con un agarre algo más ancho que los hombros y los brazos estirados.',
    'Baja los omóplatos y tira hasta que la barbilla supere la barra.',
    'Baja de forma controlada hasta estirar los brazos.',
    'Si todavía no puedes hacerlas, empieza con bandas de ayuda o con el jalón al pecho.'
  ],
  array[
    'Balancearse con las piernas para tomar impulso.',
    'Hacer un recorrido incompleto.',
    'Encoger los hombros hacia las orejas al colgarse.'
  ]
),

-- ---------- BRAZOS ----------
(
  'curl-biceps-mancuernas', 'Curl de bíceps con mancuernas',
  array['biceps'], array['forearms'],
  'dumbbells', 'isolation', 'beginner',
  array[
    'De pie, con una mancuerna en cada mano y las palmas hacia delante.',
    'Mantén los codos pegados al cuerpo y flexiona los codos subiendo las mancuernas.',
    'Baja de forma controlada hasta estirar casi del todo los brazos.'
  ],
  array[
    'Balancear el tronco para subir el peso.',
    'Adelantar los codos.',
    'Dejar caer las mancuernas en la bajada.'
  ]
),
(
  'extension-de-triceps-en-polea', 'Extensión de tríceps en polea',
  array['triceps'], array['forearms'],
  'machines', 'isolation', 'beginner',
  array[
    'De pie frente a una polea alta con barra o cuerda, con los codos pegados al cuerpo.',
    'Empuja hacia abajo hasta estirar los brazos.',
    'Vuelve de forma controlada hasta que los codos formen unos 90 grados.'
  ],
  array[
    'Separar los codos del cuerpo.',
    'Inclinar mucho el tronco y empujar con el peso corporal.',
    'Dejar que el peso suba de golpe.'
  ]
),
(
  'fondos-en-banco', 'Fondos en banco',
  array['triceps'], array['chest', 'shoulders'],
  'bodyweight', 'push', 'beginner',
  array[
    'Apoya las manos en el borde de un banco, con los dedos hacia delante y las piernas flexionadas.',
    'Baja flexionando los codos hacia atrás hasta unos 90 grados, con la espalda cerca del banco.',
    'Empuja hasta estirar los brazos.',
    'Si notas molestias en los hombros, elige otro ejercicio para el tríceps.'
  ],
  array[
    'Bajar demasiado, lo que tensa la parte delantera del hombro.',
    'Abrir los codos hacia los lados.',
    'Separar la espalda del banco.'
  ]
),

-- ---------- PIERNAS ----------
(
  'sentadilla-peso-corporal', 'Sentadilla con peso corporal',
  array['quadriceps', 'glutes'], array['hamstrings', 'abs'],
  'bodyweight', 'squat', 'beginner',
  array[
    'De pie, con los pies algo más separados que las caderas y las puntas ligeramente hacia fuera.',
    'Extiende los brazos al frente y flexiona caderas y rodillas como si te sentaras.',
    'Baja hasta donde puedas mantener la espalda recta y los talones apoyados.',
    'Empuja el suelo para volver a subir.'
  ],
  array[
    'Dejar que las rodillas se vayan hacia dentro.',
    'Levantar los talones del suelo.',
    'Redondear la espalda.'
  ]
),
(
  'sentadilla-goblet', 'Sentadilla goblet',
  array['quadriceps', 'glutes'], array['abs', 'lower_back'],
  'dumbbells', 'squat', 'beginner',
  array[
    'Sujeta una mancuerna en vertical contra el pecho con las dos manos.',
    'Coloca los pies algo más anchos que los hombros.',
    'Baja entre las piernas con el pecho alto y los codos por dentro de las rodillas.',
    'Sube empujando el suelo con todo el pie.'
  ],
  array[
    'Dejar caer el pecho hacia delante.',
    'Dejar que las rodillas se vayan hacia dentro.',
    'Levantar los talones.'
  ]
),
(
  'sentadilla-con-barra', 'Sentadilla con barra',
  array['quadriceps', 'glutes'], array['hamstrings', 'lower_back', 'abs'],
  'barbell', 'squat', 'advanced',
  array[
    'Coloca la barra sobre la parte alta de la espalda, nunca sobre el cuello, en un soporte con topes de seguridad.',
    'Da un paso atrás y coloca los pies a la anchura de los hombros.',
    'Con el abdomen firme, baja de forma controlada manteniendo la espalda neutra.',
    'Sube empujando el suelo.',
    'Aprende la técnica con poco peso y, si es posible, con la supervisión de alguien con experiencia.'
  ],
  array[
    'Redondear la zona lumbar al final del descenso.',
    'Dejar que las rodillas se vayan hacia dentro.',
    'Subir primero la cadera y después el pecho.'
  ]
),
(
  'prensa-de-piernas', 'Prensa de piernas',
  array['quadriceps', 'glutes'], array['hamstrings', 'calves'],
  'machines', 'squat', 'beginner',
  array[
    'Ajusta el respaldo y coloca los pies a la anchura de los hombros en la plataforma.',
    'Desbloquea la máquina y baja flexionando las rodillas hasta un ángulo cómodo, sin despegar la zona lumbar del respaldo.',
    'Empuja la plataforma sin bloquear las rodillas con fuerza.'
  ],
  array[
    'Bajar tanto que la zona lumbar se despega y se redondea.',
    'Bloquear las rodillas con violencia al subir.',
    'Dejar que las rodillas se vayan hacia dentro.'
  ]
),
(
  'zancadas', 'Zancadas',
  array['quadriceps', 'glutes'], array['hamstrings', 'calves'],
  'bodyweight', 'lunge', 'beginner',
  array[
    'De pie, da un paso largo hacia delante.',
    'Baja la rodilla de atrás hacia el suelo con el tronco erguido.',
    'Mantén la rodilla delantera en la dirección del pie.',
    'Empuja con el pie delantero para volver y alterna las piernas.'
  ],
  array[
    'Dar un paso demasiado corto.',
    'Dejar que la rodilla delantera se vaya hacia dentro.',
    'Inclinar el tronco hacia delante.'
  ]
),
(
  'peso-muerto-rumano-mancuernas', 'Peso muerto rumano con mancuernas',
  array['hamstrings', 'glutes'], array['lower_back', 'forearms'],
  'dumbbells', 'hinge', 'beginner',
  array[
    'De pie, con las mancuernas delante de los muslos y las rodillas ligeramente flexionadas.',
    'Lleva la cadera hacia atrás y baja las mancuernas pegadas a las piernas, con la espalda neutra.',
    'Baja hasta notar estiramiento en la parte posterior de las piernas.',
    'Vuelve a subir empujando la cadera hacia delante.'
  ],
  array[
    'Redondear la espalda.',
    'Flexionar demasiado las rodillas, convirtiéndolo en una sentadilla.',
    'Separar las mancuernas del cuerpo.'
  ]
),
(
  'peso-muerto-rumano-barra', 'Peso muerto rumano con barra',
  array['hamstrings', 'glutes'], array['lower_back', 'forearms', 'traps'],
  'barbell', 'hinge', 'intermediate',
  array[
    'De pie, con la barra delante de los muslos, las rodillas ligeramente flexionadas y la espalda neutra.',
    'Lleva la cadera hacia atrás y baja la barra pegada a las piernas.',
    'Baja hasta notar estiramiento en la parte posterior de las piernas, sin redondear la espalda.',
    'Sube empujando la cadera hacia delante.',
    'Empieza con poco peso hasta dominar el movimiento.'
  ],
  array[
    'Redondear la zona lumbar.',
    'Separar la barra del cuerpo.',
    'Echarse hacia atrás al terminar el movimiento.'
  ]
),
(
  'puente-de-gluteos', 'Puente de glúteos',
  array['glutes'], array['hamstrings', 'abs'],
  'bodyweight', 'hinge', 'beginner',
  array[
    'Túmbate boca arriba con las rodillas flexionadas y los pies apoyados a la anchura de las caderas.',
    'Aprieta el abdomen y los glúteos y eleva la cadera hasta formar una línea de las rodillas a los hombros.',
    'Mantén 1 o 2 segundos arriba y baja de forma controlada.'
  ],
  array[
    'Arquear en exceso la zona lumbar al subir.',
    'Empujar solo con la punta de los pies.',
    'Subir con impulso.'
  ]
),
(
  'extension-de-cuadriceps', 'Extensión de cuádriceps',
  array['quadriceps'], array[]::text[],
  'machines', 'isolation', 'beginner',
  array[
    'Ajusta el asiento para que la rodilla quede alineada con el eje de la máquina y el cojín sobre los tobillos.',
    'Estira las piernas hasta casi extenderlas del todo.',
    'Baja de forma controlada hasta la posición inicial.'
  ],
  array[
    'Usar el impulso para subir el peso.',
    'Bloquear las rodillas con violencia.',
    'Usar demasiado peso, lo que sobrecarga las rodillas.'
  ]
),
(
  'curl-femoral-en-maquina', 'Curl femoral en máquina',
  array['hamstrings'], array['calves'],
  'machines', 'isolation', 'beginner',
  array[
    'Ajusta la máquina para que el cojín quede en la parte baja de las pantorrillas y las caderas estén apoyadas.',
    'Flexiona las rodillas llevando los talones hacia los glúteos.',
    'Vuelve de forma controlada hasta estirar las piernas.'
  ],
  array[
    'Levantar las caderas del apoyo.',
    'Usar el impulso para subir el peso.',
    'Hacer un recorrido muy corto.'
  ]
),
(
  'elevacion-de-talones', 'Elevación de talones',
  array['calves'], array[]::text[],
  'bodyweight', 'isolation', 'beginner',
  array[
    'De pie, con las puntas de los pies en el borde de un escalón y apoyándote en algo para mantener el equilibrio.',
    'Sube de puntillas todo lo que puedas.',
    'Haz una pausa y baja de forma controlada hasta estirar la pantorrilla.'
  ],
  array[
    'Rebotar sin control.',
    'Hacer un recorrido corto.',
    'Flexionar las rodillas para ayudarte.'
  ]
),

-- ---------- ABDOMEN ----------
(
  'plancha', 'Plancha',
  array['abs'], array['shoulders', 'glutes', 'lower_back'],
  'bodyweight', 'core', 'beginner',
  array[
    'Apoya los antebrazos en el suelo con los codos bajo los hombros.',
    'Mantén el cuerpo en una línea recta de la cabeza a los talones, con el abdomen y los glúteos apretados.',
    'Respira con normalidad y mantén el tiempo indicado.',
    'Si pierdes la postura, descansa.'
  ],
  array[
    'Dejar caer la cadera o levantarla demasiado.',
    'Contener la respiración.',
    'Mirar hacia delante forzando el cuello.'
  ]
),
(
  'crunch-abdominal', 'Crunch abdominal',
  array['abs'], array[]::text[],
  'bodyweight', 'core', 'beginner',
  array[
    'Túmbate boca arriba con las rodillas flexionadas.',
    'Coloca las manos junto a las sienes o cruzadas sobre el pecho.',
    'Eleva los hombros del suelo contrayendo el abdomen.',
    'Baja de forma controlada sin relajar del todo.'
  ],
  array[
    'Tirar del cuello con las manos.',
    'Subir demasiado el tronco.',
    'Usar impulso en lugar del abdomen.'
  ]
),
(
  'perro-pajaro', 'Perro-pájaro (bird dog)',
  array['abs'], array['glutes', 'lower_back', 'shoulders'],
  'bodyweight', 'core', 'beginner',
  array[
    'Colócate a cuatro apoyos, con las manos bajo los hombros y las rodillas bajo las caderas.',
    'Mantén el abdomen firme y la espalda neutra.',
    'Estira un brazo hacia delante y la pierna contraria hacia atrás hasta alinearlos con el tronco.',
    'Haz una pausa de 1 o 2 segundos, vuelve y alterna los lados.'
  ],
  array[
    'Arquear la zona lumbar o rotar la cadera.',
    'Subir la pierna por encima de la línea del tronco.',
    'Moverse con rapidez y sin control.'
  ]
)
on conflict (slug) do nothing;