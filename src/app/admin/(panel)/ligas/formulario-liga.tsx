"use client";

import { useActionState, useState } from "react";
import { crearLiga, type EstadoCrearLiga } from "./actions";

type Sucursal = { id: string; nombre: string };

const inicial: EstadoCrearLiga = {};

export function mensajeWhatsApp(url: string) {
  return `Hola, gracias por tu compra en Renova. Nos ayudarías mucho contestando una breve encuesta sobre tu experiencia (menos de un minuto): ${url}`;
}

export function BotonesCompartir({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);
  const mensaje = mensajeWhatsApp(url);

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
    <div className="flex flex-wrap gap-2.5">
      <button
        type="button"
        onClick={copiar}
        className="rounded-xl border border-borde bg-white px-4 py-2 text-xs font-bold text-marca shadow-xs hover:bg-slate-50 transition cursor-pointer"
      >
        {copiado ? "✓ ¡Mensaje Copiado!" : "📋 Copiar mensaje"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2 text-xs font-extrabold text-white shadow-xs transition"
      >
        <span>💬 Enviar por WhatsApp</span>
      </a>
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
        Genera un enlace único de un solo uso con caducidad a 30 días para enviar por WhatsApp.
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
            className="mt-1.5 w-full rounded-xl border border-borde bg-white px-3.5 py-2 text-sm text-marca outline-none transition focus:border-acento-dorado focus:ring-2 focus:ring-acento/40 font-medium"
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
            Referencia del cliente <span className="font-normal text-suave">(opcional, interna)</span>
          </label>
          <input
            id="referencia_cliente"
            name="referencia_cliente"
            maxLength={120}
            placeholder="Ej. Arq. Daniel / Obra Bosques"
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
        <div className="mt-6 rounded-2xl border border-acento-dorado/60 bg-amber-50/50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Liga activa para el pedido <strong className="text-marca">{estado.numeroPedido}</strong>
          </p>
          <p className="mt-2 break-all rounded-xl bg-white border border-borde p-3 font-mono text-xs text-slate-800">
            {url}
          </p>
          <div className="mt-4">
            <BotonesCompartir url={url} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
