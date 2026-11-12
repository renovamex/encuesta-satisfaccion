"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "./actions";

const inicial: EstadoLogin = {};

export function FormularioLogin({ aviso }: { aviso?: string }) {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, inicial);
  const mensaje = estado.error ?? aviso;

  return (
    <form action={accion} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-marca">
          Correo corporativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="nombre@renovamexico.com"
          className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2.5 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-marca">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2.5 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
        />
      </div>
      {mensaje ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
          {mensaje}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-acento px-4 py-3 font-extrabold text-sobre-acento shadow-sm hover:bg-acento-dorado transition disabled:opacity-60 cursor-pointer min-h-[44px]"
      >
        {pendiente ? "Iniciando sesión…" : "Entrar al panel"}
      </button>
    </form>
  );
}
