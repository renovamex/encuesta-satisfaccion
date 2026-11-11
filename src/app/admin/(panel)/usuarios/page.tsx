import { requerirAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { actualizarUsuario } from "./actions";
import { FormUsuario } from "./form-usuario";

export const metadata = { title: "Renova | Usuarios" };

export default async function Usuarios() {
  const yo = await requerirAdmin();
  const admin = supabaseAdmin();

  const [{ data: perfiles }, { data: lista }] = await Promise.all([
    admin.from("perfiles").select("id, nombre, rol, activo").order("creado_en"),
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  const emails = new Map((lista?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-marca">Usuarios</h1>

      <section className="rounded-2xl border border-borde bg-tarjeta p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-marca">Nuevo usuario</h2>
        <FormUsuario />
      </section>

      <div className="overflow-x-auto rounded-2xl border border-borde bg-tarjeta shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-borde text-suave">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Activo</th>
              <th className="px-4 py-3 font-medium">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {(perfiles ?? []).map((p) => {
              const esYo = p.id === yo.id;
              return (
                <tr key={p.id} className="border-b border-borde last:border-0">
                  <td className="px-4 py-3 font-medium">{p.nombre || "—"}</td>
                  <td className="px-4 py-3">{emails.get(p.id) ?? "—"}</td>
                  <td colSpan={3} className="px-4 py-2">
                    <form action={actualizarUsuario.bind(null, p.id)} className="flex flex-wrap items-center gap-4">
                      <select
                        name="rol"
                        defaultValue={p.rol}
                        disabled={esYo}
                        className="rounded-lg border border-borde bg-white px-2 py-1.5"
                      >
                        <option value="equipo">Equipo</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="activo" defaultChecked={p.activo} disabled={esYo} />
                        Activo
                      </label>
                      {esYo ? (
                        <span className="text-xs text-suave">Tu usuario</span>
                      ) : (
                        <button type="submit" className="rounded-lg border border-borde px-3 py-1.5 font-medium text-marca hover:bg-background">
                          Guardar
                        </button>
                      )}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
