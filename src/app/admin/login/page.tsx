import { FormularioLogin } from "./formulario-login";

export const metadata = { title: "Renova | Acceso al panel" };

export default async function Login({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const aviso =
    error === "sin_acceso" ? "Tu usuario no tiene acceso al panel. Contacta al administrador." : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-borde bg-tarjeta p-8 shadow-[0_8px_24px_rgba(32,32,32,0.08)]">
        <div className="mb-6 text-center">
          <div className="inline-block rounded-xl bg-marca px-5 py-2.5 mb-3 shadow-sm border-b-2 border-acento">
            <span className="font-heading font-black tracking-wider text-white text-lg">RENOVA</span>
          </div>
          <h1 className="text-xl font-extrabold text-marca font-heading">Panel de satisfacción</h1>
          <p className="mt-1 text-xs text-suave">Acceso exclusivo para equipo y administración</p>
        </div>
        <FormularioLogin aviso={aviso} />
      </div>
    </div>
  );
}
