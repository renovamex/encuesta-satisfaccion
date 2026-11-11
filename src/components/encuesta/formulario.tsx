"use client";

import { useActionState, useEffect } from "react";
import {
  ETIQUETAS_ESCALA,
  PREGUNTA_NPS,
  PREGUNTAS_ESCALA,
  type ResultadoEnvio,
} from "@/lib/encuesta";
import { PantallaMensaje } from "./marco";

type Props = {
  accion: (prev: ResultadoEnvio, formData: FormData) => Promise<ResultadoEnvio>;
  /** Tienda: el cliente teclea el pedido. Mayoreo: ya viene en la liga. */
  pedirNumeroPedido: boolean;
  redirigirAGoogle: boolean;
};

const inicial: ResultadoEnvio = {};
const REDIRECCION_MS = 3000;

export function FormularioEncuesta({ accion, pedirNumeroPedido, redirigirAGoogle }: Props) {
  const [resultado, enviar, pendiente] = useActionState(accion, inicial);

  const urlResena = resultado.estado === "ok" && redirigirAGoogle ? resultado.urlResena : null;
  useEffect(() => {
    if (!urlResena) return;
    const t = setTimeout(() => window.location.assign(urlResena), REDIRECCION_MS);
    return () => clearTimeout(t);
  }, [urlResena]);

  if (resultado.estado === "ok") {
    return (
      <PantallaMensaje
        titulo="¡Gracias por tu opinión!"
        texto={
          urlResena
            ? "Ya registramos tu respuesta. Te llevamos a Google Maps para que, si quieres, nos dejes una reseña."
            : "Ya registramos tu respuesta. Nos ayuda a mejorar cada día."
        }
      >
        {urlResena ? (
          <a
            href={urlResena}
            className="mt-5 inline-block rounded-xl bg-acento px-5 py-3 font-semibold text-white"
          >
            Dejar reseña en Google
          </a>
        ) : null}
      </PantallaMensaje>
    );
  }
  if (resultado.estado === "duplicada") {
    return (
      <PantallaMensaje
        titulo="Ya recibimos tu encuesta"
        texto="Este número de pedido ya tiene una respuesta registrada. ¡Gracias por participar!"
      />
    );
  }
  if (resultado.estado === "ya_respondida") {
    return <PantallaMensaje titulo="Esta encuesta ya fue respondida" texto="Gracias por tu tiempo." />;
  }
  if (resultado.estado === "vencida") {
    return (
      <PantallaMensaje
        titulo="Esta liga ya venció"
        texto="Si quieres compartirnos tu experiencia, pídele una nueva liga a tu asesor."
      />
    );
  }
  if (resultado.estado === "invalida" || resultado.estado === "sucursal_invalida") {
    return (
      <PantallaMensaje
        titulo="Liga no válida"
        texto="Revisa que el enlace esté completo o pide uno nuevo a tu asesor."
      />
    );
  }
  if (resultado.estado === "limite") {
    return (
      <PantallaMensaje
        titulo="Demasiados intentos"
        texto="Espera unos minutos e inténtalo de nuevo."
      />
    );
  }

  const errores = resultado.errores ?? {};

  return (
    <form action={enviar} className="space-y-6" noValidate>
      {/* Honeypot: oculto para personas, los bots suelen llenarlo. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Sitio web
          <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {pedirNumeroPedido ? (
        <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
          <label htmlFor="numero_pedido" className="block font-medium text-marca">
            Número de pedido
          </label>
          <p className="mt-1 text-sm text-suave">Tu asesor te lo proporciona en el mostrador.</p>
          <input
            id="numero_pedido"
            name="numero_pedido"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={40}
            required
            aria-invalid={Boolean(errores.numero_pedido)}
            className="mt-3 w-full rounded-xl border border-borde px-4 py-3 text-lg uppercase outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
          />
          {errores.numero_pedido ? (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errores.numero_pedido}
            </p>
          ) : null}
        </div>
      ) : null}

      {PREGUNTAS_ESCALA.map(({ campo, texto }) => (
        <fieldset key={campo} className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
          <legend className="px-1 font-medium text-marca">{texto}</legend>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {ETIQUETAS_ESCALA.map((etiqueta, i) => (
              <label key={etiqueta} className="cursor-pointer text-center">
                <input type="radio" name={campo} value={i + 1} className="peer sr-only" required />
                <span className="flex h-12 items-center justify-center rounded-xl border border-borde text-lg font-semibold text-marca transition peer-checked:border-acento peer-checked:bg-acento peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-acento/50">
                  {i + 1}
                </span>
                <span className="mt-1 block text-[11px] leading-tight text-suave">{etiqueta}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
        <legend className="px-1 font-medium text-marca">{PREGUNTA_NPS}</legend>
        <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-11">
          {Array.from({ length: 11 }, (_, n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" name="nps" value={n} className="peer sr-only" required />
              <span className="flex h-11 items-center justify-center rounded-xl border border-borde font-semibold text-marca transition peer-checked:border-acento peer-checked:bg-acento peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-acento/50">
                {n}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-suave">
          <span>Nada probable</span>
          <span>Muy probable</span>
        </div>
      </fieldset>

      <div className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
        <label htmlFor="comentario" className="block font-medium text-marca">
          ¿Algo más que quieras contarnos? <span className="font-normal text-suave">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          name="comentario"
          rows={4}
          maxLength={2000}
          className="mt-3 w-full rounded-xl border border-borde px-4 py-3 outline-none focus:border-acento focus:ring-2 focus:ring-acento/30"
        />
      </div>

      {errores.general ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errores.general}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-xl bg-acento px-5 py-4 text-lg font-semibold text-white shadow-sm transition disabled:opacity-60"
      >
        {pendiente ? "Enviando…" : "Enviar respuestas"}
      </button>
    </form>
  );
}
