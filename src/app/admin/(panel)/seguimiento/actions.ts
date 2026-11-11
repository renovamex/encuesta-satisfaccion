"use server";

import { revalidatePath } from "next/cache";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

const ESTADOS = ["pendiente", "atendido", "cerrado"] as const;

export async function actualizarSeguimiento(respuestaId: string, formData: FormData) {
  const perfil = await requerirPerfil();
  const estado = String(formData.get("estado"));
  if (!(ESTADOS as readonly string[]).includes(estado)) return;
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 1000) || null;

  const supabase = await supabaseServer();
  await supabase
    .from("seguimientos")
    .update({
      estado,
      nota,
      atendido_por: estado === "pendiente" ? null : perfil.id,
    })
    .eq("respuesta_id", respuestaId);

  revalidatePath("/admin/seguimiento");
  revalidatePath("/admin");
}
