import QRCode from "qrcode";
import { requerirAdmin } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { urlBase } from "@/lib/url";
import { crearSucursal, guardarSucursal } from "./actions";
import { FormSucursal } from "./form-sucursal";

export const metadata = { title: "Renova | Sucursales" };

export default async function Sucursales() {
  await requerirAdmin();
  const supabase = await supabaseServer();
  const base = await urlBase();
  const { data: sucursales } = await supabase.from("sucursales").select("*").order("nombre");

  const conQr = await Promise.all(
    (sucursales ?? []).map(async (s) => {
      const url = `${base}/encuesta/${s.slug}`;
      const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 160, errorCorrectionLevel: "M" });
      return { ...s, url, svg };
    }),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-marca">Sucursales</h1>
        <p className="text-sm text-suave">
          Cada sucursal tiene su propia liga y QR para el mostrador. El QR usa la URL base del sitio actual
          ({base}); al publicar en producción, vuelve a imprimirlos desde aquí.
        </p>
      </div>

      {conQr.map((s) => (
        <section
          key={s.id}
          className="grid gap-5 rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm md:grid-cols-[auto_1fr]"
        >
          <div className="text-center">
            <div
              className="mx-auto h-40 w-40"
              aria-label={`Código QR de ${s.nombre}`}
              dangerouslySetInnerHTML={{ __html: s.svg }}
            />
            <p className="mt-2 max-w-40 break-all text-xs text-suave">{s.url}</p>
          </div>
          <div>
            <h2 className="mb-3 font-semibold text-marca">{s.nombre}</h2>
            <FormSucursal
              accion={guardarSucursal.bind(null, s.id)}
              etiquetaBoton="Guardar"
              valores={{
                nombre: s.nombre,
                slug: s.slug,
                url_resena_google: s.url_resena_google,
                activa: s.activa,
              }}
            />
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-dashed border-borde p-5">
        <h2 className="mb-3 font-semibold text-marca">Agregar sucursal</h2>
        <FormSucursal accion={crearSucursal} etiquetaBoton="Crear sucursal" />
      </section>
    </div>
  );
}
