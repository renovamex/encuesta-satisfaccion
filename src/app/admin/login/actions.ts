"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export type EstadoLogin = { error?: string };

export async function iniciarSesion(_prev: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect("/admin");
}

export async function cerrarSesion() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
