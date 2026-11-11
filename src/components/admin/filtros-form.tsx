import Link from "next/link";
import type { Filtros } from "@/lib/filtros";

type Props = {
  accion: string;
  filtros: Filtros;
  sucursales: { id: string; nombre: string }[];
};

const campo =
  "mt-1 rounded-lg border border-borde bg-white px-3 py-2 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento/30";

/** Formulario GET: los filtros viven en la URL, así se pueden compartir y exportar. */
export function FiltrosForm({ accion, filtros, sucursales }: Props) {
  return (
    <form
      action={accion}
      method="get"
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-borde bg-tarjeta p-4 shadow-sm"
    >
      <label className="text-sm font-medium">
        Canal
        <select name="canal" defaultValue={filtros.canal ?? ""} className={`${campo} block`}>
          <option value="">Todos</option>
          <option value="tienda">Tienda</option>
          <option value="mayoreo">Mayoreo / sobre pedido</option>
        </select>
      </label>
      <label className="text-sm font-medium">
        Sucursal
        <select name="sucursal" defaultValue={filtros.sucursal ?? ""} className={`${campo} block`}>
          <option value="">Todas</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium">
        Desde
        <input type="date" name="desde" defaultValue={filtros.desde ?? ""} className={`${campo} block`} />
      </label>
      <label className="text-sm font-medium">
        Hasta
        <input type="date" name="hasta" defaultValue={filtros.hasta ?? ""} className={`${campo} block`} />
      </label>
      <button type="submit" className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white">
        Filtrar
      </button>
      <Link href={accion} className="py-2 text-sm text-suave underline">
        Limpiar
      </Link>
    </form>
  );
}
