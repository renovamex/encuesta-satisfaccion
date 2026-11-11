import { NextRequest } from "next/server";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { aplicarFiltros, leerFiltros } from "@/lib/filtros";

const LOTE = 1000; // tope por consulta de PostgREST
const MAX_FILAS = 50_000;

const ENCABEZADOS = [
  "fecha",
  "canal",
  "sucursal",
  "numero_pedido",
  "satisfaccion",
  "nps",
  "atencion",
  "producto_entrega",
  "monto_ticket",
  "comentario",
];

function celda(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  let texto = String(valor);
  // Evita que Excel interprete el contenido como fórmula (inyección CSV).
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export async function GET(request: NextRequest) {
  await requerirPerfil();
  const filtros = leerFiltros(Object.fromEntries(request.nextUrl.searchParams));
  const supabase = await supabaseServer();

  const lineas: string[] = [ENCABEZADOS.join(",")];
  for (let desde = 0; desde < MAX_FILAS; desde += LOTE) {
    const { data, error } = await aplicarFiltros(
      supabase
        .from("respuestas")
        .select(
          "creada_en, canal, numero_pedido, satisfaccion, nps, atencion, producto_entrega, monto_ticket, comentario, sucursales(nombre)",
        ),
      filtros,
    )
      .order("creada_en", { ascending: false })
      .order("id")
      .range(desde, desde + LOTE - 1);

    if (error) return new Response("No se pudo generar el archivo.", { status: 500 });
    for (const r of data ?? []) {
      const sucursal = r.sucursales as unknown as { nombre: string } | null;
      lineas.push(
        [
          r.creada_en,
          r.canal,
          sucursal?.nombre,
          r.numero_pedido,
          r.satisfaccion,
          r.nps,
          r.atencion,
          r.producto_entrega,
          r.monto_ticket,
          r.comentario,
        ]
          .map(celda)
          .join(","),
      );
    }
    if ((data ?? []).length < LOTE) break;
  }

  const hoy = new Date().toISOString().slice(0, 10);
  // BOM para que Excel abra bien los acentos.
  return new Response("﻿" + lineas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="respuestas-renova-${hoy}.csv"`,
    },
  });
}
