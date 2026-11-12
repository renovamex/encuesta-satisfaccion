import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { aplicarFiltros, filtrosAQuery, leerFiltros } from "@/lib/filtros";
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { FiltrosForm } from "@/components/admin/filtros-form";

export const metadata = { title: "Renova | Registro de Respuestas" };

const POR_PAGINA = 50;

export default async function Respuestas({ searchParams }: PageProps<"/admin/respuestas">) {
  await requerirPerfil();
  const params = await searchParams;
  const filtros = leerFiltros(params);
  const pagina = Math.max(1, Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina) || 1);
  const desde = (pagina - 1) * POR_PAGINA;

  const supabase = await supabaseServer();
  const [{ data: sucursales }, { data: filas, count }] = await Promise.all([
    supabase.from("sucursales").select("id, nombre").order("nombre"),
    aplicarFiltros(
      supabase
        .from("respuestas")
        .select(
          "id, canal, numero_pedido, satisfaccion, nps, atencion, producto_entrega, comentario, monto_ticket, creada_en, sucursales(nombre)",
          { count: "exact" },
        ),
      filtros,
    )
      .order("creada_en", { ascending: false })
      .range(desde, desde + POR_PAGINA - 1),
  ]);

  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const base = filtrosAQuery(filtros);
  const enlacePagina = (n: number) => `/admin/respuestas?${base}${base ? "&" : ""}pagina=${n}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-marca font-heading tracking-tight">Registro de Respuestas</h1>
          <p className="text-sm text-suave">Historial detallado de clientes con filtros por canal, sucursal y fecha</p>
        </div>
        <a
          href={`/admin/respuestas/exportar?${base}`}
          className="inline-flex items-center gap-2 rounded-xl border border-borde bg-white px-4 py-2.5 text-sm font-bold text-marca shadow-xs hover:bg-slate-50 transition"
        >
          <span>📥 Exportar a CSV ({total})</span>
        </a>
      </div>

      <FiltrosForm accion="/admin/respuestas" filtros={filtros} sucursales={sucursales ?? []} />

      <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-borde bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-suave">
            <tr>
              <th className="px-4 py-3.5">Fecha</th>
              <th className="px-3 py-3.5">Canal</th>
              <th className="px-3 py-3.5">Sucursal</th>
              <th className="px-3 py-3.5">Pedido</th>
              <th className="px-3 py-3.5 text-center">Satisf.</th>
              <th className="px-3 py-3.5 text-center">NPS</th>
              <th className="px-3 py-3.5 text-center">Atención</th>
              <th className="px-3 py-3.5 text-center">Entrega</th>
              <th className="px-3 py-3.5 text-right">Ticket</th>
              <th className="px-4 py-3.5">Comentarios del Cliente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {(filas ?? []).map((r) => {
              const sucursal = r.sucursales as unknown as { nombre: string } | null;
              const detractor = r.satisfaccion <= 2 || r.nps <= 6;
              const promotor = r.nps >= 9;

              return (
                <tr key={r.id} className="hover:bg-slate-50/50 transition align-top">
                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-suave font-medium">
                    {formatearFecha(r.creada_en)}
                  </td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold capitalize ${
                        r.canal === "mayoreo"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {r.canal}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-marca">{sucursal?.nombre ?? "—"}</td>
                  <td className="px-3 py-3.5 font-mono text-xs font-bold text-marca">{r.numero_pedido}</td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-block font-extrabold ${
                        r.satisfaccion <= 2 ? "text-red-700" : r.satisfaccion >= 4 ? "text-emerald-700" : "text-marca"
                      }`}
                    >
                      {r.satisfaccion} / 5
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        promotor
                          ? "bg-emerald-100 text-emerald-800"
                          : detractor
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {r.nps}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center font-medium">{r.atencion}</td>
                  <td className="px-3 py-3.5 text-center font-medium">{r.producto_entrega}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-marca">
                    {formatearMoneda(r.monto_ticket)}
                  </td>
                  <td className="min-w-64 px-4 py-3.5 text-xs text-slate-700 leading-relaxed">
                    {r.comentario ? (
                      <span className={detractor ? "font-semibold text-red-900" : ""}>{r.comentario}</span>
                    ) : (
                      <span className="text-suave/60 italic">Sin comentario</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {(filas ?? []).length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-suave">
                  No se encontraron respuestas con los filtros seleccionados.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {paginas > 1 ? (
        <nav className="flex items-center justify-center gap-4 text-sm font-semibold">
          {pagina > 1 ? (
            <Link href={enlacePagina(pagina - 1)} className="rounded-lg border border-borde px-3 py-1.5 hover:bg-white">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-suave">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? (
            <Link href={enlacePagina(pagina + 1)} className="rounded-lg border border-borde px-3 py-1.5 hover:bg-white">
              Siguiente →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
