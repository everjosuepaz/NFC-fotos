import { redirect } from "next/navigation";

// La antigua lista pública de álbumes ya no existe: cada pegatina abre su
// propio espacio en /s/[código]. Quien llegue aquí vuelve a la landing.
export default function LegacyAppPage() {
  redirect("/");
}

