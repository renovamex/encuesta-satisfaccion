const ZONA = "America/Mexico_City";

export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatearNumero(n: number | null | undefined, decimales = 1): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return n.toFixed(decimales);
}

export function formatearMoneda(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
}
