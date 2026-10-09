"use server";

import { revalidatePath } from "next/cache";
import { requireAlbumInSpace } from "@/lib/space";
import {
  ACCEPTED_IMAGE_TYPES,
  MEDIA_BUCKET,
  extensionFromMimeType,
} from "@/lib/storage";

function revalidateAlbum(code: string, slug: string) {
  revalidatePath(`/s/${code}`);
  revalidatePath(`/s/${code}/album/${slug}`);
}

// Paso 1 de la subida: el servidor verifica el espacio y entrega una URL
// firmada de un solo uso. El navegador sube la foto directo a Storage con ella,
// sin necesitar permisos de escritura abiertos.
export async function createUploadUrl(
  code: string,
  albumId: string,
  mimeType: string,
): Promise<{ path: string; token: string }> {
  if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error("Tipo de archivo no permitido.");
  }

  const { admin, album } = await requireAlbumInSpace(code, albumId);

  const path = `${album.id}/${crypto.randomUUID()}.${extensionFromMimeType(mimeType)}`;
  const { data, error } = await admin.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("No se pudo preparar la subida.");
  }

  return { path, token: data.token };
}

// Paso 2: registrar la foto en la base de datos una vez subida.
export async function registerMedia(
  code: string,
  albumId: string,
  storagePath: string,
  mimeType: string,
) {
  const { admin, space, album } = await requireAlbumInSpace(code, albumId);

  // La ruta debe pertenecer a este álbum: evita registrar archivos ajenos.
  if (!storagePath.startsWith(`${album.id}/`) || storagePath.includes("..")) {
    throw new Error("Ruta de foto no válida.");
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error("Tipo de archivo no permitido.");
  }

  const { error } = await admin.from("media").insert({
    album_id: album.id,
    storage_path: storagePath,
    mime_type: mimeType,
  });

  if (error) {
    throw new Error("No se pudo guardar la foto.");
  }

  if (!album.cover_path) {
    await admin
      .from("albums")
      .update({ cover_path: storagePath })
      .eq("id", album.id);
  }

  revalidateAlbum(space.code, album.slug);
}

export async function setAlbumCover(
  code: string,
  albumId: string,
  storagePath: string,
) {
  const { admin, space, album } = await requireAlbumInSpace(code, albumId);

  // Solo se puede poner como portada una foto de este mismo álbum.
  const { data: photo } = await admin
    .from("media")
    .select("id")
    .eq("album_id", album.id)
    .eq("storage_path", storagePath)
    .maybeSingle();

  if (!photo) {
    throw new Error("Esa foto no pertenece al álbum.");
  }

  const { error } = await admin
    .from("albums")
    .update({ cover_path: storagePath })
    .eq("id", album.id);

  if (error) {
    throw new Error("No se pudo actualizar la portada.");
  }

  revalidateAlbum(space.code, album.slug);
}

export async function deleteMedia(
  code: string,
  albumId: string,
  mediaId: string,
) {
  const { admin, space, album } = await requireAlbumInSpace(code, albumId);

  // La ruta se lee de la base de datos, no se confía en lo que manda el navegador.
  const { data: photo } = await admin
    .from("media")
    .select("id, storage_path")
    .eq("id", mediaId)
    .eq("album_id", album.id)
    .maybeSingle();

  if (!photo) return;

  await admin.storage.from(MEDIA_BUCKET).remove([photo.storage_path]);
  await admin.from("media").delete().eq("id", photo.id);

  if (album.cover_path === photo.storage_path) {
    const { data: nextMedia } = await admin
      .from("media")
      .select("storage_path")
      .eq("album_id", album.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    await admin
      .from("albums")
      .update({ cover_path: nextMedia?.storage_path ?? null })
      .eq("id", album.id);
  }

  revalidateAlbum(space.code, album.slug);
}
