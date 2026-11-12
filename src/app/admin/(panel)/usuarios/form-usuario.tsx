"use client";

import { useActionState } from "react";
import { crearUsuario, type EstadoUsuario } from "./actions";

const inicial: EstadoUsuario = {};
const campo =
  "mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40";

export function FormUsuario() {
  const [estado, accion, pendiente] = useActionState(crearUsuario, inicial);

  return (
    <form action={accion} className="grid gap-3.5 sm:grid-cols-2">
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Nombre Completo
        <input name="nombre" required placeholder="Nombre y Apellidos" className={campo} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Correo Corporativo
        <input name="email" type="email" required autoComplete="off" placeholder="usuario@renovamexico.com" className={campo} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Contraseña Inicial
        <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={campo} />
      </label>
      <label className="text-xs font-bold uppercase tracking-wider text-suave">
        Rol de Acceso
        <select name="rol" defaultValue="equipo" className={`${campo} font-medium`}>
          <option value="equipo">Equipo (consultas y ligas mayoreo)</option>
          <option value="admin">Administrador (acceso total a sucursales y usuarios)</option>
        </select>
      </label>
      <div className="flex items-center gap-3 sm:col-span-2 pt-2">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-xl bg-marca px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm hover:bg-marca-oscuro transition disabled:opacity-60 cursor-pointer"
        >
          {pendiente ? "Creando usuario…" : "Registrar colaborador"}
        </button>
        {estado.error ? (
          <span role="alert" className="text-xs font-bold text-red-700">
            {estado.error}
          </span>
        ) : null}
        {estado.ok ? <span className="text-xs font-bold text-emerald-700">✓ Usuario creado exitosamente</span> : null}
      </div>
    </form>
  );
}
