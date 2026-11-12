"use client";

import { useActionState } from "react";
import type { EstadoSucursal } from "./actions";

type Accion = (prev: EstadoSucursal, formData: FormData) => Promise<EstadoSucursal>;
type Valores = { nombre: string; slug: string; url_resena_google: string | null; activa: boolean };

const campo =
  "mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40";

export function FormSucursal({
  accion,
  valores,
  etiquetaBoton,
}: {
  accion: Accion;
  valores?: Valores;
  etiquetaBoton: string;
}) {
  const [estado, enviar, pendiente] = useActionState(accion, {});

  return (
    <form action={enviar} className="grid gap-3.5 sm:grid-cols-2">
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Nombre de Sucursal
        <input name="nombre" required defaultValue={valores?.nombre} className={campo} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Identificador Slug (URL)
        <input name="slug" required defaultValue={valores?.slug} className={campo} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave sm:col-span-2">
        Enlace directo de reseña en Google Business
        <input
          name="url_resena_google"
          type="url"
          defaultValue={valores?.url_resena_google ?? ""}
          placeholder="https://g.page/r/.../review"
          className={campo}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-marca cursor-pointer">
        <input
          type="checkbox"
          name="activa"
          defaultChecked={valores?.activa ?? true}
          className="h-4 w-4 rounded border-borde text-acento focus:ring-acento"
        />
        Sucursal Activa para Encuestas
      </label>
      <div className="flex items-center gap-3 sm:justify-end">
        {estado.error ? (
          <span role="alert" className="text-xs font-bold text-red-700">
            {estado.error}
          </span>
        ) : null}
        {estado.ok ? <span className="text-xs font-bold text-emerald-700">✓ Guardado</span> : null}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-xl bg-marca px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm hover:bg-marca-oscuro transition disabled:opacity-60 cursor-pointer"
        >
          {pendiente ? "Guardando…" : etiquetaBoton}
        </button>
      </div>
    </form>
  );
}
