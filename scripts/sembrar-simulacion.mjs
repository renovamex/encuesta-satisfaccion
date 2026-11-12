// scripts/sembrar-simulacion.mjs
// Inserta al menos 12 respuestas simuladas y variadas (tienda y mayoreo)
// para visualizar métricas, filtros y alertas de seguimiento.
// Uso: node --env-file=.env.local scripts/sembrar-simulacion.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function sembrar() {
  console.log("Consultando sucursales activas...");
  const { data: sucursales, error: errSuc } = await supabase
    .from("sucursales")
    .select("id, slug, nombre")
    .eq("activa", true);

  if (errSuc || !sucursales || sucursales.length === 0) {
    console.error("No se pudieron cargar sucursales:", errSuc?.message || "Sin sucursales");
    process.exit(1);
  }

  const porSlug = Object.fromEntries(sucursales.map((s) => [s.slug, s.id]));
  console.log(`Sucursales encontradas: ${Object.keys(porSlug).join(", ")}`);

  const ahora = new Date();
  const haceDias = (dias, horas = 0) => {
    const f = new Date(ahora.getTime() - (dias * 24 * 60 + horas * 60) * 60 * 1000);
    return f.toISOString();
  };

  const simulaciones = [
    {
      canal: "tienda",
      sucursal_id: porSlug["atizapan"],
      numero_pedido: "ATZ-8041",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 5,
      nps: 10,
      comentario: "Excelente trato del asesor Roberto. El piso rectificado llegó al día siguiente a mi obra en Zona Esmeralda. Muy recomendados.",
      monto_ticket: 34800.0,
      creada_en: haceDias(4, 3),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["atizapan"],
      numero_pedido: "ATZ-8042",
      satisfaccion: 4,
      atencion: 5,
      producto_entrega: 4,
      nps: 8,
      comentario: "Buen material y atención rápida. Solo sugiero ampliar la exhibición de grifería para baño.",
      monto_ticket: 8950.0,
      creada_en: haceDias(3, 1),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["tepotzotlan"],
      numero_pedido: "TEP-1920",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 5,
      nps: 10,
      comentario: "Todo en orden. Tenían los bultos de pegazulejo y boquilla en stock inmediato para llevar en camioneta.",
      monto_ticket: 4200.0,
      creada_en: haceDias(3, 5),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["tepotzotlan"],
      numero_pedido: "TEP-1925",
      satisfaccion: 2,
      atencion: 2,
      producto_entrega: 3,
      nps: 4,
      comentario: "El asesor tardó más de 20 minutos en atenderme porque estaba ocupado en el teléfono. El producto bien, pero el servicio en caja fue lento.",
      monto_ticket: 6700.0,
      creada_en: haceDias(2, 2),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["tepojaco"],
      numero_pedido: "TPJ-3301",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 4,
      nps: 9,
      comentario: "Gran variedad de modelos de azulejo tipo madera. Quedó muy bien colocado en la cocina.",
      monto_ticket: 14500.0,
      creada_en: haceDias(2, 6),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["tepojaco"],
      numero_pedido: "TPJ-3308",
      satisfaccion: 1,
      atencion: 3,
      producto_entrega: 1,
      nps: 2,
      comentario: "Venían 3 cajas de porcelanato con esquinas rotas en el flete. Necesito reposición urgente de mi lote porque la obra está parada.",
      monto_ticket: 22400.0,
      creada_en: haceDias(1, 4),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["cuautitlan-izcalli"],
      numero_pedido: "CUA-5012",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 5,
      nps: 10,
      comentario: "La mejor tienda de acabados en Izcalli. Cumplieron con la entrega en menos de 24 horas y me calcularon los metros exactos.",
      monto_ticket: 48900.0,
      creada_en: haceDias(1, 8),
    },
    {
      canal: "tienda",
      sucursal_id: porSlug["cuautitlan-izcalli"],
      numero_pedido: "CUA-5019",
      satisfaccion: 3,
      atencion: 4,
      producto_entrega: 3,
      nps: 6,
      comentario: "El chofer no quiso ayudar a descargar los bultos a la banqueta interior, aunque la atención en tienda fue buena.",
      monto_ticket: 11200.0,
      creada_en: haceDias(0, 10),
    },
    {
      canal: "mayoreo",
      sucursal_id: porSlug["atizapan"],
      numero_pedido: "MAY-901",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 5,
      nps: 10,
      comentario: "Excelente servicio para contratistas. Facturación inmediata y lote completo entregado en tiempo para el conjunto habitacional.",
      monto_ticket: 125000.0,
      creada_en: haceDias(4, 2),
    },
    {
      canal: "mayoreo",
      sucursal_id: porSlug["tepotzotlan"],
      numero_pedido: "MAY-902",
      satisfaccion: 4,
      atencion: 5,
      producto_entrega: 4,
      nps: 8,
      comentario: "Buen surtido en sanitarios y tarjas sobre pedido. Muy buena comunicación por WhatsApp con el ejecutivo.",
      monto_ticket: 54000.0,
      creada_en: haceDias(2, 4),
    },
    {
      canal: "mayoreo",
      sucursal_id: porSlug["cuautitlan-izcalli"],
      numero_pedido: "MAY-903",
      satisfaccion: 2,
      atencion: 2,
      producto_entrega: 2,
      nps: 3,
      comentario: "Hubo un retraso de 3 días en el despacho del adhesivo especial que me prometieron para el martes. Me afectó con el cliente final.",
      monto_ticket: 78000.0,
      creada_en: haceDias(1, 1),
    },
    {
      canal: "mayoreo",
      sucursal_id: porSlug["tepojaco"],
      numero_pedido: "MAY-904",
      satisfaccion: 5,
      atencion: 5,
      producto_entrega: 5,
      nps: 10,
      comentario: "Los adhesivos ADE100 salieron de excelente calidad y el precio por tarima es muy competitivo.",
      monto_ticket: 38600.0,
      creada_en: haceDias(0, 2),
    },
  ];

  console.log(`Insertando ${simulaciones.length} respuestas de prueba...`);

  for (const item of simulaciones) {
    const { error } = await supabase.from("respuestas").upsert(
      {
        canal: item.canal,
        sucursal_id: item.sucursal_id,
        numero_pedido: item.numero_pedido,
        satisfaccion: item.satisfaccion,
        atencion: item.atencion,
        producto_entrega: item.producto_entrega,
        nps: item.nps,
        comentario: item.comentario,
        monto_ticket: item.monto_ticket,
        creada_en: item.creada_en,
        version_cuestionario: 1,
      },
      { onConflict: "canal,sucursal_id,numero_pedido" }
    );

    if (error) {
      console.error(`Error al insertar ${item.numero_pedido}:`, error.message);
    } else {
      console.log(`✓ Insertada respuesta pedido ${item.numero_pedido} (${item.canal} - ${item.nps >= 9 ? "Promotor" : item.nps <= 6 ? "Detractor (alerta)" : "Pasivo"})`);
    }
  }

  console.log("\n¡Simulación completada con éxito!");
}

sembrar().catch((e) => {
  console.error("Error inesperado:", e);
  process.exit(1);
});
