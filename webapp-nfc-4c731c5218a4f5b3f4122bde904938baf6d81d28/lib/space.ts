import { createAdminClient } from "@/lib/supabase/admin";

export type Space = {
  id: string;
  code: string;
  name: string | null;
};

// El código del sticker: letras, números, guion y guion bajo.
const CODE_RE = /^[A-Za-z0-9_-]{8,64}$/;

export async function getSpaceByCode(code: string): Promise<Space | null> {
  if (!CODE_RE.test(code)) return null;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("spaces")
      .select("id, code, name")
      .eq("code", code)
      .maybeSingle();

    return (data as Space | null) ?? null;
  } catch (err) {
    console.error("getSpaceByCode:", err);
    return null;
  }
}

export async function requireSpace(code: string): Promise<Space> {
  const space = await getSpaceByCode(code);
  if (!space) throw new Error("Espacio no válido.");
  return space;
}

type AlbumRef = {
  id: string;
  slug: string;
  cover_path: string | null;
};

// Verifica que el álbum exista Y pertenezca al espacio del código.
// Toda acción que modifique un álbum o sus fotos pasa por aquí.
export async function requireAlbumInSpace(code: string, albumId: string) {
  const space = await requireSpace(code);
  const admin = createAdminClient();

  const { data } = await admin
    .from("albums")
    .select("id, slug, cover_path")
    .eq("id", albumId)
    .eq("space_id", space.id)
    .maybeSingle();

  if (!data) throw new Error("Álbum no encontrado.");

  return { admin, space, album: data as AlbumRef };
}
