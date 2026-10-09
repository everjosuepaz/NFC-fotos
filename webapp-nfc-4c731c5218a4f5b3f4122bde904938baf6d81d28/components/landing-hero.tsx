import { BrandLockup } from "@/components/brand-lockup";

export function LandingHero() {
  return (
    <section className="relative flex min-h-dvh flex-col justify-center px-4 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-8 sm:gap-10">
        <BrandLockup size="lg" showTagline href={null} />

        <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          Abre el mapa de tus mejores momentos. Cada pegatina NFC abre un
          álbum vivo de fotos para revivir en cualquier instante.
        </p>

        <p className="inline-flex min-h-[44px] items-center rounded-full border border-surface-border bg-blanco px-5 text-sm font-medium text-foreground shadow-sm shadow-piedra/5">
          Para entrar, acerca tu pegatina NFC al móvil
        </p>
      </div>
    </section>
  );
}
