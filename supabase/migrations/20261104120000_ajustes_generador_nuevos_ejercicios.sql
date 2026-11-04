-- Migración 0015: ajustes del generador tras los lotes de ejercicios nuevos

-- La "plancha con flexión" es de empuje con tríceps como músculo principal:
-- el generador la elegiría como ejercicio de tríceps. Solo a mano.
update public.exercises
set use_in_generator = false
where slug = 'plancha-con-flexion';