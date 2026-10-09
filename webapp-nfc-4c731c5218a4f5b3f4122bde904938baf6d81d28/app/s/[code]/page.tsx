import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumGrid } from "@/components/album-grid";
import { BrandLockup } from "@/components/brand-lockup";
import { CreateAlbumLauncher } from "@/components/create-album-launcher";
import { getAlbums } from "@/lib/albums";
import { getSpaceByCode } from "@/lib/space";

export const dynamic = "force-dynamic";

// Los espacios son privados: que los buscadores no los indexen.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SpaceHome({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const space = await getSpaceByCode(code);

  if (!space) {
    notFound();
  }

  const albums = await getAlbums(space.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] sm:gap-10 sm:px-8 sm:pb-16 sm:pt-16">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-3">
          <BrandLockup size="lg" showTagline href={`/s/${space.code}`} />
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Abre el mapa de tus mejores momentos. Cada álbum guarda las
            fotos de un momento: una salida, una fiesta, un viaje.
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-auto">
          <CreateAlbumLauncher code={space.code} />
        </div>
      </header>

      <AlbumGrid albums={albums} code={space.code} />
    </main>
  );
}
