"use server";

import { revalidatePath } from "next/cache";
import { isValidAlbumEmoji } from "@/lib/album-emojis";
import { COUNTRIES, countryNameFromCode } from "@/lib/countries";
import { requireAlbumInSpace } from "@/lib/space";

export type UpdateAlbumInput = {
  code: string;
  albumId: string;
  name: string;
  emoji: string;
  description: string;
  countryCode: string;
};

export type UpdateAlbumResult = { ok: true } | { ok: false; error: string };

const MAX_NAME = 80;
const MAX_DESCRIPTION = 280;

export async function updateAlbum(
  input: UpdateAlbumInput,
): Promise<UpdateAlbumResult> {
  const name = input.name.trim();
  const description = input.description.trim();

  if (!name) return { ok: false, error: "Ponle un nombre al álbum." };
  if (name.length > MAX_NAME) {
    return { ok: false, error: `El nombre admite máximo ${MAX_NAME} caracteres.` };
  }
  if (description.length > MAX_DESCRIPTION) {
    return {
      ok: false,
      error: `La descripción admite máximo ${MAX_DESCRIPTION} caracteres.`,
    };
  }
  if (!isValidAlbumEmoji(input.emoji)) {
    return { ok: false, error: "Elige un emoji de la lista." };
  }

  // País opcional: vacío o código fuera de la lista = sin país.
  const countryCode = COUNTRIES.some((c) => c.code === input.countryCode)
    ? input.countryCode
    : null;
  const countryName = countryCode ? countryNameFromCode(countryCode) : null;

  try {
    const { admin, space, album } = await requireAlbumInSpace(
      input.code,
      input.albumId,
    );

    // El slug NO se cambia a propósito: así el enlace del álbum no se rompe.
    const { error } = await admin
      .from("albums")
      .update({
        name,
        emoji: input.emoji,
        description: description || null,
        country_code: countryCode,
        country_name: countryName,
      })
      .eq("id", album.id);

    if (error) return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };

    revalidatePath(`/s/${space.code}`);
    revalidatePath(`/s/${space.code}/album/${album.slug}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  }
}
