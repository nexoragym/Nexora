-- Migración 0013 (se puede ejecutar más de una vez sin errores):
-- imágenes y vídeos de los ejercicios (almacenamiento en Supabase Storage)

-- 1. Cada ejercicio guarda la ruta de su imagen y de su vídeo
alter table public.exercises
  add column if not exists image_path text
    check (image_path is null or char_length(image_path) <= 200),
  add column if not exists video_path text
    check (video_path is null or char_length(video_path) <= 200);

-- 2. Carpeta pública de archivos (solo se admiten estos formatos y hasta 10 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exercise-media',
  'exercise-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 3. Quién puede qué: todo el mundo ve los archivos; solo el superadmin los sube, cambia o borra
drop policy if exists "exercise_media_select" on storage.objects;
drop policy if exists "exercise_media_insert" on storage.objects;
drop policy if exists "exercise_media_update" on storage.objects;
drop policy if exists "exercise_media_delete" on storage.objects;

create policy "exercise_media_select"
  on storage.objects
  for select
  to public
  using (bucket_id = 'exercise-media');

create policy "exercise_media_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'exercise-media' and (select public.is_superadmin()));

create policy "exercise_media_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'exercise-media' and (select public.is_superadmin()))
  with check (bucket_id = 'exercise-media' and (select public.is_superadmin()));

create policy "exercise_media_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'exercise-media' and (select public.is_superadmin()));