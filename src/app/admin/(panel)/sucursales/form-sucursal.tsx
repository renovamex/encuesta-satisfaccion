"use client";

import { useActionState } from "react";
import type { EstadoSucursal } from "./actions";

type Accion = (prev: EstadoSucursal, formData: FormData) => Promise<EstadoSucursal>;
type Valores = { nombre: string; slug: string; url_resena_google: string | null; activa: boolean };

const campo =
  "mt-1 w-full rounded-lg border border-borde px-3 py-2 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento/30";

export function FormSucursal({ accion, valores, etiquetaBoton }: { accion: Accion; valores?: Valores; etiquetaBoton: string }) {
  const [estado, enviar, pendiente] = useActionState(accion, {});

  return (
    <form action={enviar} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Nombre
        <input name="nombre" required defaultValue={valores?.nombre} className={campo} />
      </label>
      <label className="text-sm font-medium">
        Identificador en la URL
        <input name="slug" required defaultValue={valores?.slug} className={campo} />
      </label>
      <label className="text-sm font-medium sm:col-span-2">
        Enlace de reseña de Google Maps
        <input
          name="url_resena_google"
          type="url"
          defaultValue={valores?.url_resena_google ?? ""}
          placeholder="https://g.page/r/…/review"
          className={campo}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="activa" defaultChecked={valores?.activa ?? true} />
        Activa
      </label>
      <div className="flex items-center gap-3 sm:justify-end">
        {estado.error ? (
          <span role="alert" className="text-sm text-red-700">
            {estado.error}
          </span>
        ) : null}
        {estado.ok ? <span className="text-sm text-green-700">Guardado</span> : null}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : etiquetaBoton}
        </button>
      </div>
    </form>
  );
}
