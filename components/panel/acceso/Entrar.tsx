"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { RUTA_DOBLE_FACTOR } from "@/lib/panel/config";
import { authCliente } from "@/lib/panel/auth-cliente";

// Paso 1 del acceso: correo + contraseña (docs/panel-cliente/05-acceso-y-seguridad.md).
// No hay registro abierto: las cuentas las crea Arata con scripts/panel-crear-usuario.mjs.

export default function Entrar({ activo }: { activo: boolean }) {
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!activo) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-heading text-white">Acceso en preparación</h1>
        <p className="mt-3 text-sm text-fog">El inicio de sesión todavía no está conectado. Mientras tanto puedes ver el panel con datos de ejemplo.</p>
        <Link href="/panel" className="v2-shine mt-6 inline-flex h-11 w-full items-center justify-center rounded-btn bg-lime text-sm font-semibold text-ink">
          Ver el panel de ejemplo
        </Link>
      </div>
    );
  }

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("correo") ?? "").trim();
    const password = String(f.get("clave") ?? "");
    if (!email || !password) return setError("Escribe tu correo y tu contraseña.");
    setEnviando(true);
    setError("");
    const { error } = await authCliente.signIn.email({ email, password });
    if (error) {
      setEnviando(false);
      // Mismo mensaje para correo o contraseña mal: no se revela qué cuentas existen
      return setError(error.status === 429 ? "Demasiados intentos. Espera un minuto y vuelve a intentar." : "Correo o contraseña incorrectos.");
    }
    // Siempre sigue el doble factor: pedir el código o, la primera vez, activarlo
    window.location.assign(RUTA_DOBLE_FACTOR);
  };

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-btn border border-white/10 bg-surface-2">
        <LockKeyhole aria-hidden className="h-5 w-5 text-lime" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-bold tracking-heading text-white">Entrar al panel</h1>
        <p className="mt-1.5 text-sm text-fog">Después te pediremos el código de tu app de autenticación.</p>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-fog">Correo</span>
        <input name="correo" type="email" autoComplete="username" required className="pn-input" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-fog">Contraseña</span>
        <input name="clave" type="password" autoComplete="current-password" required className="pn-input" />
      </label>
      {error && (
        <p role="alert" className="text-sm text-[#FF9BB0]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando}
        className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-60"
      >
        {enviando ? "Entrando…" : "Continuar"}
      </button>
    </form>
  );
}
