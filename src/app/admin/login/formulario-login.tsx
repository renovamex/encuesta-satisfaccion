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
        <label htmlFor="email" className="block text-sm font-medium text-marca">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-1 w-full rounded-lg border border-borde px-3 py-2 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-marca">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-borde px-3 py-2 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
        />
      </div>
      {mensaje ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {mensaje}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-lg bg-marca px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
