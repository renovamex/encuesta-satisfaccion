import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type Perfil = {
  id: string;
  nombre: string;
  email: string;
  rol: "admin" | "equipo";
};

/** Devuelve el perfil activo del usuario en sesión o manda al login. */
export async function requerirPerfil(): Promise<Perfil> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, nombre, rol, activo")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil || !perfil.activo) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=sin_acceso");
  }
  return { id: perfil.id, nombre: perfil.nombre, email: user.email ?? "", rol: perfil.rol };
}

export async function requerirAdmin(): Promise<Perfil> {
  const perfil = await requerirPerfil();
  if (perfil.rol !== "admin") redirect("/admin");
  return perfil;
}
