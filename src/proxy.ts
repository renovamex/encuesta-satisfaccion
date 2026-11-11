import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refresca la sesión de Supabase y hace un chequeo optimista de acceso a /admin.
// La autorización real (rol, perfil activo) se valida en cada página con requerirPerfil().
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esLogin = request.nextUrl.pathname === "/admin/login";
  if (!user && !esLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (user && esLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
