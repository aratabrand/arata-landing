import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/panel/auth";
import { panelActivo } from "@/lib/panel/config";

// Rutas de Better Auth (entrar, salir, doble factor). Sin configuración → 404.
const noDisponible = () => new Response(null, { status: 404 });

export async function GET(req: Request) {
  return panelActivo ? toNextJsHandler(auth()).GET(req) : noDisponible();
}

export async function POST(req: Request) {
  return panelActivo ? toNextJsHandler(auth()).POST(req) : noDisponible();
}
