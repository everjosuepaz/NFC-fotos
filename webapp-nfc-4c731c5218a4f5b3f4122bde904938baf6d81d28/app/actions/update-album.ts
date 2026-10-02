"use server";

import { revalidatePath } from "next/cache";
import { isValidAlbumEmoji } from "@/lib/album-emojis";
import { COUNTRIES } from "@/lib/countries";
import { createClient } from "@/lib/supabase/server";

export type UpdateAlbumInput = {
  albumId: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  /** Código ISO del país, o "" si el álbum no tiene país. */
  countryCode: string;
};

export type UpdateAlbumResult = { ok: true } | { ok: false; error: string };

const NAME_MAX = 80;
const DESCRIPTION_MAX = 280;

export async function updateAlbum(
  input: UpdateAlbumInput,
): Promise<UpdateAlbumResult> {
  const name = input.name.trim();
  const description = input.description.trim();

  if (name.length === 0) {
    return { ok: false, error: "Ponle un nombre al álbum." };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, error: `El nombre admite hasta ${NAME_MAX} caracteres.` };
  }
  if (description.length > DESCRIPTION_MAX) {
    return {
      ok: false,
      error: `La descripción admite hasta ${DESCRIPTION_MAX} caracteres.`,
    };
  }
  if (!isValidAlbumEmoji(input.emoji)) {
    return { ok: false, error: "Elige un emoji de la lista." };
  }

  let countryCode: string | null = null;
  let countryName: string | null = null;
  if (input.countryCode) {
    const country = COUNTRIES.find((c) => c.code === input.countryCode);
    if (!country) {
      return { ok: false, error: "País no válido." };
    }
    countryCode = country.code;
    countryName = country.name;
  }

  try {
    const supabase = await createClient();

    // El slug no cambia al renombrar: así los enlaces y el NFC siguen funcionando.
    const { error } = await supabase
      .from("albums")
      .update({
        name,
        emoji: input.emoji,
        description: description.length > 0 ? description : null,
        country_code: countryCode,
        country_name: countryName,
      })
      .eq("id", input.albumId);

    if (error) {
      return { ok: false, error: "No se pudo guardar. Inténtalo de nuevo." };
    }
  } catch {
    return { ok: false, error: "No se pudo conectar con la base de datos." };
  }

  revalidatePath(`/album/${input.slug}`);
  revalidatePath("/app");
  return { ok: true };
}
