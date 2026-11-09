-- Migración 0019: el perfil se crea también cuando el nombre no viene del registro
-- (por ejemplo, al entrar con Google)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  v_name := left(
    btrim(
      regexp_replace(
        coalesce(
          nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
          nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
          nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
          nullif(split_part(coalesce(new.email, ''), '@', 1), '')
        ),
        '\s+', ' ', 'g'
      )
    ),
    50
  );

  if v_name is null or char_length(v_name) < 1 then
    v_name := 'Atleta';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, v_name)
  on conflict (id) do nothing;

  return new;
end;
$$;