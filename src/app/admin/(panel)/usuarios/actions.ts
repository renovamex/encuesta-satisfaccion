"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type EstadoUsuario = { error?: string; ok?: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function crearUsuario(_prev: EstadoUsuario, formData: FormData): Promise<EstadoUsuario> {
  await requerirAdmin();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = formData.get("rol") === "admin" ? "admin" : "equipo";

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!EMAIL.test(email)) return { error: "El correo no es válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const { error } = await supabaseAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
    app_metadata: { rol }, // lo lee el trigger que crea el perfil; el usuario no puede modificarlo
  });
  if (error) {
    return { error: /already|registered|exists/i.test(error.message) ? "Ya existe un usuario con ese correo." : "No se pudo crear el usuario." };
  }
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function actualizarUsuario(id: string, formData: FormData) {
  const yo = await requerirAdmin();
  // Un admin no puede quitarse a sí mismo el rol ni desactivarse.
  if (id === yo.id) return;
  const rol = formData.get("rol") === "admin" ? "admin" : "equipo";
  const activo = formData.get("activo") === "on";

  const supabase = supabaseAdmin();
  await supabase.from("perfiles").update({ rol, activo }).eq("id", id);
  // Mantiene app_metadata alineado con el perfil.
  await supabase.auth.admin.updateUserById(id, { app_metadata: { rol } });
  revalidatePath("/admin/usuarios");
}
