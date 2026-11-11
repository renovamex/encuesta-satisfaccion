"use server";

import { revalidatePath } from "next/cache";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { pedidoSchema } from "@/lib/encuesta";

export type EstadoCrearLiga = {
  error?: string;
  token?: string;
  numeroPedido?: string;
};

/** Vacío → null; si no, número entre 0 y 99,999,999 (acepta "$1,234.50"). */
function leerMonto(valor: FormDataEntryValue | null): { ok: true; monto: number | null } | { ok: false } {
  const limpio = String(valor ?? "").replace(/[$,\s]/g, "");
  if (limpio === "") return { ok: true, monto: null };
  const n = Number(limpio);
  return Number.isFinite(n) && n >= 0 && n <= 99_999_999 ? { ok: true, monto: n } : { ok: false };
}

export async function crearLiga(_prev: EstadoCrearLiga, formData: FormData): Promise<EstadoCrearLiga> {
  const perfil = await requerirPerfil();

  const pedido = pedidoSchema.safeParse(formData.get("numero_pedido") ?? "");
  if (!pedido.success) return { error: pedido.error.issues[0].message };

  const monto = leerMonto(formData.get("monto_ticket"));
  if (!monto.ok) return { error: "El monto del ticket no es válido." };

  const sucursalId = String(formData.get("sucursal_id") ?? "") || null;
  const referencia = String(formData.get("referencia_cliente") ?? "").trim().slice(0, 120) || null;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("invitaciones_mayoreo")
    .insert({
      numero_pedido: pedido.data,
      sucursal_id: sucursalId,
      referencia_cliente: referencia,
      monto_ticket: monto.monto,
      creada_por: perfil.id,
    })
    .select("token, numero_pedido")
    .single();

  if (error) {
    // 23505 = índice único: ya hay una liga viva para este pedido.
    if (error.code === "23505") {
      return { error: "Ya existe una liga activa para ese pedido. Anúlala primero si necesitas generar otra." };
    }
    console.error("crearLiga", error);
    return { error: "No pudimos crear la liga. Inténtalo de nuevo." };
  }

  revalidatePath("/admin/ligas");
  return { token: data.token, numeroPedido: data.numero_pedido };
}

export async function anularLiga(id: string) {
  await requerirPerfil();
  const supabase = await supabaseServer();
  // Solo se anulan ligas aún no respondidas.
  await supabase
    .from("invitaciones_mayoreo")
    .update({ estado: "anulada" })
    .eq("id", id)
    .eq("estado", "enviada");
  revalidatePath("/admin/ligas");
}
