import type { ReactNode } from "react";

// Logo blanco publicado en el sitio de Renova. Sustituir por una copia local en /public al migrar.
const LOGO_URL = "https://renovamexico.com/wp-content/uploads/2025/12/renova-white-2-1024x303.png";

export function MarcoEncuesta({ children, subtitulo }: { children: ReactNode; subtitulo?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-marca px-5 py-5 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Renova" className="mx-auto h-9 w-auto" />
        {subtitulo ? <p className="mt-2 text-sm text-white/70">{subtitulo}</p> : null}
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">{children}</main>
      <footer className="px-4 pb-6 text-center text-xs text-suave">
        Tus respuestas nos ayudan a mejorar. Gracias por tu tiempo.
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
    <div className="rounded-2xl border border-borde bg-tarjeta p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-marca">{titulo}</h1>
      <p className="mt-2 text-suave">{texto}</p>
      {children}
    </div>
  );
}
