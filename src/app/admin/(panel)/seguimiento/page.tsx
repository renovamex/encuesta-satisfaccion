import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { formatearFecha } from "@/lib/formato";
import { actualizarSeguimiento } from "./actions";

export const metadata = { title: "Renova | Mesa de Seguimiento" };

const PESTANAS = [
  { valor: "pendiente", texto: "Casos Pendientes" },
  { valor: "atendido", texto: "En Atención" },
  { valor: "cerrado", texto: "Casos Cerrados" },
] as const;

export default async function Seguimiento({ searchParams }: PageProps<"/admin/seguimiento">) {
  await requerirPerfil();
  const { estado: estadoParam } = await searchParams;
  const estado = PESTANAS.find((p) => p.valor === estadoParam)?.valor ?? "pendiente";

  const supabase = await supabaseServer();
  const { data: filas } = await supabase
    .from("seguimientos")
    .select(
      "respuesta_id, estado, nota, actualizado_en, respuestas(canal, numero_pedido, satisfaccion, nps, atencion, producto_entrega, comentario, creada_en, sucursales(nombre))",
    )
    .eq("estado", estado)
    .order("creado_en", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-marca font-heading tracking-tight">Mesa de Seguimiento</h1>
        <p className="text-sm text-suave">
          Atención prioritaria a clientes detractores (calificación ≤ 2 o recomendación NPS ≤ 6). Localiza al cliente por su número de pedido.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2.5">
        {PESTANAS.map((p) => (
          <Link
            key={p.valor}
            href={`/admin/seguimiento?estado=${p.valor}`}
            className={`rounded-full px-5 py-2 text-xs font-extrabold uppercase tracking-wider transition ${
              p.valor === estado
                ? "bg-marca text-white shadow-sm"
                : "border border-borde bg-white text-suave hover:bg-slate-50 hover:text-marca"
            }`}
          >
            {p.texto}
          </Link>
        ))}
      </nav>

      <div className="space-y-4">
        {(filas ?? []).map((s) => {
          const r = s.respuestas as unknown as {
            canal: string;
            numero_pedido: string;
            satisfaccion: number;
            nps: number;
            atencion: number;
            producto_entrega: number;
            comentario: string | null;
            creada_en: string;
            sucursales: { nombre: string } | null;
          };

          return (
            <article
              key={s.respuesta_id}
              className="rounded-2xl border border-red-200/80 bg-tarjeta p-6 shadow-[0_8px_24px_rgba(32,32,32,0.06)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-borde pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                  <h2 className="font-extrabold text-marca font-heading text-lg">
                    Pedido {r.numero_pedido}
                  </h2>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 capitalize">
                    {r.canal} {r.sucursales ? `· Sucursal ${r.sucursales.nombre}` : ""}
                  </span>
                </div>
                <span className="text-xs font-semibold text-suave">{formatearFecha(r.creada_en)}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold">
                <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-red-800">
                  Satisfacción: {r.satisfaccion} / 5
                </span>
                <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-red-800">
                  NPS: {r.nps} / 10 (Detractor)
                </span>
                <span className="rounded-lg bg-slate-50 border border-borde px-3 py-1.5 text-slate-700">
                  Atención asesor: {r.atencion} / 5
                </span>
                <span className="rounded-lg bg-slate-50 border border-borde px-3 py-1.5 text-slate-700">
                  Producto / Entrega: {r.producto_entrega} / 5
                </span>
              </div>

              {r.comentario ? (
                <blockquote className="mt-4 rounded-xl border-l-4 border-acento bg-amber-50/40 p-4 text-sm font-medium text-marca leading-relaxed">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900/70 mb-1">Motivo del reporte:</p>
                  &ldquo;{r.comentario}&rdquo;
                </blockquote>
              ) : null}

              <form
                action={actualizarSeguimiento.bind(null, s.respuesta_id)}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto] items-center pt-3 border-t border-borde/60"
              >
                <input
                  name="nota"
                  defaultValue={s.nota ?? ""}
                  maxLength={1000}
                  placeholder="Nota interna: quién contactó al cliente, solución o reposición acordada..."
                  className="rounded-xl border border-borde bg-white px-4 py-2.5 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
                />
                <select
                  name="estado"
                  defaultValue={s.estado}
                  className="rounded-xl border border-borde bg-white px-3.5 py-2.5 text-sm font-bold text-marca outline-none"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="atendido">En Atención</option>
                  <option value="cerrado">Resuelto / Cerrado</option>
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-marca px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-marca-oscuro transition cursor-pointer"
                >
                  Guardar
                </button>
              </form>
            </article>
          );
        })}

        {(filas ?? []).length === 0 ? (
          <div className="rounded-2xl border border-borde bg-tarjeta p-12 text-center text-suave">
            <span className="text-3xl block mb-2">🎉</span>
            <p className="font-bold text-marca text-base font-heading">No hay casos en esta bandeja</p>
            <p className="text-xs text-suave mt-1">Todos los clientes detractores han sido atendidos o no hay incidencias recientes.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
