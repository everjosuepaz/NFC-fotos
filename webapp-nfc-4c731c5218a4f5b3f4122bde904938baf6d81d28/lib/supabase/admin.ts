import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: se salta RLS y tiene control total.
// SOLO se importa desde código de servidor (Server Components y Server Actions).
// Nunca lo importes desde un archivo con "use client".
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
