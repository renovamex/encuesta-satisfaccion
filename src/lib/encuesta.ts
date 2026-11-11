import { z } from "zod";

// Cuestionario v1 (fijo en código). Si cambia, subir VERSION_CUESTIONARIO.
export const VERSION_CUESTIONARIO = 1;

export const PREGUNTAS_ESCALA = [
  { campo: "satisfaccion", texto: "¿Qué tan satisfecho estás con tu experiencia en Renova?" },
  { campo: "atencion", texto: "¿Cómo calificas la atención de tu asesor?" },
  { campo: "producto_entrega", texto: "¿Cómo calificas el producto y el tiempo de entrega?" },
] as const;

export const ETIQUETAS_ESCALA = ["Muy mala", "Mala", "Regular", "Buena", "Excelente"] as const;

export const PREGUNTA_NPS = "¿Qué tan probable es que recomiendes Renova a un amigo o familiar?";

// Umbrales de alerta (deben coincidir con crear_seguimiento_si_aplica en la base).
export const UMBRAL_SATISFACCION_BAJA = 2;
export const UMBRAL_NPS_DETRACTOR = 6;

const escala = z.coerce.number().int().min(1).max(5);

export const respuestasSchema = z.object({
  satisfaccion: escala,
  atencion: escala,
  producto_entrega: escala,
  nps: z.coerce.number().int().min(0).max(10),
  comentario: z.string().trim().max(2000).optional(),
});

export const pedidoSchema = z
  .string()
  .trim()
  .min(1, "Escribe el número de pedido")
  .max(40, "El número de pedido es demasiado largo")
  .transform((v) => v.toUpperCase());

export type EstadoEnvio =
  | "ok"
  | "duplicada"
  | "sucursal_invalida"
  | "invalida"
  | "ya_respondida"
  | "vencida"
  | "limite";

export type ResultadoEnvio = {
  estado?: EstadoEnvio;
  errores?: Record<string, string>;
  urlResena?: string | null;
};
