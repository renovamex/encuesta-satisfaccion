// Límite simple en memoria por clave (IP). Suficiente en local y como primera barrera;
// en Vercel cada instancia tiene su propio contador, así que al migrar conviene moverlo
// a Upstash/Vercel KV o a una tabla en Supabase.
const intentos = new Map<string, number[]>();

export function excedeLimite(clave: string, max = 8, ventanaMs = 10 * 60 * 1000): boolean {
  const ahora = Date.now();
  const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  recientes.push(ahora);
  intentos.set(clave, recientes);
  if (intentos.size > 5000) {
    for (const [k, v] of intentos) if (v.every((t) => ahora - t >= ventanaMs)) intentos.delete(k);
  }
  return recientes.length > max;
}
