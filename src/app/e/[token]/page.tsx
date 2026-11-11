import { supabaseAdmin } from "@/lib/supabase/admin";
import { enviarEncuestaMayoreo } from "@/app/actions/enviar-encuesta";
import { FormularioEncuesta } from "@/components/encuesta/formulario";
import { MarcoEncuesta, PantallaMensaje } from "@/components/encuesta/marco";

export default async function EncuestaMayoreo({ params }: PageProps<"/e/[token]">) {
  const { token } = await params;

  const { data: invitacion } = await supabaseAdmin()
    .from("invitaciones_mayoreo")
    .select("numero_pedido, estado, vence_en")
    .eq("token", token)
    .maybeSingle();

  let bloqueo: { titulo: string; texto: string } | null = null;
  if (!invitacion || invitacion.estado === "anulada") {
    bloqueo = {
      titulo: "Liga no válida",
      texto: "Revisa que el enlace esté completo o pide uno nuevo a tu asesor.",
    };
  } else if (invitacion.estado === "respondida") {
    bloqueo = { titulo: "Esta encuesta ya fue respondida", texto: "Gracias por tu tiempo." };
  } else if (new Date(invitacion.vence_en) < new Date()) {
    bloqueo = {
      titulo: "Esta liga ya venció",
      texto: "Si quieres compartirnos tu experiencia, pídele una nueva liga a tu asesor.",
    };
  }

  return (
    <MarcoEncuesta subtitulo={invitacion ? `Pedido ${invitacion.numero_pedido}` : undefined}>
      {bloqueo ? (
        <PantallaMensaje titulo={bloqueo.titulo} texto={bloqueo.texto} />
      ) : (
        <>
          <p className="mb-5 text-center text-suave">
            Tu asesor te pidió compartir cómo te fue con tu pedido. Son unas preguntas rápidas.
          </p>
          <FormularioEncuesta
            accion={enviarEncuestaMayoreo.bind(null, token)}
            pedirNumeroPedido={false}
            redirigirAGoogle={false}
          />
        </>
      )}
    </MarcoEncuesta>
  );
}
