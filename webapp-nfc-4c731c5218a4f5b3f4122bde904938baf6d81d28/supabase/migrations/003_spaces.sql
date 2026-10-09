-- Album NFC — espacios privados por sticker
-- Aplicar en Supabase: Dashboard → SQL Editor → New query → pegar → Run
-- Es seguro correrlo aunque ya hayas creado la tabla `spaces` a mano:
-- solo agrega lo que falte.

create extension if not exists "pgcrypto";

-- Un "espacio" = un sticker = un cliente.
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default encode(gen_random_bytes(9), 'hex'),
  name text,
  created_at timestamptz not null default now()
);

-- Sin políticas a propósito: con la clave pública nadie puede leer esta tabla.
-- Solo el servidor (service role key) la usa.
alter table public.spaces enable row level security;

-- Cada álbum pertenece a un espacio.
alter table public.albums
  add column if not exists space_id uuid references public.spaces (id) on delete cascade;

create index if not exists albums_space_id_idx on public.albums (space_id);

-- El slug ya no es único en toda la app, sino dentro de cada espacio
-- (dos clientes pueden tener un álbum llamado "salida-al-parque").
alter table public.albums drop constraint if exists albums_slug_key;
create unique index if not exists albums_space_slug_idx
  on public.albums (space_id, slug);

-- Límites del bucket de fotos: 10 MB y solo imágenes.
update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/gif'
  ]
where id = 'media';
