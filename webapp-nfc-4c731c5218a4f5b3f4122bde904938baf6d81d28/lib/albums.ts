import { createAdminClient } from "@/lib/supabase/admin";
import type { Album, AlbumWithCount, Media } from "@/lib/types";

export async function getAlbums(spaceId: string): Promise<AlbumWithCount[]> {
  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("albums")
      .select("*, media(count)")
      .eq("space_id", spaceId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((row) => {
      const { media, ...album } = row as typeof row & {
        media: { count: number }[];
      };
      return {
        ...(album as Album),
        media_count: media?.[0]?.count ?? 0,
      };
    });
  } catch (err) {
    console.error("getAlbums:", err);
    return [];
  }
}

export async function getAlbumBySlug(spaceId: string, slug: string) {
  try {
    const admin = createAdminClient();

    const { data: album, error } = await admin
      .from("albums")
      .select("*")
      .eq("space_id", spaceId)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !album) return null;

    const { data: media } = await admin
      .from("media")
      .select("*")
      .eq("album_id", album.id)
      .order("created_at", { ascending: false });

    return { album: album as Album, media: (media ?? []) as Media[] };
  } catch (err) {
    console.error("getAlbumBySlug:", err);
    return null;
  }
}

