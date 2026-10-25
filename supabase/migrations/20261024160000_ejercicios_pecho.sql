-- Migración 0011 (se puede ejecutar más de una vez: ignora los ejercicios que ya existen):
-- biblioteca ampliada, parte 1A: pecho (17 ejercicios nuevos).
-- Contenido propio de NEXORA, orientativo y de carácter general.
-- Requiere haber ejecutado antes la migración 0010.

insert into public.exercises (
  slug, name, primary_muscles, secondary_muscles, equipment,
  movement_pattern, difficulty, instructions, common_mistakes, aliases
) values
(
  'press-banca-inclinado-barra', 'Press de banca inclinado con barra',
  array['chest', 'shoulders'], array['triceps'],
  'barbell', 'push', 'intermediate',
  array[
    'Ajusta el banco con una inclinación de unos 30 grados y túmbate con los ojos bajo la barra.',
    'Junta los omóplatos y llévalos hacia abajo, con los pies firmes en el suelo.',
    'Agarra la barra algo más ancha que los hombros y sácala del soporte con los brazos estirados.',
    'Baja la barra de forma controlada hasta rozar la parte alta del pecho.',
    'Empuja hacia arriba hasta estirar los brazos. Usa topes de seguridad o pide ayuda con cargas exigentes.'
  ],
  array[
    'Inclinar demasiado el banco, de modo que trabajen sobre todo los hombros.',
    'Rebotar la barra contra el pecho.',
    'Despegar los glúteos del banco.'
  ],
  array[
    'press inclinado con barra',
    'press banca inclinado',
    'banca inclinada',
    'press inclinado barra',
    'incline bench press',
    'incline barbell press',
    'press de pecho inclinado con barra',
    'press superior de pecho con barra',
    'pecho alto con barra',
    'press inclinado olimpico',
    'banca inclinada con barra',
    'press de banca inclinada'
  ]
),
(
  'press-banca-declinado-barra', 'Press de banca declinado con barra',
  array['chest'], array['triceps', 'shoulders'],
  'barbell', 'push', 'intermediate',
  array[
    'Túmbate en un banco declinado y sujeta los pies bajo los rodillos de apoyo.',
    'Agarra la barra algo más ancha que los hombros y sácala del soporte con los brazos estirados.',
    'Baja la barra de forma controlada hasta la parte baja del pecho.',
    'Empuja hacia arriba sin despegar la espalda del banco.',
    'Usa topes de seguridad o entrena acompañado: en esta postura es más difícil soltar la barra.'
  ],
  array[
    'Bajar la barra hacia el cuello o el abdomen en lugar de la parte baja del pecho.',
    'Rebotar la barra contra el pecho.',
    'Usar demasiado peso sin nadie que te ayude.'
  ],
  array[
    'press declinado con barra',
    'banca declinada',
    'press banca declinado',
    'decline bench press',
    'decline barbell press',
    'press de pecho declinado',
    'pecho bajo con barra',
    'press declinado',
    'press de banca declinada',
    'banca declinada con barra',
    'press inferior de pecho'
  ]
),
(
  'press-banca-agarre-cerrado', 'Press de banca con agarre cerrado',
  array['triceps', 'chest'], array['shoulders'],
  'barbell', 'push', 'intermediate',
  array[
    'Túmbate en el banco plano y agarra la barra con las manos a la anchura de los hombros, nunca más cerradas.',
    'Saca la barra del soporte con los brazos estirados y los omóplatos juntos.',
    'Baja la barra de forma controlada, con los codos cerca del cuerpo, hasta rozar la parte baja del pecho.',
    'Empuja hacia arriba hasta estirar los brazos.'
  ],
  array[
    'Juntar demasiado las manos, lo que fuerza las muñecas.',
    'Abrir los codos hacia los lados.',
    'Despegar los glúteos del banco.'
  ],
  array[
    'press banca agarre cerrado',
    'press cerrado',
    'press de banca agarre estrecho',
    'press agarre estrecho',
    'close grip bench press',
    'cgbp',
    'banca agarre cerrado',
    'press de triceps con barra',
    'press banca cerrado',
    'press de banca con agarre estrecho',
    'press de banca cerrado',
    'press cerrado de triceps'
  ]
),
(
  'aperturas-con-mancuernas', 'Aperturas con mancuernas en banco plano',
  array['chest'], array['shoulders'],
  'dumbbells', 'isolation', 'intermediate',
  array[
    'Túmbate en el banco plano con una mancuerna en cada mano, los brazos estirados sobre el pecho y las palmas mirándose.',
    'Con los codos ligeramente flexionados, abre los brazos hacia los lados en un arco amplio.',
    'Baja hasta notar un estiramiento cómodo en el pecho, sin que los codos pasen mucho por debajo del banco.',
    'Vuelve a la posición inicial juntando las mancuernas con el mismo arco.'
  ],
  array[
    'Usar demasiado peso y convertir el ejercicio en un press.',
    'Bajar tanto los brazos que el hombro queda forzado.',
    'Estirar del todo los codos.'
  ],
  array[
    'aperturas planas',
    'aperturas con mancuernas',
    'aperturas de pecho con mancuernas',
    'aperturas banco plano',
    'flyes con mancuernas',
    'dumbbell fly',
    'dumbbell flyes',
    'chest fly con mancuernas',
    'aperturas mancuernas',
    'cruces con mancuernas',
    'aperturas de pecho',
    'aperturas con pesas',
    'fly plano'
  ]
),
(
  'aperturas-inclinadas-mancuernas', 'Aperturas inclinadas con mancuernas',
  array['chest', 'shoulders'], array[]::text[],
  'dumbbells', 'isolation', 'intermediate',
  array[
    'Ajusta el banco con una inclinación suave, de unos 30 grados, y túmbate con una mancuerna en cada mano sobre la parte alta del pecho.',
    'Con los codos ligeramente flexionados, abre los brazos hacia los lados en un arco.',
    'Baja hasta notar un estiramiento cómodo en el pecho.',
    'Vuelve juntando las mancuernas sobre el pecho sin que choquen.'
  ],
  array[
    'Inclinar demasiado el banco.',
    'Usar demasiado peso y perder el arco del movimiento.',
    'Bajar de golpe sin control.'
  ],
  array[
    'aperturas inclinadas',
    'aperturas en banco inclinado',
    'aperturas inclinado mancuernas',
    'incline dumbbell fly',
    'incline fly',
    'flyes inclinados',
    'aperturas pecho superior',
    'aperturas pecho alto',
    'cruces inclinados con mancuernas',
    'aperturas con mancuernas inclinadas',
    'fly inclinado',
    'aperturas de pecho inclinadas'
  ]
),
(
  'press-pecho-maquina', 'Press de pecho en máquina',
  array['chest'], array['triceps', 'shoulders'],
  'machines', 'push', 'beginner',
  array[
    'Ajusta el asiento para que las asas queden a la altura del pecho y apoya bien la espalda en el respaldo.',
    'Agarra las asas con los codos ligeramente por debajo de los hombros.',
    'Empuja hacia delante hasta estirar los brazos sin bloquear los codos con fuerza.',
    'Vuelve de forma controlada hasta notar un estiramiento suave en el pecho.'
  ],
  array[
    'Despegar la espalda del respaldo.',
    'Encoger los hombros al empujar.',
    'Soltar el peso de golpe al volver.'
  ],
  array[
    'press pecho maquina',
    'press de pecho sentado',
    'press sentado en maquina',
    'chest press',
    'chest press machine',
    'maquina de pecho',
    'press de pecho con maquina',
    'maquina de press de pecho',
    'press de banca en maquina',
    'press pecho sentado',
    'press horizontal en maquina',
    'empuje de pecho en maquina',
    'maquina press pecho'
  ]
),
(
  'press-inclinado-maquina', 'Press inclinado en máquina',
  array['chest', 'shoulders'], array['triceps'],
  'machines', 'push', 'beginner',
  array[
    'Ajusta el asiento para que las asas queden a la altura de la parte alta del pecho y apoya la espalda.',
    'Empuja las asas hacia delante y ligeramente hacia arriba hasta estirar los brazos.',
    'Vuelve de forma controlada sin dejar que las pesas choquen entre sí.'
  ],
  array[
    'Subir los hombros hacia las orejas.',
    'Despegar la espalda del respaldo.',
    'Bloquear los codos con violencia.'
  ],
  array[
    'press inclinado maquina',
    'press de pecho inclinado en maquina',
    'incline chest press',
    'incline press machine',
    'maquina de press inclinado',
    'press inclinado sentado',
    'press superior en maquina',
    'press de pecho alto en maquina',
    'maquina inclinada de pecho',
    'press inclinado en la maquina',
    'press inclinado guiado',
    'maquina press inclinado'
  ]
),
(
  'cruces-en-polea-alta', 'Cruces en polea alta',
  array['chest'], array['shoulders'],
  'machines', 'isolation', 'intermediate',
  array[
    'Coloca las poleas en la posición alta y agarra un asa en cada mano, de pie en el centro.',
    'Da un paso al frente con el torso ligeramente inclinado y los codos algo flexionados.',
    'Lleva las manos hacia delante y abajo hasta juntarlas frente al abdomen, como si abrazaras.',
    'Vuelve de forma controlada hasta notar un estiramiento en el pecho, sin llevar los codos por detrás del torso.'
  ],
  array[
    'Usar demasiado peso y balancear el tronco.',
    'Estirar del todo los codos.',
    'Forzar el estiramiento al final del recorrido.'
  ],
  array[
    'cruces de poleas',
    'cruce de poleas',
    'cruces polea alta',
    'cable crossover',
    'cable cross over',
    'cruces en polea',
    'crossover',
    'aperturas en polea alta',
    'cruces con poleas',
    'aperturas con poleas',
    'polea cruzada de pecho',
    'cruces de polea alta',
    'poleas cruzadas'
  ]
),
(
  'cruces-en-polea-baja', 'Cruces en polea baja',
  array['chest'], array['shoulders'],
  'machines', 'isolation', 'intermediate',
  array[
    'Coloca las poleas en la posición baja y agarra un asa en cada mano, de pie en el centro.',
    'Da un paso al frente con el torso erguido y los codos ligeramente flexionados.',
    'Lleva las manos hacia delante y arriba hasta juntarlas a la altura del pecho.',
    'Vuelve de forma controlada hasta notar un estiramiento suave en el pecho.'
  ],
  array[
    'Subir los hombros hacia las orejas.',
    'Usar el impulso del cuerpo para levantar el peso.',
    'Estirar del todo los codos.'
  ],
  array[
    'cruces polea baja',
    'cruces de polea baja',
    'cable crossover bajo',
    'low cable fly',
    'low to high cable fly',
    'aperturas en polea baja',
    'cruces de poleas bajas',
    'cruces de abajo arriba',
    'aperturas de polea baja',
    'cruce de poleas desde abajo',
    'pecho alto en polea',
    'cruces ascendentes en polea'
  ]
),
(
  'press-pecho-polea-de-pie', 'Press de pecho en polea de pie',
  array['chest'], array['triceps', 'shoulders', 'abs'],
  'machines', 'push', 'intermediate',
  array[
    'Coloca las poleas a la altura del pecho, agarra un asa en cada mano y da un paso al frente con un pie por delante del otro.',
    'Mantén el abdomen firme y los codos a la altura de las manos.',
    'Empuja las manos hacia delante hasta estirar los brazos.',
    'Vuelve de forma controlada sin perder la postura del tronco.'
  ],
  array[
    'Inclinar el tronco hacia delante para empujar.',
    'Usar demasiado peso y perder el equilibrio.',
    'Subir los hombros.'
  ],
  array[
    'press de pecho en polea',
    'press pecho polea',
    'press en poleas de pie',
    'press de poleas',
    'standing cable chest press',
    'cable chest press',
    'press de pecho con poleas',
    'empuje de pecho en polea',
    'press pecho de pie en polea',
    'press con poleas',
    'press de pecho cable',
    'press de pecho de pie'
  ]
),
(
  'flexiones-inclinadas', 'Flexiones inclinadas con las manos elevadas',
  array['chest'], array['triceps', 'shoulders', 'abs'],
  'bodyweight', 'push', 'beginner',
  array[
    'Apoya las manos en un banco, una silla estable o una barra a la altura de la cadera, algo más separadas que los hombros.',
    'Estira el cuerpo en línea recta de la cabeza a los talones, con el abdomen y los glúteos apretados.',
    'Baja el pecho hacia el apoyo con los codos a unos 45 grados del tronco.',
    'Empuja hasta estirar los brazos. Cuanto más alto el apoyo, más fácil es el ejercicio.'
  ],
  array[
    'Dejar caer la cadera.',
    'Apoyarte en algo que se mueve.',
    'Abrir los codos hacia los lados.'
  ],
  array[
    'flexiones con manos elevadas',
    'flexiones en banco',
    'flexiones con las manos en el banco',
    'flexiones inclinadas',
    'push ups inclinados',
    'incline push up',
    'incline pushups',
    'flexiones apoyando las manos en una silla',
    'flexiones en pared',
    'flexiones en escalon',
    'flexiones con apoyo elevado',
    'lagartijas inclinadas'
  ]
),
(
  'flexiones-declinadas', 'Flexiones declinadas con los pies elevados',
  array['chest', 'shoulders'], array['triceps', 'abs'],
  'bodyweight', 'push', 'intermediate',
  array[
    'Apoya los pies sobre un banco o escalón y las manos en el suelo, algo más separadas que los hombros.',
    'Mantén el cuerpo en línea recta, con el abdomen y los glúteos apretados.',
    'Baja el pecho hacia el suelo con los codos a unos 45 grados del tronco.',
    'Empuja hasta estirar los brazos sin hundir la cadera.'
  ],
  array[
    'Hundir la cadera o levantarla demasiado.',
    'Elevar los pies demasiado, lo que sobrecarga los hombros.',
    'Adelantar la cabeza en lugar de mantener el cuello alineado.'
  ],
  array[
    'flexiones con pies elevados',
    'flexiones con los pies en el banco',
    'flexiones declinadas',
    'decline push up',
    'decline pushups',
    'push ups declinados',
    'flexiones pies arriba',
    'flexiones con pies en silla',
    'flexiones para pecho alto',
    'flexiones con apoyo de pies elevado',
    'lagartijas declinadas',
    'flexiones dificiles'
  ]
),
(
  'flexiones-diamante', 'Flexiones diamante',
  array['triceps', 'chest'], array['shoulders'],
  'bodyweight', 'push', 'intermediate',
  array[
    'Apoya las manos juntas bajo el pecho, formando un rombo con los pulgares y los índices.',
    'Mantén el cuerpo en línea recta, con el abdomen y los glúteos apretados.',
    'Baja el pecho hacia las manos con los codos cerca del cuerpo.',
    'Empuja hasta estirar los brazos. Si te duelen las muñecas, separa un poco las manos.'
  ],
  array[
    'Abrir los codos hacia los lados.',
    'Dejar caer la cadera.',
    'Forzar las muñecas con las manos demasiado juntas.'
  ],
  array[
    'flexiones de diamante',
    'flexiones cerradas',
    'flexiones agarre cerrado',
    'flexiones para triceps',
    'diamond push up',
    'diamond pushups',
    'close grip push up',
    'push ups diamante',
    'flexiones con manos juntas',
    'flexiones en diamante',
    'lagartijas diamante',
    'flexiones triangulo',
    'flexiones en triangulo'
  ]
),
(
  'flexiones-con-rodillas', 'Flexiones con las rodillas apoyadas',
  array['chest'], array['triceps', 'shoulders', 'abs'],
  'bodyweight', 'push', 'beginner',
  array[
    'Apoya las manos en el suelo algo más separadas que los hombros y las rodillas en el suelo, con el cuerpo recto de las rodillas a la cabeza.',
    'Aprieta el abdomen y los glúteos.',
    'Baja el pecho hacia el suelo con los codos a unos 45 grados del tronco.',
    'Empuja el suelo hasta estirar los brazos.'
  ],
  array[
    'Sacar la cadera hacia atrás.',
    'Adelantar la cabeza.',
    'Abrir los codos hacia los lados.'
  ],
  array[
    'flexiones de rodillas',
    'flexiones apoyando rodillas',
    'flexiones faciles',
    'flexiones para principiantes',
    'knee push up',
    'knee pushups',
    'modified push up',
    'push ups de rodillas',
    'flexiones modificadas',
    'lagartijas de rodillas',
    'flexiones con rodillas',
    'primeras flexiones',
    'flexiones en rodillas'
  ]
),
(
  'press-suelo-mancuernas', 'Press de suelo con mancuernas',
  array['chest', 'triceps'], array['shoulders'],
  'dumbbells', 'push', 'beginner',
  array[
    'Túmbate en el suelo boca arriba con las rodillas flexionadas y una mancuerna en cada mano.',
    'Empieza con los codos apoyados en el suelo y las mancuernas a la altura del pecho.',
    'Empuja hacia arriba hasta estirar los brazos.',
    'Baja de forma controlada hasta que los codos rocen el suelo, sin dejarlos caer.'
  ],
  array[
    'Dejar caer los codos contra el suelo.',
    'Arquear la zona lumbar.',
    'Subir una mancuerna antes que la otra.'
  ],
  array[
    'floor press',
    'floor press con mancuernas',
    'press en el suelo',
    'press de pecho en el suelo',
    'press suelo',
    'press de pecho en suelo con mancuernas',
    'press de banca en el suelo',
    'press de mancuernas en el suelo',
    'press de pecho sin banco',
    'press de pecho en casa con mancuernas',
    'press tumbado en el suelo',
    'press de pecho tumbado'
  ]
),
(
  'pullover-con-mancuerna', 'Pullover con mancuerna',
  array['chest', 'lats'], array['triceps'],
  'dumbbells', 'isolation', 'intermediate',
  array[
    'Túmbate en un banco con los hombros apoyados y sujeta una mancuerna con las dos manos sobre el pecho, con los brazos casi estirados.',
    'Lleva la mancuerna hacia atrás por encima de la cabeza en un arco amplio, con los codos ligeramente flexionados.',
    'Baja hasta notar un estiramiento cómodo, sin arquear mucho la espalda.',
    'Vuelve a la posición inicial siguiendo el mismo arco.'
  ],
  array[
    'Usar demasiado peso.',
    'Arquear la zona lumbar al bajar.',
    'Flexionar y estirar los codos en lugar de mover el brazo en arco.'
  ],
  array[
    'pullover',
    'pullover con mancuerna en banco',
    'pull over con mancuerna',
    'pullover pecho',
    'pullover dorsal',
    'dumbbell pullover',
    'pullover en banco',
    'pullover mancuerna',
    'pullover con pesa',
    'pullover tumbado',
    'pull over',
    'pullover para pecho y dorsal'
  ]
),
(
  'fondos-en-paralelas', 'Fondos en paralelas',
  array['chest', 'triceps'], array['shoulders'],
  'bodyweight', 'push', 'advanced',
  array[
    'Agarra las barras paralelas y sube hasta tener los brazos estirados, con el cuerpo ligeramente inclinado hacia delante.',
    'Baja de forma controlada flexionando los codos hasta que los brazos formen unos 90 grados.',
    'Empuja hacia arriba hasta estirar los brazos sin encoger los hombros.',
    'Si todavía no puedes hacerlos, empieza con una máquina de fondos asistidos o con fondos en banco.'
  ],
  array[
    'Bajar demasiado, lo que sobrecarga los hombros.',
    'Encoger los hombros hacia las orejas.',
    'Balancearse para ayudarte a subir.'
  ],
  array[
    'fondos',
    'fondos en barras paralelas',
    'fondos de pecho',
    'fondos para pecho',
    'fondos de triceps en paralelas',
    'dips',
    'chest dips',
    'parallel bar dips',
    'fondos en barras',
    'fondos en paralelas para pecho',
    'fondos de brazos',
    'fondos en paralela',
    'dips de pecho'
  ]
)
on conflict (slug) do nothing;