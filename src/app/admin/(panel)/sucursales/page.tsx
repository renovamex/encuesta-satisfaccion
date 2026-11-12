import QRCode from "qrcode";
import { requerirPerfil } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { urlBase } from "@/lib/url";
import { crearSucursal, guardarSucursal } from "./actions";
import { FormSucursal } from "./form-sucursal";
import { AccionesSucursal } from "./acciones-sucursal";

export const metadata = { title: "Renova | Sucursales y Códigos QR" };

export default async function Sucursales() {
  const perfil = await requerirPerfil();
  const esAdmin = perfil.rol === "admin";
  const supabase = await supabaseServer();
  const base = await urlBase();
  const { data: sucursales } = await supabase.from("sucursales").select("*").order("nombre");

  const conQr = await Promise.all(
    (sucursales ?? []).map(async (s) => {
      const url = `${base}/encuesta/${s.slug}`;
      const svg = await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        width: 180,
        errorCorrectionLevel: "M",
      });
      return { ...s, url, svg };
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-marca font-heading tracking-tight">
            Ligas de Sucursales y Códigos QR
          </h1>
          <p className="text-sm text-suave">
            Ligas permanentes y códigos QR para piso de venta y mostradores de caja de cada sucursal Renova.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {conQr.map((s) => (
          <section
            key={s.id}
            className="flex flex-col justify-between rounded-2xl border border-borde bg-tarjeta p-6 shadow-[0_8px_24px_rgba(32,32,32,0.06)]"
          >
            <div>
              <div className="flex items-center justify-between border-b border-borde pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-acento" />
                  <h2 className="text-xl font-extrabold text-marca font-heading">
                    Sucursal {s.nombre}
                  </h2>
                </div>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                    s.activa ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {s.activa ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 my-2">
                <div className="flex flex-col items-center rounded-xl border border-borde bg-white p-3 shadow-xs">
                  <div
                    className="h-36 w-36"
                    aria-label={`Código QR de ${s.nombre}`}
                    dangerouslySetInnerHTML={{ __html: s.svg }}
                  />
                  <AccionesSucursal url={s.url} nombre={s.nombre} />
                </div>

                <div className="flex-1 space-y-2.5 text-xs text-suave">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-marca block mb-1">
                      Liga directa para clientes:
                    </span>
                    <p className="break-all rounded-lg bg-slate-50 border border-borde p-2 font-mono text-[11px] text-slate-800">
                      {s.url}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold uppercase tracking-wider text-marca block mb-1">
                      Destino de Reseña Google Maps:
                    </span>
                    <a
                      href={s.url_resena_google ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 hover:underline line-clamp-2 block"
                    >
                      {s.url_resena_google || "No configurado"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {esAdmin ? (
              <div className="mt-5 border-t border-borde/70 pt-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-suave">
                  Configuración de sucursal
                </p>
                <FormSucursal
                  accion={guardarSucursal.bind(null, s.id)}
                  etiquetaBoton="Guardar cambios"
                  valores={{
                    nombre: s.nombre,
                    slug: s.slug,
                    url_resena_google: s.url_resena_google,
                    activa: s.activa,
                  }}
                />
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {esAdmin ? (
        <section className="rounded-2xl border-2 border-dashed border-borde bg-white/40 p-6">
          <h2 className="mb-2 text-lg font-bold text-marca font-heading">Dar de alta una nueva sucursal</h2>
          <p className="mb-4 text-xs text-suave">
            Crea una nueva sucursal física. Se generará automáticamente su slug, liga y código QR.
          </p>
          <FormSucursal accion={crearSucursal} etiquetaBoton="Crear sucursal" />
        </section>
      ) : null}
    </div>
  );
}
