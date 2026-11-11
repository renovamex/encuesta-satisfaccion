// Filtros compartidos por dashboard, tabla de respuestas y CSV.
// México ya no usa horario de verano, así que la zona fija es UTC-6.
const OFFSET = "-06:00";

export type Filtros = {
  canal?: "tienda" | "mayoreo";
  sucursal?: string;
  desde?: string; // YYYY-MM-DD (inclusive)
  hasta?: string; // YYYY-MM-DD (inclusive)
};

type Params = Record<string, string | string[] | undefined>;

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uno(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function leerFiltros(params: Params): Filtros {
  const canal = uno(params.canal);
  const sucursal = uno(params.sucursal);
  const desde = uno(params.desde);
  const hasta = uno(params.hasta);
  return {
    canal: canal === "tienda" || canal === "mayoreo" ? canal : undefined,
    sucursal: sucursal && UUID.test(sucursal) ? sucursal : undefined,
    desde: desde && FECHA.test(desde) ? desde : undefined,
    hasta: hasta && FECHA.test(hasta) ? hasta : undefined,
  };
}

function sumarDia(fecha: string): string {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Aplica los filtros a una consulta de `respuestas` de supabase-js. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aplicarFiltros<Q extends { eq: any; gte: any; lt: any }>(consulta: Q, f: Filtros): Q {
  let q = consulta;
  if (f.canal) q = q.eq("canal", f.canal);
  if (f.sucursal) q = q.eq("sucursal_id", f.sucursal);
  if (f.desde) q = q.gte("creada_en", `${f.desde}T00:00:00${OFFSET}`);
  if (f.hasta) q = q.lt("creada_en", `${sumarDia(f.hasta)}T00:00:00${OFFSET}`);
  return q;
}

/** Rango [desde, hasta) como timestamps ISO con zona, para las funciones SQL. */
export function rangoFechas(f: Filtros): { desde: string | null; hasta: string | null } {
  return {
    desde: f.desde ? `${f.desde}T00:00:00${OFFSET}` : null,
    hasta: f.hasta ? `${sumarDia(f.hasta)}T00:00:00${OFFSET}` : null,
  };
}

export function filtrosAQuery(f: Filtros): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) p.set(k, v);
  return p.toString();
}
