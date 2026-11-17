// Máscaras, límites y validación del formulario de /agendar (D-131).
// Todo corre en el navegador: los datos van directo a Cal.com (o a WhatsApp), no a un servidor nuestro.
// Por eso aquí se limpia y se acota todo lo que termina en las notas de la cita.

export const LIMITES = { nombre: 80, whatsapp: 20, correo: 254, url: 200 } as const;

/** Quita caracteres de control y < > (nada de HTML ni saltos de línea en las notas). */
const limpiar = (s: string) => s.replace(/[\u0000-\u001F\u007F<>]/g, "");

/* ── Nombre ─────────────────────────────────────────────────────────── */

/** Solo letras (con tildes y ñ), espacios, apóstrofo, guion y punto. */
export function mascaraNombre(s: string) {
  return limpiar(s)
    .replace(/[^\p{L}\p{M}' .-]/gu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+/, "")
    .slice(0, LIMITES.nombre);
}
export function nombreValido(s: string) {
  const t = s.trim();
  return t.length >= 2 && t.length <= LIMITES.nombre && (t.match(/\p{L}/gu)?.length ?? 0) >= 2;
}

/* ── WhatsApp ───────────────────────────────────────────────────────── */

const soloDigitos = (s: string) => s.replace(/\D/g, "");

/**
 * Formato internacional mientras se escribe.
 * - Colombia (57): "+57 300 000 0000". Si empieza a escribir un celular sin indicativo (3…), se pone +57.
 * - Otro país: "+" con los espacios que ponga la persona. Máximo 15 dígitos (estándar E.164).
 */
export function mascaraWhatsapp(s: string) {
  const conMas = s.trim().startsWith("+");
  let d = soloDigitos(s);
  if (!d) return conMas ? "+" : "";
  // Sin "+": un celular (3…) o un fijo (60…) colombiano → +57
  if (!conMas && (d.startsWith("3") || d.startsWith("60"))) d = `57${d}`;
  if (d.startsWith("57")) {
    const n = d.slice(2, 12);
    return ["+57", n.slice(0, 3), n.slice(3, 6), n.slice(6, 10)].filter(Boolean).join(" ");
  }
  // Otro país: "+" con los espacios que la persona ponga, hasta 15 dígitos
  let digitos = 0;
  let out = "";
  for (const ch of s.replace(/^\s*\+/, "").replace(/\s{2,}/g, " ").trimStart()) {
    if (/\d/.test(ch)) {
      if (digitos === 15) break;
      digitos++;
      out += ch;
    } else if (ch === " " && out && !out.endsWith(" ")) out += " ";
  }
  return `+${out}`;
}
export function whatsappValido(s: string) {
  const d = soloDigitos(s);
  if (d.startsWith("57")) {
    const n = d.slice(2);
    return n.length === 10 && (n.startsWith("3") || n.startsWith("60")); // celular o fijo con WhatsApp Business
  }
  return d.length >= 8 && d.length <= 15;
}

/* ── Correo ─────────────────────────────────────────────────────────── */

export function mascaraCorreo(s: string) {
  return limpiar(s).replace(/\s/g, "").slice(0, LIMITES.correo);
}
export function correoValido(s: string) {
  const t = s.trim();
  return (
    t.length <= LIMITES.correo &&
    /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/.test(t) &&
    !t.includes("..")
  );
}

/* ── Página (auditoría) ─────────────────────────────────────────────── */

export function mascaraUrl(s: string) {
  return limpiar(s).replace(/\s/g, "").slice(0, LIMITES.url);
}
/** Devuelve la dirección normalizada (https://dominio/ruta) o null si no es una página válida. */
export function normalizarUrl(s: string): string | null {
  const t = s.trim();
  if (!t || t.length > LIMITES.url) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t) && !/^https?:\/\//i.test(t)) return null; // javascript:, data:, mailto:…
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    if (u.username || u.password) return null;
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i.test(u.hostname)) return null;
    return `${u.protocol}//${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return null;
  }
}

/* ── Anti-bot (sin servidor: solo frena bots simples y envíos repetidos) ── */

/** Si se llena el campo trampa (invisible para personas) o se envía en menos de esto, se frena. */
export const TIEMPO_MINIMO_MS = 4000;

const CLAVE_INTENTOS = "as-agendar-intentos";
const MAX_INTENTOS = 5;
const VENTANA_MS = 60 * 60 * 1000;

function intentosRecientes(): number[] {
  try {
    const a = JSON.parse(window.localStorage.getItem(CLAVE_INTENTOS) ?? "[]") as number[];
    const desde = Date.now() - VENTANA_MS;
    return Array.isArray(a) ? a.filter((t) => typeof t === "number" && t > desde) : [];
  } catch {
    return [];
  }
}
/** true si este navegador ya llegó al calendario 5 veces en la última hora. */
export function demasiadosIntentos() {
  return intentosRecientes().length >= MAX_INTENTOS;
}
export function registrarIntento() {
  try {
    window.localStorage.setItem(CLAVE_INTENTOS, JSON.stringify([...intentosRecientes(), Date.now()]));
  } catch {}
}
