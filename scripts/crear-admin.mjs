// Crea el primer usuario administrador (el registro público está cerrado).
// Uso: node --env-file=.env.local scripts/crear-admin.mjs correo@renova.mx "Nombre Apellido" "contraseña-segura"
import { createClient } from "@supabase/supabase-js";

const [email, nombre, password] = process.argv.slice(2);
if (!email || !nombre || !password || password.length < 8) {
  console.error('Uso: node --env-file=.env.local scripts/crear-admin.mjs <correo> "<nombre>" "<contraseña de 8+ caracteres>"');
  process.exit(1);
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { nombre },
  app_metadata: { rol: "admin" },
});
if (error) {
  console.error("No se pudo crear el usuario:", error.message);
  process.exit(1);
}
console.log(`Administrador creado: ${data.user.email}`);
