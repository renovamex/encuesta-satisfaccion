import "server-only";
import { headers } from "next/headers";

/** URL pública base para armar ligas. NEXT_PUBLIC_SITE_URL manda; si no, se deduce de la petición. */
export async function urlBase(): Promise<string> {
  const fija = process.env.NEXT_PUBLIC_SITE_URL;
  if (fija) return fija.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
