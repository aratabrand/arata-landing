"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { completarUrl, mascaraCelular, mascaraInstagram, mascaraUrl } from "@/lib/panel/mascaras";
import { agregarCiudad } from "@/app/(panel)/panel/(app)/clientes/acciones";
import type { Ciudad, Pais } from "@/lib/panel/clientes/datos";
import { BotonSecundario, Campo, Etiqueta, MensajeError, useAccion } from "./finanzas/comun";

// Campos con máscara del panel (D-119). Cada uno manda su valor con `name` (FormData)
// y avisa con onCambio. El servidor valida otra vez.

export function InputCelular({ name = "telefono", inicial = "", pais = "CO", onCambio, etiqueta = "Celular (WhatsApp) *" }: { name?: string; inicial?: string; pais?: string; onCambio?: (v: string) => void; etiqueta?: string }) {
  const [v, setV] = useState(mascaraCelular(inicial, pais));
  return (
    <Campo etiqueta={etiqueta} ayuda={pais === "CO" ? "10 números, empieza por 3." : "Con el indicativo del país, solo números."}>
      <input
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={v}
        placeholder={pais === "CO" ? "300 123 4567" : "201 555 0123"}
        onChange={(e) => {
          const m = mascaraCelular(e.target.value, pais);
          setV(m);
          onCambio?.(m);
        }}
        className="pn-input tabular-nums"
      />
    </Campo>
  );
}

export function InputInstagram({ name = "instagram", inicial = "" }: { name?: string; inicial?: string }) {
  const [v, setV] = useState(inicial ? mascaraInstagram(inicial) : "");
  return (
    <Campo etiqueta="Instagram" obligatorio={false}>
      <input name={name} value={v} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="@negocio" onChange={(e) => setV(mascaraInstagram(e.target.value))} className="pn-input" />
    </Campo>
  );
}

export function InputUrl({ name = "sitioWeb", inicial = "", etiqueta = "Página web" }: { name?: string; inicial?: string; etiqueta?: string }) {
  const [v, setV] = useState(inicial);
  return (
    <Campo etiqueta={etiqueta} obligatorio={false} ayuda="Empieza por https://">
      <input name={name} type="url" inputMode="url" autoCapitalize="none" spellCheck={false} value={v} placeholder="https://" onChange={(e) => setV(mascaraUrl(e.target.value))} onBlur={() => setV((x) => completarUrl(x))} className="pn-input" />
    </Campo>
  );
}

/**
 * País (todos) + ciudad (solo Colombia, desde la tabla `ciudades`). Con otro país la ciudad
 * queda bloqueada. Si falta una ciudad de Colombia, quien edita la agrega aquí mismo (sin repetidos).
 */
export function SelectorLugar({
  paises,
  ciudades,
  pais,
  ciudadId,
  onCambio,
  puedeAgregar,
}: {
  paises: Pais[];
  ciudades: Ciudad[];
  pais: string;
  ciudadId: string;
  onCambio: (pais: string, ciudadId: string) => void;
  puedeAgregar: boolean;
}) {
  const [extra, setExtra] = useState<Ciudad[]>([]);
  const [agregando, setAgregando] = useState(false);
  const [nueva, setNueva] = useState({ nombre: "", departamento: "" });
  const acc = useAccion();
  const lista = [...ciudades, ...extra.filter((x) => !ciudades.some((c) => c.id === x.id))].filter((c) => c.pais === pais).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const conCiudad = pais === "CO";
  const departamentos = [...new Set(ciudades.filter((c) => c.pais === "CO" && c.departamento).map((c) => c.departamento!))].sort((a, b) => a.localeCompare(b, "es"));
  const AGREGAR = "__agregar__";

  const guardar = () =>
    acc.correr(async () => {
      const r = await agregarCiudad(nueva);
      if (r.ok && r.id) {
        setExtra((l) => [...l, { id: r.id!, pais: "CO", nombre: nueva.nombre.trim(), departamento: nueva.departamento.trim() }]);
        onCambio("CO", r.id);
        setAgregando(false);
        setNueva({ nombre: "", departamento: "" });
      }
      return r;
    });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <Campo etiqueta="País *">
          <select name="pais" value={pais} onChange={(e) => onCambio(e.target.value, "")} className="pn-input" autoComplete="country">
            {paises.map((p) => (
              <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
            ))}
          </select>
        </Campo>
        <label className="block min-w-0">
          <Etiqueta texto="Ciudad" obligatorio={conCiudad} />
          <select
            name="ciudadId"
            value={agregando ? AGREGAR : conCiudad ? ciudadId : ""}
            disabled={!conCiudad}
            onChange={(e) => (e.target.value === AGREGAR ? setAgregando(true) : (setAgregando(false), onCambio(pais, e.target.value)))}
            className="pn-input disabled:opacity-50"
            aria-describedby="ayuda-ciudad"
          >
            <option value="" disabled={conCiudad}>{conCiudad ? "Elige la ciudad" : "No aplica"}</option>
            {lista.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}{c.departamento && !c.departamento.startsWith(c.nombre) ? ` · ${c.departamento}` : ""}</option>
            ))}
            {conCiudad && puedeAgregar && <option value={AGREGAR}>＋ Agregar una ciudad que falta…</option>}
          </select>
          <span id="ayuda-ciudad" className="mt-1 block text-[0.7rem] text-fog-dim">{conCiudad ? "Ciudades principales de Colombia." : "La ciudad solo se elige para Colombia."}</span>
        </label>
      </div>
      {agregando && (
        <div className="space-y-2 rounded-frame border border-brand/40 bg-brand/5 p-3">
          <p className="text-xs font-semibold text-brand-soft">Ciudad nueva de Colombia (queda en la lista para todos)</p>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Ciudad *" aria-label="Nombre de la ciudad" maxLength={60} value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value.replace(/[^\p{L} .'-]/gu, "") })} className="pn-input" />
            <input list="departamentos-co" placeholder="Departamento *" aria-label="Departamento" maxLength={60} value={nueva.departamento} onChange={(e) => setNueva({ ...nueva, departamento: e.target.value.replace(/[^\p{L} .,'-]/gu, "") })} className="pn-input" />
            <datalist id="departamentos-co">
              {departamentos.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
          <MensajeError error={acc.error} />
          <div className="flex gap-2">
            <BotonSecundario type="button" onClick={() => setAgregando(false)}>Cancelar</BotonSecundario>
            <BotonSecundario type="button" disabled={acc.pendiente || nueva.nombre.trim().length < 2 || nueva.departamento.trim().length < 2} onClick={guardar} className="border-brand/60">
              <Plus aria-hidden className="h-4 w-4" /> {acc.pendiente ? "Guardando…" : "Agregar ciudad"}
            </BotonSecundario>
          </div>
        </div>
      )}
    </div>
  );
}
