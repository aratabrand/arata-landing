import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { RUTA_DOBLE_FACTOR, RUTA_ENTRAR, panelActivo } from "@/lib/panel/config";

// Primera barrera del panel (docs/panel-cliente/05-acceso-y-seguridad.md).
// Rápida y sin base de datos: si no hay cookie de sesión, manda a /panel/entrar.
// La verificación de verdad (sesión válida + doble factor activo) la hace el
// servidor en app/(panel)/panel/(app)/layout.tsx antes de pintar cada módulo.
export function proxy(request: NextRequest) {
  if (!panelActivo) return NextResponse.next(); // modo ejemplo
  const ruta = request.nextUrl.pathname;
  if (ruta === RUTA_ENTRAR || ruta === RUTA_DOBLE_FACTOR) return NextResponse.next();
  if (!getSessionCookie(request)) {
    // Ya puso la contraseña y falta el código → directo al doble factor (sin repetir la contraseña)
    const pendiente = request.cookies.getAll().some((c) => c.name.endsWith("two_factor"));
    return NextResponse.redirect(new URL(pendiente ? RUTA_DOBLE_FACTOR : RUTA_ENTRAR, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel", "/panel/:path*"],
};
