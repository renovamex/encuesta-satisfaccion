import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { aplicarFiltros, filtrosAQuery, leerFiltros } from "@/lib/filtros";
import { formatearFecha, formatearMoneda } from "@/lib/formato";
import { FiltrosForm } from "@/components/admin/filtros-form";

export const metadata = { title: "Renova | Respuestas" };

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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-marca">Respuestas</h1>
        <a
          href={`/admin/respuestas/exportar?${base}`}
          className="rounded-lg border border-borde bg-tarjeta px-4 py-2 text-sm font-medium text-marca hover:bg-background"
        >
          Exportar CSV ({total})
        </a>
      </div>

      <FiltrosForm accion="/admin/respuestas" filtros={filtros} sucursales={sucursales ?? []} />

      <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-borde text-suave">
            <tr>
              <th className="px-3 py-3 font-medium">Fecha</th>
              <th className="px-3 py-3 font-medium">Canal</th>
              <th className="px-3 py-3 font-medium">Sucursal</th>
              <th className="px-3 py-3 font-medium">Pedido</th>
              <th className="px-3 py-3 font-medium" title="Satisfacción general">Satisf.</th>
              <th className="px-3 py-3 font-medium">NPS</th>
              <th className="px-3 py-3 font-medium">Atención</th>
              <th className="px-3 py-3 font-medium">Prod./Entrega</th>
              <th className="px-3 py-3 font-medium">Ticket</th>
              <th className="px-3 py-3 font-medium">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {(filas ?? []).map((r) => {
              const sucursal = r.sucursales as unknown as { nombre: string } | null;
              const baja = r.satisfaccion <= 2 || r.nps <= 6;
              return (
                <tr key={r.id} className="border-b border-borde align-top last:border-0">
                  <td className="whitespace-nowrap px-3 py-3">{formatearFecha(r.creada_en)}</td>
                  <td className="px-3 py-3 capitalize">{r.canal}</td>
                  <td className="px-3 py-3">{sucursal?.nombre ?? "—"}</td>
                  <td className="px-3 py-3 font-medium">{r.numero_pedido}</td>
                  <td className={`px-3 py-3 ${baja ? "font-semibold text-red-700" : ""}`}>{r.satisfaccion}</td>
                  <td className="px-3 py-3">{r.nps}</td>
                  <td className="px-3 py-3">{r.atencion}</td>
                  <td className="px-3 py-3">{r.producto_entrega}</td>
                  <td className="whitespace-nowrap px-3 py-3">{formatearMoneda(r.monto_ticket)}</td>
                  <td className="min-w-64 px-3 py-3">{r.comentario ?? "—"}</td>
                </tr>
              );
            })}
            {(filas ?? []).length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-suave">
                  No hay respuestas con estos filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {paginas > 1 ? (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {pagina > 1 ? <Link href={enlacePagina(pagina - 1)}>← Anterior</Link> : <span />}
          <span className="text-suave">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas ? <Link href={enlacePagina(pagina + 1)}>Siguiente →</Link> : <span />}
        </nav>
      ) : null}
    </div>
  );
}
