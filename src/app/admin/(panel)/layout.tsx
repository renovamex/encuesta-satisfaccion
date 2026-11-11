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
    <div className="min-h-screen">
      <header className="bg-marca text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-semibold">Renova · Satisfacción</span>
          <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className="text-white/80 hover:text-white">
                {e.texto}
              </Link>
            ))}
          </nav>
          <form action={cerrarSesion} className="flex items-center gap-3 text-sm">
            <span className="text-white/70">{perfil.nombre || perfil.email}</span>
            <button type="submit" className="rounded-md border border-white/30 px-3 py-1 hover:bg-white/10">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
