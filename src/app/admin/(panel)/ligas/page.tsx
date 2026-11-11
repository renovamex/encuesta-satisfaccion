import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { urlBase } from "@/lib/url";
import { formatearFecha } from "@/lib/formato";
import { anularLiga } from "./actions";
import { BotonesCompartir, FormularioLiga } from "./formulario-liga";

export const metadata = { title: "Renova | Ligas de mayoreo" };

const ETIQUETA_ESTADO = {
  enviada: { texto: "Enviada", clase: "bg-blue-50 text-blue-700" },
  respondida: { texto: "Respondida", clase: "bg-green-50 text-green-700" },
  vencida: { texto: "Vencida", clase: "bg-amber-50 text-amber-700" },
  anulada: { texto: "Anulada", clase: "bg-gray-100 text-gray-600" },
} as const;

export default async function Ligas() {
  await requerirPerfil();
  const supabase = await supabaseServer();
  const base = await urlBase();

  const [{ data: sucursales }, { data: ligas }] = await Promise.all([
    supabase.from("sucursales").select("id, nombre").eq("activa", true).order("nombre"),
    supabase
      .from("invitaciones_mayoreo")
      .select("id, token, numero_pedido, referencia_cliente, estado, creada_en, vence_en, sucursales(nombre)")
      .order("creada_en", { ascending: false })
      .limit(100),
  ]);

  const ahora = new Date();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-marca">Ligas de mayoreo y sobre pedido</h1>
      <FormularioLiga sucursales={sucursales ?? []} baseUrl={base} />

      <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-borde text-suave">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Sucursal</th>
              <th className="px-4 py-3 font-medium">Referencia</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Creada</th>
              <th className="px-4 py-3 font-medium">Vence</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(ligas ?? []).map((l) => {
              const sucursal = l.sucursales as unknown as { nombre: string } | null;
              const vencida = l.estado === "enviada" && new Date(l.vence_en) < ahora;
              const estado = vencida ? "vencida" : (l.estado as keyof typeof ETIQUETA_ESTADO);
              const etiqueta = ETIQUETA_ESTADO[estado];
              return (
                <tr key={l.id} className="border-b border-borde last:border-0">
                  <td className="px-4 py-3 font-medium">{l.numero_pedido}</td>
                  <td className="px-4 py-3">{sucursal?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">{l.referencia_cliente ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${etiqueta.clase}`}>
                      {etiqueta.texto}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFecha(l.creada_en)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearFecha(l.vence_en)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {l.estado === "enviada" && !vencida ? (
                        <BotonesCompartir url={`${base}/e/${l.token}`} />
                      ) : null}
                      {l.estado === "enviada" ? (
                        <form action={anularLiga.bind(null, l.id)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Anular
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {(ligas ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-suave">
                  Aún no has generado ligas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
