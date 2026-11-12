import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { leerFiltros, rangoFechas } from "@/lib/filtros";
import { formatearNumero } from "@/lib/formato";
import { FiltrosForm } from "@/components/admin/filtros-form";

export const metadata = { title: "Renova | Dashboard de Satisfacción" };

type Metricas = {
  total: number;
  satisfaccion: number | null;
  atencion: number | null;
  producto_entrega: number | null;
  nps: number | null;
};
type Resumen = {
  general: Metricas;
  por_canal: (Metricas & { canal: "tienda" | "mayoreo" })[];
  por_sucursal: (Metricas & { sucursal_id: string | null; nombre: string })[];
  tendencia: { dia: string; total: number; satisfaccion: number }[];
  seguimientos_pendientes: number;
};

const NOMBRE_CANAL = { tienda: "Tienda", mayoreo: "Mayoreo / sobre pedido" } as const;

function Tarjeta({
  titulo,
  valor,
  nota,
  destacado,
  alerta,
}: {
  titulo: string;
  valor: string;
  nota?: string;
  destacado?: boolean;
  alerta?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-[0_8px_24px_rgba(32,32,32,0.06)] transition ${
        alerta
          ? "border-red-300 bg-red-50/50 hover:bg-red-50"
          : destacado
          ? "border-acento-dorado bg-gradient-to-br from-white to-amber-50/40"
          : "border-borde bg-tarjeta"
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-suave">{titulo}</p>
      <p className={`mt-1.5 text-3xl font-extrabold font-heading ${alerta ? "text-red-700" : "text-marca"}`}>
        {valor}
      </p>
      {nota ? <p className="mt-1 text-xs text-suave">{nota}</p> : null}
    </div>
  );
}

function TablaMetricas({
  titulo,
  filas,
}: {
  titulo: string;
  filas: { clave: string; nombre: string; m: Metricas }[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
      <div className="border-b border-borde px-5 py-4">
        <h2 className="font-extrabold text-marca font-heading text-lg">{titulo}</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-borde bg-slate-50/60 text-xs font-bold uppercase tracking-wider text-suave">
          <tr>
            <th className="px-5 py-3">&nbsp;</th>
            <th className="px-3 py-3">Respuestas</th>
            <th className="px-3 py-3">Satisfacción</th>
            <th className="px-3 py-3">Atención</th>
            <th className="px-3 py-3">Producto / Entrega</th>
            <th className="px-3 py-3">NPS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-borde">
          {filas.map(({ clave, nombre, m }) => (
            <tr key={clave} className="hover:bg-slate-50/50 transition">
              <td className="px-5 py-3.5 font-bold text-marca">{nombre}</td>
              <td className="px-3 py-3.5 font-semibold">{m.total}</td>
              <td className="px-3 py-3.5 font-medium">{formatearNumero(m.satisfaccion)} ★</td>
              <td className="px-3 py-3.5 font-medium">{formatearNumero(m.atencion)} ★</td>
              <td className="px-3 py-3.5 font-medium">{formatearNumero(m.producto_entrega)} ★</td>
              <td className="px-3 py-3.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    (m.nps ?? 0) >= 50
                      ? "bg-emerald-100 text-emerald-800"
                      : (m.nps ?? 0) >= 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatearNumero(m.nps, 0)}
                </span>
              </td>
            </tr>
          ))}
          {filas.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-6 text-center text-suave">
                Sin datos en este periodo.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Tendencia({ datos }: { datos: Resumen["tendencia"] }) {
  if (datos.length === 0) return null;
  const maximo = Math.max(...datos.map((d) => d.total), 1);
  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-6 shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-marca font-heading text-lg">Tendencia de respuestas por día</h2>
          <p className="text-xs text-suave mt-0.5">
            Altura de barra = volumen de respuestas. Pasa el cursor para consultar calificación promedio.
          </p>
        </div>
      </div>
      <div className="mt-6 flex h-44 items-end gap-2 overflow-x-auto pt-4" role="img" aria-label="Respuestas por día">
        {datos.map((d) => (
          <div
            key={d.dia}
            title={`${d.dia}: ${d.total} respuestas, satisfacción promedio ${formatearNumero(d.satisfaccion)}/5`}
            className="group relative min-w-8 flex-1 rounded-t-lg bg-acento hover:bg-acento-dorado transition-all cursor-pointer flex flex-col justify-end items-center"
            style={{ height: `${Math.max(12, (d.total / maximo) * 100)}%` }}
          >
            <span className="mb-1 text-[11px] font-extrabold text-marca opacity-90">{d.total}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-suave border-t border-borde pt-2">
        <span>{datos[0].dia}</span>
        <span>{datos[datos.length - 1].dia}</span>
      </div>
    </div>
  );
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  await requerirPerfil();
  const filtros = leerFiltros(await searchParams);
  const { desde, hasta } = rangoFechas(filtros);
  const supabase = await supabaseServer();

  const [{ data: sucursales }, { data, error }] = await Promise.all([
    supabase.from("sucursales").select("id, nombre").order("nombre"),
    supabase.rpc("resumen_dashboard", {
      p_canal: filtros.canal ?? null,
      p_sucursal: filtros.sucursal ?? null,
      p_desde: desde,
      p_hasta: hasta,
    }),
  ]);
  const r = data as Resumen | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-marca font-heading tracking-tight">Dashboard General</h1>
          <p className="text-sm text-suave">Resumen de satisfacción, calidad de servicio y NPS en sucursales Renova</p>
        </div>
      </div>

      <FiltrosForm accion="/admin" filtros={filtros} sucursales={sucursales ?? []} />

      {error || !r ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          No pudimos cargar el resumen. Inténtalo de nuevo.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Tarjeta titulo="Total Respuestas" valor={String(r.general.total)} nota="Muestra acumulada" />
            <Tarjeta
              titulo="Satisfacción General"
              valor={`${formatearNumero(r.general.satisfaccion)} / 5`}
              nota="Escala CSAT (1 a 5)"
              destacado
            />
            <Tarjeta
              titulo="Net Promoter Score"
              valor={formatearNumero(r.general.nps, 0)}
              nota="Índice NPS (-100 a +100)"
              destacado
            />
            <Tarjeta
              titulo="Atención de Asesor"
              valor={`${formatearNumero(r.general.atencion)} / 5`}
              nota="Evaluación de trato"
            />
            <Link href="/admin/seguimiento" className="block group">
              <Tarjeta
                titulo="Casos por Atender"
                valor={String(r.seguimientos_pendientes)}
                nota="Detractores (CSAT ≤ 2 o NPS ≤ 6)"
                alerta={r.seguimientos_pendientes > 0}
              />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TablaMetricas
              titulo="Desglose por canal (Tienda vs. Mayoreo)"
              filas={r.por_canal.map((c) => ({ clave: c.canal, nombre: NOMBRE_CANAL[c.canal], m: c }))}
            />
            <TablaMetricas
              titulo="Desglose por sucursal física"
              filas={r.por_sucursal.map((s) => ({ clave: s.sucursal_id ?? "sin", nombre: s.nombre, m: s }))}
            />
          </div>

          <Tendencia datos={r.tendencia} />
        </>
      )}
    </div>
  );
}
