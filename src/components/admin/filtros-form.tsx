import Link from "next/link";
import type { Filtros } from "@/lib/filtros";

type Props = {
  accion: string;
  filtros: Filtros;
  sucursales: { id: string; nombre: string }[];
};

const campo =
  "mt-1.5 rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40 shadow-xs";

/** Formulario GET: los filtros viven en la URL, así se pueden compartir y exportar. */
export function FiltrosForm({ accion, filtros, sucursales }: Props) {
  return (
    <form
      action={accion}
      method="get"
      className="flex flex-wrap items-end gap-3.5 rounded-2xl border border-borde bg-tarjeta p-5 shadow-[0_8px_24px_rgba(32,32,32,0.06)]"
    >
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Canal
        <select name="canal" defaultValue={filtros.canal ?? ""} className={`${campo} block font-medium`}>
          <option value="">Todos los canales</option>
          <option value="tienda">Tienda física</option>
          <option value="mayoreo">Mayoreo / sobre pedido</option>
        </select>
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Sucursal
        <select name="sucursal" defaultValue={filtros.sucursal ?? ""} className={`${campo} block font-medium`}>
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
        <input type="date" name="desde" defaultValue={filtros.desde ?? ""} className={`${campo} block font-medium`} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Hasta
        <input type="date" name="hasta" defaultValue={filtros.hasta ?? ""} className={`${campo} block font-medium`} />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-marca px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-marca-oscuro transition cursor-pointer"
      >
        Filtrar
      </button>
      <Link
        href={accion}
        className="rounded-xl border border-borde px-4 py-2 text-sm font-semibold text-suave hover:bg-slate-50 transition"
      >
        Limpiar
      </Link>
    </form>
  );
}
