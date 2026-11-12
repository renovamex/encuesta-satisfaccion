"use client";

import { useState } from "react";

export function AccionesSucursal({ url, nombre }: { url: string; nombre: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt(`Copia el enlace de la sucursal ${nombre}:`, url);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={copiar}
        title={`Copiar enlace de encuesta para ${nombre}`}
        className="rounded-xl border border-borde bg-white px-3 py-1.5 text-xs font-bold text-marca shadow-xs hover:bg-slate-50 transition cursor-pointer"
      >
        {copiado ? "✓ ¡Copiado!" : "📋 Copiar liga"}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Abrir encuesta de ${nombre} en pestaña nueva`}
        className="rounded-xl bg-acento px-3 py-1.5 text-xs font-extrabold text-sobre-acento shadow-xs hover:bg-acento-dorado transition"
      >
        Abrir ↗
      </a>
    </div>
  );
}
