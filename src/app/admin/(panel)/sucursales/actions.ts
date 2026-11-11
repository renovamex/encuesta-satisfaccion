"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export type EstadoSucursal = { error?: string; ok?: boolean };

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function leer(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const url = String(formData.get("url_resena_google") ?? "").trim();
  const activa = formData.get("activa") === "on";

  if (!nombre) return { error: "El nombre es obligatorio." } as const;
  if (!SLUG.test(slug)) return { error: "El identificador solo admite minúsculas, números y guiones." } as const;
  if (url) {
    try {
      if (new URL(url).protocol !== "https:") throw new Error();
    } catch {
      return { error: "El enlace de Google debe ser una URL https válida." } as const;
    }
  }
  return { valores: { nombre, slug, url_resena_google: url || null, activa } } as const;
}

export async function crearSucursal(_prev: EstadoSucursal, formData: FormData): Promise<EstadoSucursal> {
  await requerirAdmin();
  const r = leer(formData);
  if ("error" in r) return { error: r.error };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("sucursales").insert(r.valores);
  if (error) {
    return { error: error.code === "23505" ? "Ya existe una sucursal con ese identificador." : "No se pudo crear." };
  }
  revalidatePath("/admin/sucursales");
  return { ok: true };
}

export async function guardarSucursal(id: string, _prev: EstadoSucursal, formData: FormData): Promise<EstadoSucursal> {
  await requerirAdmin();
  const r = leer(formData);
  if ("error" in r) return { error: r.error };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("sucursales").update(r.valores).eq("id", id);
  if (error) {
    return { error: error.code === "23505" ? "Ya existe una sucursal con ese identificador." : "No se pudo guardar." };
  }
  revalidatePath("/admin/sucursales");
  return { ok: true };
}
