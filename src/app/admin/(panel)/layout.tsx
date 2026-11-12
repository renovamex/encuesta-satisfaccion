import Link from "next/link";
import type { ReactNode } from "react";
import { requerirPerfil } from "@/lib/auth";
import { cerrarSesion } from "../login/actions";

const ENLACES = [
  { href: "/admin", texto: "Dashboard" },
  { href: "/admin/respuestas", texto: "Respuestas" },
  { href: "/admin/seguimiento", texto: "Seguimiento" },
  { href: "/admin/ligas", texto: "Ligas mayoreo" },
];
const ENLACES_ADMIN = [
  { href: "/admin/sucursales", texto: "Sucursales" },
  { href: "/admin/usuarios", texto: "Usuarios" },
];

export default async function LayoutPanel({ children }: { children: ReactNode }) {
  const perfil = await requerirPerfil();
  const enlaces = perfil.rol === "admin" ? [...ENLACES, ...ENLACES_ADMIN] : ENLACES;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-marca text-white border-b-4 border-acento shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-heading font-black tracking-tight text-xl text-white">
                RENOVA
              </span>
              <span className="rounded bg-acento px-1.5 py-0.5 text-[11px] font-extrabold uppercase text-sobre-acento">
                Satisfacción
              </span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold">
            {enlaces.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="text-white/80 hover:text-acento transition py-1"
              >
                {e.texto}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-medium">{perfil.nombre || perfil.email}</span>
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-wider">
                ({perfil.rol})
              </span>
            </div>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
