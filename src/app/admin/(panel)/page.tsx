import Link from "next/link";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { leerFiltros, rangoFechas } from "@/lib/filtros";
import { formatearNumero } from "@/lib/formato";
import { FiltrosForm } from "@/components/admin/filtros-form";

export const metadata = { title: "Renova | Dashboard" };

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

function Tarjeta({ titulo, valor, nota }: { titulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
      <p className="text-sm text-suave">{titulo}</p>
      <p className="mt-1 text-3xl font-semibold text-marca">{valor}</p>
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
    <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-sm">
      <h2 className="px-5 pt-4 font-semibold text-marca">{titulo}</h2>
      <table className="mt-2 w-full text-left text-sm">
        <thead className="border-b border-borde text-suave">
          <tr>
            <th className="px-5 py-2 font-medium">&nbsp;</th>
            <th className="px-3 py-2 font-medium">Resp.</th>
            <th className="px-3 py-2 font-medium">Satisf.</th>
            <th className="px-3 py-2 font-medium">Atención</th>
            <th className="px-3 py-2 font-medium">Prod./Entrega</th>
            <th className="px-3 py-2 font-medium">NPS</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ clave, nombre, m }) => (
            <tr key={clave} className="border-b border-borde last:border-0">
              <td className="px-5 py-2.5 font-medium">{nombre}</td>
              <td className="px-3 py-2.5">{m.total}</td>
              <td className="px-3 py-2.5">{formatearNumero(m.satisfaccion)}</td>
              <td className="px-3 py-2.5">{formatearNumero(m.atencion)}</td>
              <td className="px-3 py-2.5">{formatearNumero(m.producto_entrega)}</td>
              <td className="px-3 py-2.5">{formatearNumero(m.nps, 0)}</td>
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
  const maximo = Math.max(...datos.map((d) => d.total));
  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
      <h2 className="font-semibold text-marca">Respuestas por día</h2>
      <p className="text-xs text-suave">Altura = número de respuestas. Pasa el cursor para ver la satisfacción del día.</p>
      <div className="mt-4 flex h-40 items-end gap-1 overflow-x-auto" role="img" aria-label="Respuestas por día">
        {datos.map((d) => (
          <div
            key={d.dia}
            title={`${d.dia}: ${d.total} respuestas, satisfacción ${formatearNumero(d.satisfaccion)}`}
            className="min-w-3 flex-1 rounded-t bg-acento/80 hover:bg-acento"
            style={{ height: `${Math.max(4, (d.total / maximo) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-suave">
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
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-marca">Dashboard</h1>
      <FiltrosForm accion="/admin" filtros={filtros} sucursales={sucursales ?? []} />

      {error || !r ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-red-700">
          No pudimos cargar el resumen. Inténtalo de nuevo.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Tarjeta titulo="Respuestas" valor={String(r.general.total)} />
            <Tarjeta titulo="Satisfacción general" valor={formatearNumero(r.general.satisfaccion)} nota="Promedio de 1 a 5" />
            <Tarjeta titulo="NPS" valor={formatearNumero(r.general.nps, 0)} nota="De -100 a 100" />
            <Tarjeta titulo="Atención" valor={formatearNumero(r.general.atencion)} nota="Promedio de 1 a 5" />
            <Link href="/admin/seguimiento" className="block">
              <Tarjeta
                titulo="Seguimientos pendientes"
                valor={String(r.seguimientos_pendientes)}
                nota="Calificaciones bajas por atender"
              />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TablaMetricas
              titulo="Tienda vs. mayoreo"
              filas={r.por_canal.map((c) => ({ clave: c.canal, nombre: NOMBRE_CANAL[c.canal], m: c }))}
            />
            <TablaMetricas
              titulo="Por sucursal"
              filas={r.por_sucursal.map((s) => ({ clave: s.sucursal_id ?? "sin", nombre: s.nombre, m: s }))}
            />
          </div>

          <Tendencia datos={r.tendencia} />
        </>
      )}
    </div>
  );
}
