"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_ALBUM_EMOJI, isValidAlbumEmoji } from "@/lib/album-emojis";
import { COUNTRIES, countryNameFromCode } from "@/lib/countries";
import { randomSuffix, slugify } from "@/lib/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAlbumInSpace, getSpaceByCode } from "@/lib/space";
import { MEDIA_BUCKET } from "@/lib/storage";

export type CreateAlbumState = {
  error: string | null;
};

export async function createAlbum(
  _prevState: CreateAlbumState,
  formData: FormData,
): Promise<CreateAlbumState> {
  const spaceCode = String(formData.get("space_code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const countryInput = String(formData.get("country_code") ?? "").trim();
  const emojiInput = String(formData.get("emoji") ?? "").trim();

  const space = await getSpaceByCode(spaceCode);
  if (!space) {
    return { error: "Este espacio no existe. Escanea tu pegatina de nuevo." };
  }
  if (!name) {
    return { error: "Ponle un nombre al álbum." };
  }
  if (!emojiInput) {
    return { error: "Elige un emoji para el álbum." };
  }

  const emoji = isValidAlbumEmoji(emojiInput) ? emojiInput : DEFAULT_ALBUM_EMOJI;

  // El país es opcional: solo se guarda si es un código de la lista.
  const countryCode = COUNTRIES.some((c) => c.code === countryInput)
    ? countryInput
    : null;
  const countryName = countryCode ? countryNameFromCode(countryCode) : null;

  const baseSlug = slugify(name) || "album";

  const admin = createAdminClient();

  let slug = baseSlug;
  let attempt = 0;
  let insertedSlug: string | null = null;

  while (attempt < 5 && !insertedSlug) {
    const { error } = await admin.from("albums").insert({
      space_id: space.id,
      name,
      emoji,
      country_code: countryCode,
      country_name: countryName,
      slug,
    });

    if (!error) {
      insertedSlug = slug;
      break;
    }

    if (error.code === "23505") {
      attempt += 1;
      slug = `${baseSlug}-${randomSuffix()}`;
      continue;
    }

    return { error: "No se pudo crear el álbum. Inténtalo de nuevo." };
  }

  if (!insertedSlug) {
    return { error: "No se pudo crear el álbum. Inténtalo de nuevo." };
  }

  revalidatePath(`/s/${space.code}`);
  redirect(`/s/${space.code}/album/${insertedSlug}`);
}

export async function deleteAlbum(code: string, albumId: string) {
  const { admin, space, album } = await requireAlbumInSpace(code, albumId);

  const { data: mediaRows } = await admin
    .from("media")
    .select("storage_path")
    .eq("album_id", album.id);

  if (mediaRows && mediaRows.length > 0) {
    await admin.storage
      .from(MEDIA_BUCKET)
      .remove(mediaRows.map((m: { storage_path: string }) => m.storage_path));
  }

  await admin.from("albums").delete().eq("id", album.id);

  revalidatePath(`/s/${space.code}`);
  revalidatePath(`/s/${space.code}/album/${album.slug}`);
  redirect(`/s/${space.code}`);
}
