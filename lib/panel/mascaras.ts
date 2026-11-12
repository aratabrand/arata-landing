// Máscaras de los formularios del panel (D-119). Funciones puras: se usan al escribir
// (pantalla) y se prueban en scripts/prueba-mascaras.ts. El servidor valida igual por su lado.

/** Celular: Colombia "300 123 4567" (10 números, empieza por 3); otros países hasta 15 números en grupos de 3. */
export function mascaraCelular(v: string, pais = "CO") {
  let d = v.replace(/\D/g, "");
  if (pais === "CO") {
    if (d.length > 10 && d.startsWith("57")) d = d.slice(2);
    d = d.slice(0, 10);
    return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean).join(" ");
  }
  d = d.slice(0, 15);
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}
export function celularValido(v: string, pais = "CO") {
  const d = v.replace(/\D/g, "");
  return pais === "CO" ? /^3\d{9}$/.test(d) : d.length >= 7 && d.length <= 15;
}

/** Pesos: solo números, con puntos de miles ("1.250.000"). */
const miles = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
export function mascaraPesos(v: string, max = 12) {
  const n = Number(v.replace(/\D/g, "").slice(0, max));
  return n ? miles.format(n) : "";
}

/** Días: números enteros o medios (",5"); acepta punto o coma y deja coma. */
export function mascaraDias(v: string) {
  const t = v.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const [ent, ...rest] = t.split(",");
  const e = ent.replace(/^0+(?=\d)/, "").slice(0, 3);
  if (!rest.length) return e;
  const dec = rest.join("").slice(0, 1);
  return `${e || "0"},${dec === "" ? "" : dec === "5" || dec === "0" ? dec : "5"}`;
}
export const diasValidos = (v: string) => {
  const n = Number(v.replace(",", "."));
  return n > 0 && n <= 365 && Math.round(n * 2) === n * 2;
};

/** Instagram: siempre con @, solo letras, números, punto y guion bajo (máx. 30). */
export function mascaraInstagram(v: string) {
  const u = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
  return u ? `@${u}` : "";
}

/** Página web: sin espacios; al salir del campo se completa "https://" si falta. */
export const mascaraUrl = (v: string) => v.replace(/\s/g, "").slice(0, 200);
export function completarUrl(v: string) {
  const t = mascaraUrl(v);
  if (!t) return "";
  if (/^https:\/\//i.test(t)) return t;
  return "https://" + t.replace(/^https?:\/\//i, "").replace(/^\/+/, "");
}
export const urlValida = (v: string) => !v || /^https:\/\/[^\s.]+\.[^\s]+$/i.test(v);

/** Nombres propios: sin espacios dobles ni al inicio. */
export const mascaraNombre = (v: string) => v.replace(/\s{2,}/g, " ").replace(/^\s+/, "");
