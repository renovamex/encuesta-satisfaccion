import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { formatearFecha } from "@/lib/formato";
import { actualizarSeguimiento } from "./actions";

export const metadata = { title: "Renova | Seguimiento" };

const PESTANAS = [
  { valor: "pendiente", texto: "Pendientes" },
  { valor: "atendido", texto: "Atendidos" },
  { valor: "cerrado", texto: "Cerrados" },
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-marca">Seguimiento</h1>
        <p className="text-sm text-suave">
          Respuestas con satisfacción de 1 o 2, o NPS de 0 a 6. Localiza al cliente por número de pedido.
        </p>
      </div>

      <nav className="flex gap-2">
        {PESTANAS.map((p) => (
          <Link
            key={p.valor}
            href={`/admin/seguimiento?estado=${p.valor}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              p.valor === estado ? "bg-marca text-white" : "border border-borde bg-tarjeta text-marca"
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
            <article key={s.respuesta_id} className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-marca">
                  Pedido {r.numero_pedido}{" "}
                  <span className="font-normal capitalize text-suave">
                    · {r.canal}
                    {r.sucursales ? ` · ${r.sucursales.nombre}` : ""}
                  </span>
                </h2>
                <span className="text-sm text-suave">{formatearFecha(r.creada_en)}</span>
              </div>
              <p className="mt-2 text-sm">
                Satisfacción <strong>{r.satisfaccion}</strong> · NPS <strong>{r.nps}</strong> · Atención{" "}
                <strong>{r.atencion}</strong> · Producto/Entrega <strong>{r.producto_entrega}</strong>
              </p>
              {r.comentario ? (
                <blockquote className="mt-3 border-l-4 border-acento/60 bg-background px-3 py-2 text-sm">
                  {r.comentario}
                </blockquote>
              ) : null}

              <form
                action={actualizarSeguimiento.bind(null, s.respuesta_id)}
                className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <input
                  name="nota"
                  defaultValue={s.nota ?? ""}
                  maxLength={1000}
                  placeholder="Nota: quién contactó al cliente y qué se acordó"
                  className="rounded-lg border border-borde px-3 py-2 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
                />
                <select
                  name="estado"
                  defaultValue={s.estado}
                  className="rounded-lg border border-borde bg-white px-3 py-2 text-sm"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="atendido">Atendido</option>
                  <option value="cerrado">Cerrado</option>
                </select>
                <button type="submit" className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white">
                  Guardar
                </button>
              </form>
            </article>
          );
        })}
        {(filas ?? []).length === 0 ? (
          <p className="rounded-2xl border border-borde bg-tarjeta px-4 py-10 text-center text-suave">
            No hay seguimientos en esta bandeja.
          </p>
        ) : null}
      </div>
    </div>
  );
}
