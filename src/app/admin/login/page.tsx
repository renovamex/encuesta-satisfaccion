import { FormularioLogin } from "./formulario-login";

export const metadata = { title: "Renova | Acceso al panel" };

export default async function Login({ searchParams }: PageProps<"/admin/login">) {
  const { error } = await searchParams;
  const aviso =
    error === "sin_acceso" ? "Tu usuario no tiene acceso al panel. Contacta al administrador." : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-borde bg-tarjeta p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-marca">Panel de satisfacción</h1>
        <p className="mb-5 mt-1 text-sm text-suave">Renova · acceso del equipo</p>
        <FormularioLogin aviso={aviso} />
      </div>
    </div>
  );
}
