"use client";

import { useActionState, useState } from "react";
import { crearLiga, type EstadoCrearLiga } from "./actions";

type Sucursal = { id: string; nombre: string };

const inicial: EstadoCrearLiga = {};

export const PLANTILLAS_WHATSAPP = [
  {
    id: "general",
    nombre: "General / Obra y Mostrador",
    descripcion: "Para la mayoría de pedidos de sobre pedido o mayoreo.",
    generar: (url: string, pedido: string, ref: string) => {
      const saludo = ref ? `Hola ${ref},` : "Hola,";
      const ped = pedido ? ` ${pedido}` : "";
      return `${saludo} te saludamos de Renova.\n\nConfirmamos la entrega de tu pedido${ped}. En Renova queremos asegurarnos de que todo haya llegado en orden y a tiempo para tu proyecto.\n\n¿Nos ayudas con una breve evaluación de 1 minuto sobre tu experiencia?\n👉 ${url}\n\nMuchas gracias por tu confianza. Tu proyecto no se detiene.`;
    },
  },
  {
    id: "contratista",
    nombre: "Contratistas e Instaladores",
    descripcion: "Enfocado en tiempos de entrega, stock y avance de obra.",
    generar: (url: string, pedido: string, ref: string) => {
      const saludo = ref ? `Hola ${ref}, qué tal.` : "Hola, qué tal.";
      const ped = pedido ? ` ${pedido}` : "";
      return `${saludo} Te saludamos de Renova.\n\nLe dimos seguimiento al despacho de tu pedido${ped}. Nuestro compromiso es que tu obra no se detenga y que cuentes con el material a tiempo.\n\nTe comparto esta liga rápida (toma menos de 1 minuto) para calificar la entrega y la atención:\n👉 ${url}\n\nNos ayuda mucho a darte el mejor servicio en tus siguientes compras. Saludos.`;
    },
  },
  {
    id: "arquitecto",
    nombre: "Arquitectos y Diseñadores",
    descripcion: "Tono profesional enfocado en especificaciones y cumplimiento.",
    generar: (url: string, pedido: string, ref: string) => {
      const saludo = ref ? `Estimado/a ${ref}, gusto en saludarte.` : "Gusto en saludarte.";
      const ped = pedido ? ` ${pedido}` : "";
      return `${saludo} Te escribimos del equipo de Renova.\n\nDando seguimiento al pedido${ped} para tu proyecto, esperamos que los acabados y materiales hayan cumplido con todas tus especificaciones.\n\nNos ayudarías mucho respondiendo esta breve encuesta de satisfacción sobre la atención y el tiempo de entrega:\n👉 ${url}\n\nGracias por confiar en nosotros para tus proyectos. Quedamos a tus órdenes.`;
    },
  },
  {
    id: "residencial",
    nombre: "Residencial / Hogar (Sobre pedido)",
    descripcion: "Cálido y enfocado en la remodelación del hogar.",
    generar: (url: string, pedido: string, ref: string) => {
      const saludo = ref ? `Hola ${ref},` : "Hola,";
      const ped = pedido ? ` especial ${pedido}` : "";
      return `${saludo} te saludamos de Renova.\n\nEsperamos que los materiales de tu pedido${ped} hayan llegado en perfectas condiciones y que la remodelación de tus espacios vaya excelente.\n\n¿Nos regalas un minuto para conocer tu opinión sobre nuestro servicio y entrega?\n👉 ${url}\n\nGracias por elegir a Renova. ¡Renova es confianza en cada paso!`;
    },
  },
];

export function BotonCopiarFila({
  url,
  numeroPedido = "",
  referencia = "",
}: {
  url: string;
  numeroPedido?: string;
  referencia?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const mensaje = PLANTILLAS_WHATSAPP[0].generar(url, numeroPedido, referencia);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia el mensaje:", mensaje);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={copiar}
        title="Copiar mensaje con liga"
        className="rounded-lg border border-borde bg-white px-2.5 py-1 text-xs font-bold text-marca hover:bg-slate-50 transition cursor-pointer"
      >
        {copiado ? "✓ Copiado" : "📋 Copiar"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir WhatsApp"
        className="rounded-lg bg-[#25D366] hover:bg-[#20bd5a] px-2.5 py-1 text-xs font-bold text-white transition"
      >
        WhatsApp
      </a>
    </div>
  );
}

export function BotonesCompartir({
  url,
  numeroPedido = "",
  referencia = "",
}: {
  url: string;
  numeroPedido?: string;
  referencia?: string;
}) {
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("general");
  const [copiado, setCopiado] = useState(false);

  const plantillaActual =
    PLANTILLAS_WHATSAPP.find((p) => p.id === plantillaSeleccionada) ?? PLANTILLAS_WHATSAPP[0];
  const mensaje = plantillaActual.generar(url, numeroPedido, referencia);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copia el mensaje:", mensaje);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
          Selecciona la plantilla según el perfil del cliente:
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {PLANTILLAS_WHATSAPP.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlantillaSeleccionada(p.id)}
              className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                plantillaSeleccionada === p.id
                  ? "border-acento-dorado bg-white shadow-xs ring-2 ring-acento/40"
                  : "border-borde/70 bg-white/70 hover:bg-white text-suave"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-marca">{p.nombre}</span>
                {plantillaSeleccionada === p.id ? (
                  <span className="h-2 w-2 rounded-full bg-acento" />
                ) : null}
              </div>
              <p className="mt-0.5 text-[11px] text-suave line-clamp-1">{p.descripcion}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-suave mb-1">
          Vista previa del mensaje listo para enviar:
        </label>
        <div className="rounded-xl border border-borde bg-white p-3.5 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans shadow-xs">
          {mensaje}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={copiar}
          className="rounded-xl border border-borde bg-white px-4 py-2.5 text-xs font-bold text-marca shadow-xs hover:bg-slate-50 transition cursor-pointer inline-flex items-center gap-1.5"
        >
          {copiado ? "✓ ¡Mensaje Copiado!" : "📋 Copiar mensaje completo"}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition"
        >
          <span>💬 Abrir en WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export function FormularioLiga({ sucursales, baseUrl }: { sucursales: Sucursal[]; baseUrl: string }) {
  const [estado, accion, pendiente] = useActionState(crearLiga, inicial);
  const url = estado.token ? `${baseUrl}/e/${estado.token}` : null;

  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-6 shadow-[0_8px_24px_rgba(32,32,32,0.06)]">
      <h2 className="font-extrabold text-marca font-heading text-lg">Nueva liga de encuesta para Mayoreo / Sobre Pedido</h2>
      <p className="text-xs text-suave mt-0.5">
        Genera un enlace único de un solo uso con caducidad a 30 días para enviar por WhatsApp al cliente.
      </p>

      <form action={accion} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="numero_pedido" className="block text-xs font-bold uppercase tracking-wider text-marca">
            Número de pedido <span className="text-red-600">*</span>
          </label>
          <input
            id="numero_pedido"
            name="numero_pedido"
            required
            maxLength={40}
            autoComplete="off"
            placeholder="EJ. MAY-1050"
            className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm font-bold uppercase text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
          />
        </div>
        <div>
          <label htmlFor="sucursal_id" className="block text-xs font-bold uppercase tracking-wider text-marca">
            Sucursal que surtió
          </label>
          <select
            id="sucursal_id"
            name="sucursal_id"
            defaultValue=""
            className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40 font-medium cursor-pointer"
          >
            <option value="">No aplica / CEDIS</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="referencia_cliente" className="block text-xs font-bold uppercase tracking-wider text-marca">
            Nombre / Referencia del cliente <span className="font-normal text-suave">(opcional)</span>
          </label>
          <input
            id="referencia_cliente"
            name="referencia_cliente"
            maxLength={120}
            placeholder="Ej. Arq. Daniel / Ing. Martínez"
            className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
          />
        </div>
        <div>
          <label htmlFor="monto_ticket" className="block text-xs font-bold uppercase tracking-wider text-marca">
            Monto del pedido en MXN <span className="font-normal text-suave">(opcional)</span>
          </label>
          <input
            id="monto_ticket"
            name="monto_ticket"
            inputMode="decimal"
            placeholder="0.00"
            className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40"
          />
        </div>
        <div className="sm:col-span-2 pt-2">
          {estado.error ? (
            <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
              {estado.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pendiente}
            className="rounded-xl bg-acento px-6 py-3 text-sm font-extrabold text-sobre-acento shadow-sm hover:bg-acento-dorado transition disabled:opacity-60 cursor-pointer"
          >
            {pendiente ? "Generando liga…" : "Generar liga única"}
          </button>
        </div>
      </form>

      {url ? (
        <div className="mt-6 rounded-2xl border border-acento-dorado/60 bg-amber-50/50 p-6">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Liga generada para el pedido <strong className="text-marca text-sm">{estado.numeroPedido}</strong>
            </p>
            <span className="rounded-full bg-amber-200/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
              Vigencia 30 días · 1 solo uso
            </span>
          </div>

          <p className="mb-4 break-all rounded-xl bg-white border border-borde p-3 font-mono text-xs text-slate-800 shadow-xs">
            {url}
          </p>

          <BotonesCompartir
            url={url}
            numeroPedido={estado.numeroPedido ?? ""}
            referencia={estado.referenciaCliente ?? ""}
          />
        </div>
      ) : null}
    </div>
  );
}
