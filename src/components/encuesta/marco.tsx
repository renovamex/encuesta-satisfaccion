import type { ReactNode } from "react";

// Logo blanco oficial publicado en el sitio de Renova para fondos oscuros.
const LOGO_URL = "https://renovamexico.com/wp-content/uploads/2025/12/renova-white-2-1024x303.png";

export function MarcoEncuesta({ children, subtitulo }: { children: ReactNode; subtitulo?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-marca px-5 py-5 text-center border-b-4 border-acento shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Renova México" className="mx-auto h-9 w-auto" />
        {subtitulo ? (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-acento" />
            <span>{subtitulo}</span>
          </div>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">{children}</main>
      <footer className="px-4 pb-8 text-center text-xs text-suave space-y-1">
        <p className="font-bold text-marca">Renova es confianza en cada paso.</p>
        <p className="text-texto-tenue">Tus respuestas nos ayudan a mejorar. Gracias por tu tiempo.</p>
      </footer>
    </div>
  );
}

export function PantallaMensaje({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-borde bg-tarjeta p-8 text-center shadow-[0_8px_24px_rgba(32,32,32,0.08)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-acento text-marca font-black text-2xl shadow-sm">
        ✓
      </div>
      <h1 className="text-2xl font-extrabold text-marca font-heading">{titulo}</h1>
      <p className="mt-2 text-suave leading-relaxed">{texto}</p>
      {children}
    </div>
  );
}
