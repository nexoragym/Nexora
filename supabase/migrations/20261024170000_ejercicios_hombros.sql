-- Migración 0012 (se puede ejecutar más de una vez: ignora los ejercicios que ya existen):
-- biblioteca ampliada, parte 1B: hombros y trapecios (14 ejercicios nuevos).
-- Contenido propio de NEXORA, orientativo y de carácter general.
-- Requiere haber ejecutado antes la migración 0010.

insert into public.exercises (
  slug, name, primary_muscles, secondary_muscles, equipment,
  movement_pattern, difficulty, instructions, common_mistakes, aliases
) values
(
  'press-militar-barra-de-pie', 'Press militar con barra de pie',
  array['shoulders'], array['triceps', 'traps', 'abs'],
  'barbell', 'push', 'intermediate',
  array[
    'De pie, con los pies a la anchura de los hombros, agarra la barra algo más ancha que los hombros y apóyala sobre la parte alta del pecho.',
    'Aprieta el abdomen y los glúteos.',
    'Empuja la barra hacia arriba pasando cerca de la cara hasta estirar los brazos sobre la cabeza.',
    'Baja de forma controlada hasta la parte alta del pecho.'
  ],
  array[
    'Arquear la zona lumbar para ayudarte a subir.',
    'Empujar la barra hacia delante en lugar de en vertical.',
    'Usar el impulso de las piernas.'
  ],
  array[
    'press militar con barra',
    'press militar',
    'press de hombros con barra',
    'press militar de pie',
    'overhead press',
    'ohp',
    'military press',
    'barbell shoulder press',
    'standing overhead press',
    'press de hombro con barra de pie',
    'press por encima de la cabeza',
    'press militar barra',
    'press de hombros de pie con barra'
  ]
),
(
  'press-arnold', 'Press Arnold',
  array['shoulders'], array['triceps'],
  'dumbbells', 'push', 'intermediate',
  array[
    'Siéntate con la espalda apoyada y sujeta las mancuernas frente al pecho, con las palmas hacia ti y los codos flexionados.',
    'Empuja hacia arriba girando las muñecas hasta que las palmas miren hacia delante al estirar los brazos.',
    'Baja de forma controlada girando de nuevo las muñecas hasta la posición inicial.',
    'Mantén el abdomen firme y evita arquear la espalda.'
  ],
  array[
    'Arquear la zona lumbar.',
    'Girar demasiado rápido y sin control.',
    'Usar demasiado peso.'
  ],
  array[
    'arnold press',
    'press arnold con mancuernas',
    'press de hombros arnold',
    'press de hombros con giro',
    'press con rotacion',
    'press de hombros con rotacion de munecas',
    'arnold dumbbell press',
    'press arnold sentado',
    'press hombros arnold',
    'press arnold mancuernas',
    'press de arnold',
    'press de hombros con mancuernas y giro'
  ]
),
(
  'press-hombros-mancuernas-de-pie', 'Press de hombros con mancuernas de pie',
  array['shoulders'], array['triceps', 'traps', 'abs'],
  'dumbbells', 'push', 'intermediate',
  array[
    'De pie, con los pies a la anchura de los hombros, sujeta las mancuernas a la altura de los hombros con los antebrazos verticales.',
    'Aprieta el abdomen y los glúteos.',
    'Empuja hacia arriba hasta estirar los brazos, sin que las mancuernas choquen.',
    'Baja de forma controlada hasta la altura de las orejas.'
  ],
  array[
    'Arquear la zona lumbar.',
    'Usar el impulso de las piernas.',
    'Encoger los hombros hacia las orejas.'
  ],
  array[
    'press de hombros de pie con mancuernas',
    'press hombros mancuernas de pie',
    'press militar de pie con mancuernas',
    'standing dumbbell shoulder press',
    'dumbbell overhead press',
    'press de hombro con mancuernas de pie',
    'press de hombros con pesas de pie',
    'press por encima de la cabeza con mancuernas',
    'press militar con mancuernas de pie',
    'shoulder press con mancuernas de pie',
    'press de hombros mancuernas',
    'press hombro de pie'
  ]
),
(
  'elevaciones-frontales', 'Elevaciones frontales con mancuernas',
  array['shoulders'], array['chest'],
  'dumbbells', 'isolation', 'beginner',
  array[
    'De pie, con una mancuerna en cada mano frente a los muslos y los codos ligeramente flexionados.',
    'Eleva un brazo hacia delante hasta la altura del hombro.',
    'Baja de forma controlada y repite con el otro brazo, o sube los dos a la vez.',
    'Mantén el tronco quieto, sin balancearte.'
  ],
  array[
    'Balancear el cuerpo para subir el peso.',
    'Subir por encima de la altura del hombro encogiéndolos.',
    'Usar demasiado peso.'
  ],
  array[
    'elevaciones frontales',
    'elevacion frontal con mancuerna',
    'elevaciones frontales de hombro',
    'front raise',
    'dumbbell front raise',
    'front raises con mancuernas',
    'elevaciones de hombro hacia delante',
    'elevaciones al frente',
    'elevaciones frontales con pesas',
    'hombro frontal con mancuernas',
    'elevacion de brazos al frente',
    'vuelos frontales'
  ]
),
(
  'pajaros-con-mancuernas', 'Pájaros con mancuernas (elevaciones posteriores)',
  array['shoulders', 'upper_back'], array['traps'],
  'dumbbells', 'isolation', 'intermediate',
  array[
    'Siéntate en el borde de un banco o inclínate hacia delante con la espalda recta, con una mancuerna en cada mano bajo las rodillas.',
    'Con los codos ligeramente flexionados, eleva los brazos hacia los lados hasta la altura de la espalda.',
    'Junta suavemente los omóplatos arriba y baja de forma controlada.',
    'Usa poco peso: es un ejercicio de control.'
  ],
  array[
    'Usar demasiado peso y balancear el torso.',
    'Redondear la espalda.',
    'Subir los brazos por encima de la línea del tronco.'
  ],
  array[
    'pajaros',
    'pajaros con mancuernas',
    'elevaciones posteriores',
    'elevaciones posteriores con mancuernas',
    'vuelos posteriores',
    'vuelos posteriores con mancuernas',
    'reverse fly',
    'rear delt fly',
    'bent over reverse fly',
    'pajaro con mancuernas',
    'deltoides posterior con mancuernas',
    'aperturas posteriores con mancuernas',
    'hombro posterior con mancuernas'
  ]
),
(
  'pec-deck-inverso', 'Aperturas inversas en máquina',
  array['shoulders', 'upper_back'], array['traps'],
  'machines', 'isolation', 'beginner',
  array[
    'Siéntate de cara al respaldo de la máquina con el pecho apoyado y agarra las asas con los brazos estirados al frente.',
    'Con los codos ligeramente flexionados, abre los brazos hacia atrás hasta la altura de los hombros.',
    'Junta suavemente los omóplatos y vuelve de forma controlada.'
  ],
  array[
    'Usar demasiado peso y encoger los hombros.',
    'Despegar el pecho del apoyo.',
    'Soltar el peso de golpe al volver.'
  ],
  array[
    'pec deck inverso',
    'aperturas inversas',
    'aperturas inversas con maquina',
    'peck deck inverso',
    'maquina de pajaros',
    'pajaros en maquina',
    'reverse pec deck',
    'rear delt machine',
    'reverse fly machine',
    'maquina de deltoides posterior',
    'aperturas posteriores en maquina',
    'contractora inversa',
    'hombro posterior en maquina'
  ]
),
(
  'face-pull', 'Face pull en polea',
  array['shoulders', 'upper_back'], array['traps'],
  'machines', 'pull', 'beginner',
  array[
    'Coloca una polea alta con cuerda a la altura de la cara y agarra los extremos con las palmas hacia dentro.',
    'Da un paso atrás con los brazos estirados y el abdomen firme.',
    'Tira de la cuerda hacia la cara, separando las manos y llevando los codos hacia atrás y arriba.',
    'Haz una pausa y vuelve de forma controlada.'
  ],
  array[
    'Usar demasiado peso e inclinarte hacia atrás.',
    'Tirar hacia el cuello en lugar de hacia la cara.',
    'Bajar los codos al tirar.'
  ],
  array[
    'face pulls',
    'face pull con cuerda',
    'tirones a la cara',
    'tiron a la cara en polea',
    'jalon a la cara',
    'tiron a la cara',
    'jalones a la cara',
    'facepull',
    'cuerda a la cara',
    'polea a la cara',
    'face pull en polea alta',
    'remo a la cara en polea',
    'tiron de cuerda a la cara'
  ]
),
(
  'elevaciones-laterales-polea', 'Elevaciones laterales en polea',
  array['shoulders'], array['traps'],
  'machines', 'isolation', 'intermediate',
  array[
    'Coloca una polea baja y agarra el asa con la mano contraria, de pie y de lado a la máquina.',
    'Con el codo ligeramente flexionado, eleva el brazo hacia el lado hasta la altura del hombro.',
    'Baja de forma controlada, sin soltar la tensión, y repite. Cambia de lado.'
  ],
  array[
    'Balancear el cuerpo para subir el peso.',
    'Subir por encima del hombro encogiéndolo.',
    'Usar demasiado peso.'
  ],
  array[
    'elevaciones laterales con polea',
    'elevacion lateral en polea',
    'laterales en polea',
    'laterales con cable',
    'cable lateral raise',
    'single arm cable lateral raise',
    'elevaciones laterales en cable',
    'elevaciones laterales a una mano en polea',
    'hombro lateral en polea',
    'laterales en polea baja',
    'elevacion lateral con polea baja',
    'vuelos laterales en polea'
  ]
),
(
  'elevaciones-laterales-maquina', 'Elevaciones laterales en máquina',
  array['shoulders'], array['traps'],
  'machines', 'isolation', 'beginner',
  array[
    'Ajusta el asiento para que el eje de la máquina quede a la altura de los hombros y apoya los antebrazos en las almohadillas.',
    'Eleva los brazos hacia los lados hasta la altura de los hombros.',
    'Baja de forma controlada sin dejar que las pesas choquen.'
  ],
  array[
    'Encoger los hombros hacia las orejas.',
    'Usar el impulso del cuerpo.',
    'Soltar el peso de golpe.'
  ],
  array[
    'laterales en maquina',
    'maquina de elevaciones laterales',
    'elevaciones laterales sentado en maquina',
    'lateral raise machine',
    'maquina de hombros laterales',
    'maquina de laterales',
    'elevacion lateral en maquina',
    'hombro lateral en maquina',
    'side raise machine',
    'maquina de deltoides lateral',
    'vuelos laterales en maquina',
    'laterales sentado'
  ]
),
(
  'remo-al-menton-mancuernas', 'Remo al mentón con mancuernas',
  array['shoulders', 'traps'], array['biceps'],
  'dumbbells', 'pull', 'intermediate',
  array[
    'De pie, con una mancuerna en cada mano frente a los muslos y las palmas hacia ti.',
    'Sube las mancuernas pegadas al cuerpo llevando los codos hacia los lados, hasta la altura del pecho.',
    'Haz una pausa, baja de forma controlada y no subas por encima de esa altura.',
    'Si notas molestias en los hombros, elige otro ejercicio.'
  ],
  array[
    'Subir los codos por encima de los hombros.',
    'Balancear el tronco.',
    'Usar demasiado peso.'
  ],
  array[
    'remo al menton',
    'remo al menton con pesas',
    'remo vertical',
    'remo vertical con mancuernas',
    'tiron al menton',
    'upright row',
    'dumbbell upright row',
    'remo al pecho de pie',
    'remo alto con mancuernas',
    'remo al cuello',
    'remo vertical con pesas',
    'jalon al menton con mancuernas'
  ]
),
(
  'encogimientos-mancuernas', 'Encogimientos de hombros con mancuernas',
  array['traps'], array['forearms'],
  'dumbbells', 'isolation', 'beginner',
  array[
    'De pie, con una mancuerna en cada mano a los lados del cuerpo y los brazos estirados.',
    'Sube los hombros hacia las orejas en línea recta, sin girarlos.',
    'Haz una pausa breve arriba y baja de forma controlada.'
  ],
  array[
    'Girar los hombros en círculo.',
    'Usar demasiado peso y acortar el recorrido.',
    'Flexionar los codos para ayudarte.'
  ],
  array[
    'encogimientos',
    'encogimientos de hombros',
    'encogimientos de trapecio',
    'encogimientos con mancuernas',
    'shrugs',
    'dumbbell shrugs',
    'shrugs con mancuernas',
    'trapecios con mancuernas',
    'elevaciones de hombros',
    'encogimientos trapecio mancuernas',
    'encogimiento de hombros con pesas',
    'trapecio con mancuernas'
  ]
),
(
  'encogimientos-barra', 'Encogimientos de hombros con barra',
  array['traps'], array['forearms'],
  'barbell', 'isolation', 'intermediate',
  array[
    'De pie, agarra la barra con las manos a la anchura de los hombros, con los brazos estirados frente a los muslos.',
    'Sube los hombros hacia las orejas en línea recta, sin girarlos.',
    'Haz una pausa breve arriba y baja de forma controlada.'
  ],
  array[
    'Girar los hombros en círculo.',
    'Usar demasiado peso y acortar el recorrido.',
    'Echar la cabeza hacia delante.'
  ],
  array[
    'encogimientos con barra',
    'shrugs con barra',
    'barbell shrugs',
    'encogimientos de hombros con barra olimpica',
    'trapecios con barra',
    'encogimiento de trapecio con barra',
    'shrug con barra',
    'elevaciones de hombros con barra',
    'trapecio con barra',
    'encogimientos de trapecio con barra',
    'encogimientos de hombro barra',
    'encogimientos barra'
  ]
),
(
  'flexiones-pike', 'Flexiones pike',
  array['shoulders'], array['triceps', 'chest', 'traps'],
  'bodyweight', 'push', 'intermediate',
  array[
    'Colócate en posición de flexión y acerca los pies a las manos elevando la cadera, formando una V invertida.',
    'Flexiona los codos y baja la cabeza hacia el suelo, entre las manos.',
    'Empuja hacia arriba hasta estirar los brazos manteniendo la cadera alta.'
  ],
  array[
    'Apoyar la cabeza con fuerza en el suelo.',
    'Dejar caer la cadera y convertirla en una flexión normal.',
    'Abrir los codos hacia los lados.'
  ],
  array[
    'flexiones en pica',
    'flexiones pica',
    'flexiones de pica',
    'pike push up',
    'pike pushups',
    'flexiones en v',
    'flexiones en uve',
    'flexiones para hombros',
    'flexiones de hombros',
    'press de hombros con peso corporal',
    'flexiones con cadera elevada',
    'flexiones en v invertida',
    'lagartijas pike'
  ]
),
(
  'rotacion-externa-mancuerna', 'Rotación externa de hombro con mancuerna',
  array['shoulders'], array['upper_back'],
  'dumbbells', 'isolation', 'beginner',
  array[
    'Túmbate de lado con una mancuerna ligera en la mano de arriba, el codo flexionado a 90 grados y pegado al costado.',
    'Mantén el codo pegado al cuerpo y gira el antebrazo hacia arriba, como abriendo una puerta.',
    'Baja de forma controlada. Cambia de lado.'
  ],
  array[
    'Usar demasiado peso: es un ejercicio de control.',
    'Separar el codo del costado.',
    'Mover el tronco para ayudarte.'
  ],
  array[
    'rotacion externa',
    'rotacion externa con mancuerna',
    'rotaciones externas',
    'rotacion externa del hombro',
    'manguito rotador',
    'ejercicio de manguito rotador',
    'external rotation',
    'dumbbell external rotation',
    'side lying external rotation',
    'rotacion externa tumbado',
    'rotacion de hombro con mancuerna',
    'rotadores del hombro',
    'rotacion externa de manguito'
  ]
)
on conflict (slug) do nothing;