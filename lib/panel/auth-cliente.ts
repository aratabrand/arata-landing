"use client";

import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

// Cliente de acceso para el navegador. Habla con /api/auth del mismo dominio:
// no recibe ni ve la conexión a la base de datos.
export const authCliente = createAuthClient({
  basePath: "/api/auth",
  plugins: [twoFactorClient()],
});
