"use client";

import { useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { ShieldCheck } from "lucide-react";
import { RUTA_ENTRAR } from "@/lib/panel/config";
import { authCliente } from "@/lib/panel/auth-cliente";

// Paso 2 del acceso: doble factor con app de autenticación (TOTP).
// - "activar" (primera vez): confirma la contraseña → QR o clave → código → códigos de respaldo.
// - "verificar" (siguientes): código de 6 números o un código de respaldo.
// Sin este paso, el servidor no deja ver ningún módulo del panel.

type Modo = "activar" | "verificar" | "inactivo";
type Paso =
  | { paso: "clave" }
  | { paso: "qr"; qr: string; secreto: string; respaldo: string[] }
  | { paso: "respaldo"; codigos: string[] }
  | { paso: "codigo" };

function mensajeError(err: { status?: number; code?: string; message?: string } | null) {
  if (!err) return "";
  if (err.status === 429) return "Demasiados intentos. Espera un minuto.";
  if (`${err.code ?? ""} ${err.message ?? ""}`.toLowerCase().includes("lock")) return "Cuenta bloqueada 15 minutos por códigos equivocados.";
  return "Ese código no sirve. Revisa que sea el más reciente.";
}

export default function DobleFactor({ modo }: { modo: Modo }) {
  const [paso, setPaso] = useState<Paso>(modo === "activar" ? { paso: "clave" } : { paso: "codigo" });
  const [codigo, setCodigo] = useState("");
  const [usarRespaldo, setUsarRespaldo] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (modo === "inactivo") {
    return <p className="text-center text-sm text-fog">El inicio de sesión todavía no está conectado.</p>;
  }

  const salir = async () => {
    await authCliente.signOut();
    window.location.assign(RUTA_ENTRAR);
  };

  // 1 · Activar: Better Auth pide la contraseña otra vez antes de crear el secreto
  const confirmarClave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("clave") ?? "");
    if (!password) return setError("Escribe tu contraseña.");
    setEnviando(true);
    setError("");
    const { data, error } = await authCliente.twoFactor.enable({ password, method: "totp" });
    setEnviando(false);
    if (error || !data || data.method !== "totp") return setError(error?.status === 429 ? "Demasiados intentos. Espera un minuto." : "Contraseña incorrecta.");
    const secreto = new URL(data.totpURI).searchParams.get("secret") ?? "";
    const qr = await QRCode.toString(data.totpURI, { type: "svg", margin: 0, errorCorrectionLevel: "M" });
    setPaso({ paso: "qr", qr: `data:image/svg+xml;utf8,${encodeURIComponent(qr)}`, secreto, respaldo: data.backupCodes });
  };

  // 2 · Código de 6 números (activa el doble factor o termina la entrada)
  const verificar = async (e: FormEvent) => {
    e.preventDefault();
    const limpio = codigo.trim();
    if (!usarRespaldo && !/^\d{6}$/.test(limpio)) return setError("El código tiene 6 números.");
    if (usarRespaldo && limpio.length < 6) return setError("Escribe uno de tus códigos de respaldo.");
    setEnviando(true);
    setError("");
    const { error } = usarRespaldo
      ? await authCliente.twoFactor.verifyBackupCode({ code: limpio })
      : await authCliente.twoFactor.verifyTotp({ code: limpio });
    setEnviando(false);
    if (error) {
      setCodigo("");
      return setError(mensajeError(error));
    }
    if (paso.paso === "qr") return setPaso({ paso: "respaldo", codigos: paso.respaldo });
    window.location.assign("/panel");
  };

  const campoCodigo = (
    <form onSubmit={verificar} noValidate className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-fog">{usarRespaldo ? "Código de respaldo" : "Código"}</span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(usarRespaldo ? e.target.value.slice(0, 24) : e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode={usarRespaldo ? "text" : "numeric"}
          autoComplete="one-time-code"
          autoFocus
          spellCheck={false}
          placeholder={usarRespaldo ? "xxxxx-xxxxx" : "000000"}
          className="pn-input text-center font-mono text-lg tracking-[0.3em]"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-[#FF9BB0]">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={enviando || codigo.length < 6}
        className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-50"
      >
        {enviando ? "Verificando…" : paso.paso === "qr" ? "Activar" : "Entrar"}
      </button>
    </form>
  );

  return (
    <div className="space-y-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-btn border border-white/10 bg-surface-2">
        <ShieldCheck aria-hidden className="h-5 w-5 text-lime" />
      </div>

      {paso.paso === "clave" && (
        <form onSubmit={confirmarClave} noValidate className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-heading text-white">Activa el doble factor</h1>
            <p className="mt-1.5 text-sm text-fog">Es obligatorio para entrar al panel. Confirma tu contraseña para empezar.</p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-fog">Contraseña</span>
            <input name="clave" type="password" autoComplete="current-password" autoFocus className="pn-input" />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[#FF9BB0]">
              {error}
            </p>
          )}
          <button type="submit" disabled={enviando} className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33] disabled:opacity-60">
            {enviando ? "Preparando…" : "Continuar"}
          </button>
        </form>
      )}

      {paso.paso === "qr" && (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-heading text-white">Escanea el código</h1>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-fog">
              <li>Abre tu app de autenticación (Google Authenticator, 1Password, Authy…).</li>
              <li>Escanea este código o escribe la clave.</li>
              <li>Escribe abajo el código de 6 números que te muestra.</li>
            </ol>
          </div>
          <div className="flex justify-center rounded-frame bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR generado en el navegador como SVG */}
            <img src={paso.qr} alt="Código QR para tu app de autenticación" width={176} height={176} />
          </div>
          <div>
            <p className="text-xs text-fog-dim">Clave para escribir a mano:</p>
            <code className="mt-1 block select-all break-all rounded-btn border border-white/10 bg-surface-1 px-3 py-2 font-mono text-xs text-white">{paso.secreto}</code>
          </div>
          {campoCodigo}
        </>
      )}

      {paso.paso === "respaldo" && (
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-heading text-white">Guarda tus códigos de respaldo</h1>
            <p className="mt-1.5 text-sm text-fog">
              Si pierdes el celular, cada uno sirve <strong className="text-white">una sola vez</strong> para entrar. Guárdalos en tu gestor de contraseñas. No los volveremos a mostrar.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2 rounded-frame border border-white/10 bg-surface-1 p-3 font-mono text-sm text-white">
            {paso.codigos.map((c) => (
              <li key={c} className="select-all text-center">
                {c}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(paso.codigos.join("\n")).catch(() => {})}
            className="h-11 w-full rounded-btn border border-white/10 bg-surface-2 text-sm font-semibold text-white hover:bg-surface-3"
          >
            Copiar códigos
          </button>
          <button type="button" onClick={() => window.location.assign("/panel")} className="v2-shine h-11 w-full rounded-btn bg-lime text-sm font-semibold text-ink hover:bg-[#C6FF33]">
            Ya los guardé, entrar al panel
          </button>
        </div>
      )}

      {paso.paso === "codigo" && (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-heading text-white">Código de verificación</h1>
            <p className="mt-1.5 text-sm text-fog">
              {usarRespaldo ? "Escribe uno de los códigos de respaldo que guardaste." : "Abre tu app de autenticación y escribe el código de 6 números de Arata San."}
            </p>
          </div>
          {campoCodigo}
          <button
            type="button"
            onClick={() => {
              setUsarRespaldo((v) => !v);
              setCodigo("");
              setError("");
            }}
            className="w-full text-center text-xs text-brand-soft hover:text-white"
          >
            {usarRespaldo ? "Usar la app de autenticación" : "No tengo el celular: usar un código de respaldo"}
          </button>
        </>
      )}

      {paso.paso !== "respaldo" && (
        <button type="button" onClick={salir} className="w-full text-center text-xs text-fog-dim hover:text-white">
          Salir y entrar con otra cuenta
        </button>
      )}
    </div>
  );
}
