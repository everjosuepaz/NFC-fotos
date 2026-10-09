"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAlbum } from "@/app/actions/update-album";
import { ALBUM_EMOJIS } from "@/lib/album-emojis";
import { COUNTRIES } from "@/lib/countries";
import type { Album } from "@/lib/types";

const NAME_MAX = 80;
const DESCRIPTION_MAX = 280;

export function EditAlbumButton({
  code,
  album,
}: {
  code: string;
  album: Album;
}) {
  const router = useRouter();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(album.name);
  const [emoji, setEmoji] = useState(album.emoji);
  const [description, setDescription] = useState(album.description ?? "");
  const [countryCode, setCountryCode] = useState(album.country_code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openDialog() {
    setName(album.name);
    setEmoji(album.emoji);
    setDescription(album.description ?? "");
    setCountryCode(album.country_code ?? "");
    setError(null);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateAlbum({
        code,
        albumId: album.id,
        name,
        emoji,
        description,
        countryCode,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-surface-border bg-blanco px-4 text-sm font-medium text-foreground shadow-sm shadow-piedra/5 transition-transform duration-150 hover:border-tierra/40 active:scale-95"
      >
        <span aria-hidden>✏️</span>
        Editar álbum
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-piedra/50 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92dvh] w-full max-w-lg flex-col gap-5 overflow-y-auto rounded-t-3xl border border-surface-border bg-arena p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl shadow-piedra/20 sm:rounded-3xl sm:p-6"
          >
            <h2
              id={titleId}
              className="text-xl font-semibold text-foreground"
            >
              Editar álbum
            </h2>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-foreground">
                Emoji
              </legend>
              <div className="grid grid-cols-8 gap-1.5">
                {ALBUM_EMOJIS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setEmoji(option)}
                    aria-pressed={emoji === option}
                    aria-label={`Emoji ${option}`}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-xl transition-transform duration-150 active:scale-90 ${
                      emoji === option
                        ? "border-tierra bg-tierra/10"
                        : "border-surface-border bg-blanco hover:border-tierra/40"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Nombre
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={NAME_MAX}
                placeholder="Salida al parque"
                className="min-h-[44px] rounded-xl border border-surface-border bg-blanco px-3 text-base text-foreground outline-none focus:border-tierra focus-visible:ring-2 focus-visible:ring-tierra/30"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                Descripción{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={DESCRIPTION_MAX}
                rows={3}
                placeholder="Domingo por la tarde con la familia"
                className="resize-none rounded-xl border border-surface-border bg-blanco px-3 py-2 text-base text-foreground outline-none focus:border-tierra focus-visible:ring-2 focus-visible:ring-tierra/30"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">
                País{" "}
                <span className="font-normal text-muted-foreground">
                  (opcional)
                </span>
              </span>
              <select
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="min-h-[44px] rounded-xl border border-surface-border bg-blanco px-3 text-base text-foreground outline-none focus:border-tierra focus-visible:ring-2 focus-visible:ring-tierra/30"
              >
                <option value="">Sin país</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            {error ? (
              <p role="alert" className="text-sm font-medium text-lust">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="min-h-[44px] rounded-full border border-surface-border bg-blanco px-5 text-sm font-medium text-foreground transition-transform duration-150 active:scale-95 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={pending || name.trim().length === 0}
                className="min-h-[44px] rounded-full bg-tierra px-5 text-sm font-semibold text-blanco transition-transform duration-150 active:scale-95 disabled:opacity-60"
              >
                {pending ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
