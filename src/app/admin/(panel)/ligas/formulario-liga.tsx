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
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copiar}
        className="rounded-lg border border-borde px-3 py-1.5 text-sm font-medium text-marca hover:bg-background"
      >
        {copiado ? "¡Copiado!" : "Copiar mensaje"}
      </button>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[#1f9d55] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
      >
        Abrir WhatsApp
      </a>
    </div>
  );
}

export function FormularioLiga({ sucursales, baseUrl }: { sucursales: Sucursal[]; baseUrl: string }) {
  const [estado, accion, pendiente] = useActionState(crearLiga, inicial);
  const url = estado.token ? `${baseUrl}/e/${estado.token}` : null;

  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
      <h2 className="font-semibold text-marca">Nueva liga de encuesta</h2>
      <form action={accion} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="numero_pedido" className="block text-sm font-medium">
            Número de pedido <span className="text-red-600">*</span>
          </label>
          <input
            id="numero_pedido"
            name="numero_pedido"
            required
            maxLength={40}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-borde px-3 py-2 uppercase outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
          />
        </div>
        <div>
          <label htmlFor="sucursal_id" className="block text-sm font-medium">
            Sucursal que surtió
          </label>
          <select
            id="sucursal_id"
            name="sucursal_id"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-borde bg-white px-3 py-2 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
          >
            <option value="">No aplica</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="referencia_cliente" className="block text-sm font-medium">
            Referencia del cliente <span className="font-normal text-suave">(opcional, solo para ti)</span>
          </label>
          <input
            id="referencia_cliente"
            name="referencia_cliente"
            maxLength={120}
            className="mt-1 w-full rounded-lg border border-borde px-3 py-2 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
          />
        </div>
        <div>
          <label htmlFor="monto_ticket" className="block text-sm font-medium">
            Monto del ticket <span className="font-normal text-suave">(opcional)</span>
          </label>
          <input
            id="monto_ticket"
            name="monto_ticket"
            inputMode="decimal"
            placeholder="0.00"
            className="mt-1 w-full rounded-lg border border-borde px-3 py-2 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
          />
        </div>
        <div className="sm:col-span-2">
          {estado.error ? (
            <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {estado.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pendiente}
            className="rounded-lg bg-marca px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {pendiente ? "Generando…" : "Generar liga"}
          </button>
        </div>
      </form>

      {url ? (
        <div className="mt-5 rounded-xl bg-background p-4">
          <p className="text-sm text-suave">
            Liga para el pedido <strong className="text-foreground">{estado.numeroPedido}</strong>
          </p>
          <p className="mt-1 break-all font-mono text-sm">{url}</p>
          <div className="mt-3">
            <BotonesCompartir url={url} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
