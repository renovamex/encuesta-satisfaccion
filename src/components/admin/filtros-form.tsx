"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Filtros } from "@/lib/filtros";

type Props = {
  accion: string;
  filtros: Filtros;
  sucursales: { id: string; nombre: string }[];
};

const campo =
  "mt-1.5 rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40 shadow-xs";

/**
 * Filtros interactivos Ajax:
 * Cambian los parámetros de consulta al vuelo usando useTransition y router.replace
 * para que Next.js actualice los datos mediante RSC (Ajax) en tiempo real sin recargar la página.
 */
export function FiltrosForm({ accion, filtros, sucursales }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const actualizarFiltro = (clave: string, valor: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    // Si estamos en la tabla de respuestas, reiniciar la paginación a la página 1
    params.delete("pagina");

    startTransition(() => {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    });
  };

  const hayFiltrosActivos = Boolean(
    filtros.canal || filtros.sucursal || filtros.desde || filtros.hasta
  );

  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3.5">
          <label className="text-xs font-bold uppercase tracking-wider text-suave">
            Canal
            <select
              name="canal"
              value={filtros.canal ?? ""}
              onChange={(e) => actualizarFiltro("canal", e.target.value)}
              className={`${campo} block font-medium cursor-pointer`}
            >
              <option value="">Todos los canales</option>
              <option value="tienda">Tienda física</option>
              <option value="mayoreo">Mayoreo / sobre pedido</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-suave">
            Sucursal
            <select
              name="sucursal"
              value={filtros.sucursal ?? ""}
              onChange={(e) => actualizarFiltro("sucursal", e.target.value)}
              className={`${campo} block font-medium cursor-pointer`}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-suave">
            Desde
            <input
              type="date"
              name="desde"
              value={filtros.desde ?? ""}
              onChange={(e) => actualizarFiltro("desde", e.target.value)}
              className={`${campo} block font-medium cursor-pointer`}
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-suave">
            Hasta
            <input
              type="date"
              name="hasta"
              value={filtros.hasta ?? ""}
              onChange={(e) => actualizarFiltro("hasta", e.target.value)}
              className={`${campo} block font-medium cursor-pointer`}
            />
          </label>

          {hayFiltrosActivos ? (
            <Link
              href={accion}
              className="rounded-xl border border-borde bg-white px-3.5 py-2 text-xs font-bold text-suave hover:bg-slate-50 hover:text-marca transition shadow-xs inline-flex items-center gap-1.5"
            >
              <span>✕</span>
              <span>Limpiar</span>
            </Link>
          ) : null}
        </div>

        {/* Indicador de estado de actualización Ajax */}
        <div className="flex items-center gap-2 pb-1 text-xs">
          {isPending ? (
            <div className="flex items-center gap-2 rounded-full bg-acento/20 border border-acento-dorado/40 px-3 py-1 text-marca font-extrabold animate-pulse">
              <span className="h-2 w-2 rounded-full bg-acento animate-ping" />
              <span>Actualizando métricas…</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-suave text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Filtro instantáneo activo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
