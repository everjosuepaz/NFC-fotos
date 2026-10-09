import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumWelcome } from "@/components/album-welcome";
import { BrandLockup } from "@/components/brand-lockup";
import { DeleteAlbumButton } from "@/components/delete-album-button";
import { EditAlbumButton } from "@/components/edit-album-button";
import { PhotoGrid } from "@/components/photo-grid";
import { UploadButton } from "@/components/upload-button";
import { getAlbumBySlug } from "@/lib/albums";
import { getSpaceByCode } from "@/lib/space";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ code: string; slug: string }>;
}) {
  const { code, slug } = await params;
  const space = await getSpaceByCode(code);

  if (!space) {
    notFound();
  }

  const result = await getAlbumBySlug(space.id, slug);

  if (!result) {
    notFound();
  }

  const { album, media } = result;
  const homeHref = `/s/${space.code}`;

  return (
    <>
      <AlbumWelcome
        slug={`${space.code}/${album.slug}`}
        name={album.name}
        emoji={album.emoji}
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:px-8 sm:pt-16">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={homeHref}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-surface-border bg-blanco px-4 text-sm font-medium text-foreground shadow-sm shadow-piedra/5 transition-transform duration-150 hover:border-tierra/40 active:scale-95"
            >
              <span aria-hidden>←</span>
              Todos los álbumes
            </Link>
            <BrandLockup size="sm" href={homeHref} className="hidden sm:inline-flex" />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bosque">
                {album.emoji} {album.country_name ?? "Álbum"}
              </p>
              <h1 className="mt-2 break-words text-[clamp(1.75rem,6vw,3rem)] font-semibold leading-tight text-foreground">
                {album.name}
              </h1>
              {album.description ? (
                <p className="mt-2 max-w-xl break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {album.description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <EditAlbumButton code={space.code} album={album} />
              <DeleteAlbumButton code={space.code} albumId={album.id} />
            </div>
          </div>
        </div>

        <PhotoGrid
          media={media}
          albumId={album.id}
          code={space.code}
          coverPath={album.cover_path}
        />
        <UploadButton code={space.code} albumId={album.id} />
      </main>
    </>
  );
}
