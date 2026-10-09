-- Album NFC — textos editables por el usuario
-- Aplicar en Supabase: Dashboard → SQL Editor → New query → pegar → Run
-- No toca los álbumes existentes.

-- El país pasa a ser opcional (un álbum puede ser "Salida al parque").
alter table public.albums alter column country_code drop not null;
alter table public.albums alter column country_name drop not null;

-- Descripción corta opcional.
alter table public.albums add column if not exists description text;

-- Límites de longitud (evita textos enormes).
alter table public.albums drop constraint if exists albums_name_len;
alter table public.albums add constraint albums_name_len
  check (char_length(btrim(name)) between 1 and 80);

alter table public.albums drop constraint if exists albums_description_len;
alter table public.albums add constraint albums_description_len
  check (description is null or char_length(description) <= 280);
