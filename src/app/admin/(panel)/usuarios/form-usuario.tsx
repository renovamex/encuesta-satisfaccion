"use client";

import { useActionState } from "react";
import { crearUsuario, type EstadoUsuario } from "./actions";

const inicial: EstadoUsuario = {};
const campo =
  "mt-1 w-full rounded-lg border border-borde px-3 py-2 text-sm outline-none focus:border-acento focus:ring-2 focus:ring-acento/30";

export function FormUsuario() {
  const [estado, accion, pendiente] = useActionState(crearUsuario, inicial);

  return (
    <form action={accion} className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">
        Nombre
        <input name="nombre" required className={campo} />
      </label>
      <label className="text-sm font-medium">
        Correo
        <input name="email" type="email" required autoComplete="off" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Contraseña inicial
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={campo} />
      </label>
      <label className="text-sm font-medium">
        Rol
        <select name="rol" defaultValue="equipo" className={`${campo} bg-white`}>
          <option value="equipo">Equipo (comercial, soporte, asesores)</option>
          <option value="admin">Administrador</option>
        </select>
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pendiente ? "Creando…" : "Crear usuario"}
        </button>
        {estado.error ? (
          <span role="alert" className="text-sm text-red-700">
            {estado.error}
          </span>
        ) : null}
        {estado.ok ? <span className="text-sm text-green-700">Usuario creado</span> : null}
      </div>
    </form>
  );
}
