import { avance, estaEntregado } from "./finanzas/procesos";
import type { DatosFinanzas, FinProyecto } from "./finanzas/tipos";

// Alertas de vencimiento (D-119). Función pura: la usan la pestaña Notificaciones
// y el aviso diario al celular (8 a. m. Bogotá). Reglas elegidas por Sergio:
//   · faltan 2 días (y 1 día) → "por vencer"
//   · el día de entrega       → "se entrega hoy"
//   · después                 → "va tarde" (cada mañana mientras siga pendiente)
// No cuentan las propuestas ni los proyectos ya entregados.

export type TipoAlerta = "faltan-2" | "hoy" | "tarde";
export type Alerta = { proyecto: FinProyecto; tipo: TipoAlerta; dias: number; pct: number; texto: string };

const diasEntre = (hoy: string, fecha: string) => Math.round((Date.parse(`${fecha}T12:00:00Z`) - Date.parse(`${hoy}T12:00:00Z`)) / 86_400_000);

export function alertasVencimiento(d: Pick<DatosFinanzas, "proyectos" | "tareas">, hoy: string): Alerta[] {
  return d.proyectos
    .filter((p) => p.fechaLimite && p.estado !== "propuesta")
    .map((p) => ({ p, a: avance(d.tareas.filter((t) => t.proyectoId === p.id)) }))
    .filter(({ p, a }) => !estaEntregado(p.estado, a))
    .map(({ p, a }) => {
      const dias = diasEntre(hoy, p.fechaLimite!);
      const tipo: TipoAlerta | null = dias < 0 ? "tarde" : dias === 0 ? "hoy" : dias <= 2 ? "faltan-2" : null;
      if (!tipo) return null;
      const texto =
        tipo === "tarde"
          ? `${p.nombre} va tarde: se debía entregar hace ${-dias} ${dias === -1 ? "día" : "días"} (${a.pct} % hecho).`
          : tipo === "hoy"
            ? `${p.nombre} se entrega hoy (${a.pct} % hecho).`
            : `${p.nombre} se entrega en ${dias} ${dias === 1 ? "día" : "días"} (${a.pct} % hecho).`;
      return { proyecto: p, tipo, dias, pct: a.pct, texto };
    })
    .filter((x): x is Alerta => x !== null)
    .sort((x, y) => x.dias - y.dias);
}
