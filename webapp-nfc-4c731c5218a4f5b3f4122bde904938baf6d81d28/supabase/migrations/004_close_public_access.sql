-- Album NFC — cerrar el acceso público a la base de datos
-- EJECUTAR SOLO DESPUÉS de desplegar el código nuevo (rutas /s/[código]).
-- Si lo corres antes, la versión anterior de la web deja de mostrar álbumes.
--
-- Después de esto, el navegador ya no puede leer ni escribir `albums` ni `media`:
-- todo pasa por el servidor, que usa la service role key y verifica el espacio.

-- albums
drop policy if exists "albums_select_anon" on public.albums;
drop policy if exists "albums_insert_anon" on public.albums;
drop policy if exists "albums_update_anon" on public.albums;
drop policy if exists "albums_delete_anon" on public.albums;

-- media
drop policy if exists "media_select_anon" on public.media;
drop policy if exists "media_insert_anon" on public.media;
drop policy if exists "media_update_anon" on public.media;
drop policy if exists "media_delete_anon" on public.media;

-- Storage: nadie puede listar, subir ni borrar desde el navegador.
-- Las fotos siguen viéndose por su URL pública (el bucket es público) y las
-- subidas se hacen con URLs firmadas que genera el servidor.
drop policy if exists "media_bucket_select" on storage.objects;
drop policy if exists "media_bucket_insert" on storage.objects;
drop policy if exists "media_bucket_update" on storage.objects;
drop policy if exists "media_bucket_delete" on storage.objects;
