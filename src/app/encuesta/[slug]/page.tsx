import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { enviarEncuestaTienda } from "@/app/actions/enviar-encuesta";
import { FormularioEncuesta } from "@/components/encuesta/formulario";
import { MarcoEncuesta } from "@/components/encuesta/marco";

export default async function EncuestaTienda({ params }: PageProps<"/encuesta/[slug]">) {
  const { slug } = await params;

  const { data: sucursal } = await supabaseAdmin()
    .from("sucursales")
    .select("nombre")
    .eq("slug", slug)
    .eq("activa", true)
    .maybeSingle();
  if (!sucursal) notFound();

  return (
    <MarcoEncuesta subtitulo={`Sucursal ${sucursal.nombre}`}>
      <p className="mb-5 text-center text-suave">
        Contesta unas preguntas rápidas sobre tu compra. Te toma menos de un minuto.
      </p>
      <FormularioEncuesta
        accion={enviarEncuestaTienda.bind(null, slug)}
        pedirNumeroPedido
        redirigirAGoogle
      />
    </MarcoEncuesta>
  );
}
