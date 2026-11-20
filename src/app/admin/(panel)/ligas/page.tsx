import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { urlBase } from "@/lib/url";
import { formatearFecha } from "@/lib/formato";
import { anularLiga } from "./actions";
import { BotonCopiarFila, FormularioLiga } from "./formulario-liga";

export const metadata = { title: "Renova | Ligas de mayoreo" };

const ETIQUETA_ESTADO = {
  enviada: { texto: "Enviada", clase: "bg-blue-50 text-blue-700 border border-blue-200" },
  respondida: { texto: "Respondida", clase: "bg-green-50 text-green-700 border border-green-200" },
  vencida: { texto: "Vencida", clase: "bg-amber-50 text-amber-700 border border-amber-200" },
  anulada: { texto: "Anulada", clase: "bg-gray-100 text-gray-600 border border-gray-200" },
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
      <div>
        <h1 className="text-2xl font-black text-marca font-heading tracking-tight">
          Ligas de Mayoreo y Sobre Pedido
        </h1>
        <p className="text-sm text-suave">
          Generador de encuestas únicas y plantillas de mensaje de WhatsApp para contratistas, arquitectos y clientes especiales.
        </p>
      </div>

      <FormularioLiga sucursales={sucursales ?? []} baseUrl={base} />

      <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
        <div className="border-b border-borde px-5 py-4">
          <h2 className="font-extrabold text-marca font-heading text-lg">Historial de ligas generadas</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-borde bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-suave">
            <tr>
              <th className="px-4 py-3.5">Pedido</th>
              <th className="px-4 py-3.5">Sucursal</th>
              <th className="px-4 py-3.5">Cliente / Referencia</th>
              <th className="px-4 py-3.5">Estado</th>
              <th className="px-4 py-3.5">Creada</th>
              <th className="px-4 py-3.5">Vence</th>
              <th className="px-4 py-3.5">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {(ligas ?? []).map((l) => {
              const sucursal = l.sucursales as unknown as { nombre: string } | null;
              const vencida = l.estado === "enviada" && new Date(l.vence_en) < ahora;
              const etiqueta = vencida ? ETIQUETA_ESTADO.vencida : ETIQUETA_ESTADO[l.estado];

              return (
                <tr key={l.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5 font-mono text-xs font-bold text-marca">{l.numero_pedido}</td>
                  <td className="px-4 py-3.5 font-medium">{sucursal?.nombre ?? "—"}</td>
                  <td className="px-4 py-3.5 text-xs text-suave font-medium">{l.referencia_cliente ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${etiqueta.clase}`}>
                      {etiqueta.texto}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-suave font-medium">
                    {formatearFecha(l.creada_en)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-suave font-medium">
                    {formatearFecha(l.vence_en)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {l.estado === "enviada" && !vencida ? (
                        <BotonCopiarFila
                          url={`${base}/e/${l.token}`}
                          numeroPedido={l.numero_pedido}
                          referencia={l.referencia_cliente ?? ""}
                        />
                      ) : null}
                      {l.estado === "enviada" ? (
                        <form action={anularLiga.bind(null, l.id)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-50 transition cursor-pointer"
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
                <td colSpan={7} className="px-4 py-10 text-center text-suave">
                  Aún no se han generado ligas para pedidos de mayoreo.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
