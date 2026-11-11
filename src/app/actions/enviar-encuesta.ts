"use server";

import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { excedeLimite } from "@/lib/rate-limit";
import {
  pedidoSchema,
  respuestasSchema,
  VERSION_CUESTIONARIO,
  type EstadoEnvio,
  type ResultadoEnvio,
} from "@/lib/encuesta";

async function ipCliente() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}

function leerRespuestas(formData: FormData) {
  return respuestasSchema.safeParse({
    satisfaccion: formData.get("satisfaccion"),
    atencion: formData.get("atencion"),
    producto_entrega: formData.get("producto_entrega"),
    nps: formData.get("nps"),
    comentario: (formData.get("comentario") as string | null) ?? undefined,
  });
}

const ERROR_FALTANTES: ResultadoEnvio = {
  errores: { general: "Responde todas las preguntas de calificación para continuar." },
};

export async function enviarEncuestaTienda(
  slug: string,
  _prev: ResultadoEnvio,
  formData: FormData,
): Promise<ResultadoEnvio> {
  // Honeypot: un humano no llena este campo oculto.
  if (formData.get("sitio_web")) return { estado: "ok", urlResena: null };
  if (excedeLimite(`tienda:${await ipCliente()}`)) return { estado: "limite" };

  const pedido = pedidoSchema.safeParse(formData.get("numero_pedido") ?? "");
  if (!pedido.success) return { errores: { numero_pedido: pedido.error.issues[0].message } };

  const respuestas = leerRespuestas(formData);
  if (!respuestas.success) return ERROR_FALTANTES;
  const r = respuestas.data;

  const { data, error } = await supabaseAdmin().rpc("registrar_respuesta_tienda", {
    p_sucursal_slug: slug,
    p_numero_pedido: pedido.data,
    p_satisfaccion: r.satisfaccion,
    p_nps: r.nps,
    p_atencion: r.atencion,
    p_producto_entrega: r.producto_entrega,
    p_comentario: r.comentario ?? "",
    p_version: VERSION_CUESTIONARIO,
  });
  if (error) {
    console.error("registrar_respuesta_tienda", error);
    return { errores: { general: "No pudimos guardar tu respuesta. Inténtalo de nuevo." } };
  }
  const res = data as { estado: EstadoEnvio; url_resena_google?: string | null };
  return { estado: res.estado, urlResena: res.url_resena_google ?? null };
}

export async function enviarEncuestaMayoreo(
  token: string,
  _prev: ResultadoEnvio,
  formData: FormData,
): Promise<ResultadoEnvio> {
  if (formData.get("sitio_web")) return { estado: "ok" };
  if (excedeLimite(`mayoreo:${await ipCliente()}`)) return { estado: "limite" };

  const respuestas = leerRespuestas(formData);
  if (!respuestas.success) return ERROR_FALTANTES;
  const r = respuestas.data;

  const { data, error } = await supabaseAdmin().rpc("registrar_respuesta_mayoreo", {
    p_token: token,
    p_satisfaccion: r.satisfaccion,
    p_nps: r.nps,
    p_atencion: r.atencion,
    p_producto_entrega: r.producto_entrega,
    p_comentario: r.comentario ?? "",
    p_version: VERSION_CUESTIONARIO,
  });
  if (error) {
    console.error("registrar_respuesta_mayoreo", error);
    return { errores: { general: "No pudimos guardar tu respuesta. Inténtalo de nuevo." } };
  }
  return { estado: (data as { estado: EstadoEnvio }).estado };
}
