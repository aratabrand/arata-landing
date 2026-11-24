"use client";

import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from "react";

// Arrastrar tareas con el dedo (D-187). En el celular el arrastre del computador (HTML5) no existe:
// aquí se mantiene presionada la tarjeta ~0,35 s (vibra), se mueve y se suelta en otra columna.
// Las columnas llevan `data-zona` y las tarjetas `data-tarea`. Si el dedo se mueve antes de tiempo,
// es scroll normal y no pasa nada.

export type Destino = { zona: string; antesDe: string | null };
type Activo = { id: string; desde: string | null; x0: number; y0: number; dx: number; dy: number; scroll0: number };

const ESPERA_MS = 350;
const TOLERANCIA_PX = 8;
/** Cerca del borde de la pantalla, la página se desplaza sola (las columnas van una debajo de otra en el celular). */
const BORDE_PX = 90;
const PASO_PX = 14;

export function useArrastreTactil(onSoltar: (id: string, desde: string | null, destino: Destino) => void) {
  const [activo, setActivo] = useState<Activo | null>(null);
  const [sobre, setSobre] = useState<Destino | null>(null);
  const pendiente = useRef<{ id: string; desde: string | null; x: number; y: number; t: number } | null>(null);
  const activoRef = useRef<Activo | null>(null);
  const sobreRef = useRef<Destino | null>(null);
  const suprimirClic = useRef(0);
  const dedo = useRef({ x: 0, y: 0 });
  const soltar = useRef(onSoltar);
  soltar.current = onSoltar;

  const arrastrandoId = activo?.id ?? null;
  // Mientras se arrastra: la página no se desplaza con el dedo (listener no pasivo) y, cerca del borde,
  // se desplaza sola para llegar a otra columna
  useEffect(() => {
    if (!arrastrandoId) return;
    const bloquear = (e: globalThis.TouchEvent) => e.cancelable && e.preventDefault();
    document.addEventListener("touchmove", bloquear, { passive: false });
    let cuadro = 0;
    const paso = () => {
      const { x, y } = dedo.current;
      const v = y < BORDE_PX ? -PASO_PX : y > window.innerHeight - BORDE_PX ? PASO_PX : 0;
      if (v) {
        window.scrollBy(0, v);
        mover(x, y);
      }
      cuadro = window.requestAnimationFrame(paso);
    };
    cuadro = window.requestAnimationFrame(paso);
    return () => {
      document.removeEventListener("touchmove", bloquear);
      window.cancelAnimationFrame(cuadro);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrastrandoId]);

  /** La tarjeta sigue al dedo (también si la página se desplazó) y se marca la columna de abajo. */
  function mover(x: number, y: number) {
    const a = activoRef.current;
    if (!a) return;
    const nuevo = { ...a, dx: x - a.x0, dy: y - a.y0 + (window.scrollY - a.scroll0) };
    activoRef.current = nuevo;
    setActivo(nuevo);
    const d = destinoEn(x, y);
    sobreRef.current = d;
    setSobre(d);
  }

  const limpiar = () => {
    if (pendiente.current) window.clearTimeout(pendiente.current.t);
    pendiente.current = null;
    activoRef.current = null;
    sobreRef.current = null;
    setActivo(null);
    setSobre(null);
  };

  /** Columna y posición bajo el dedo (la tarjeta arrastrada no recibe toques, así que no estorba). */
  const destinoEn = (x: number, y: number): Destino | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const zona = el?.closest<HTMLElement>("[data-zona]");
    if (!zona?.dataset.zona) return null;
    const tarjeta = el?.closest<HTMLElement>("[data-tarea]");
    let antesDe: string | null = null;
    if (tarjeta && zona.contains(tarjeta)) {
      const r = tarjeta.getBoundingClientRect();
      if (y < r.top + r.height / 2) antesDe = tarjeta.dataset.tarea ?? null;
      else {
        let sig = tarjeta.nextElementSibling as HTMLElement | null;
        while (sig && !sig.dataset.tarea) sig = sig.nextElementSibling as HTMLElement | null;
        antesDe = sig?.dataset.tarea ?? null;
      }
    }
    return { zona: zona.dataset.zona, antesDe };
  };

  /** Props para cada tarjeta que se puede arrastrar. `desde` = columna de donde sale (día o estado). */
  const props = (id: string, desde: string | null) => ({
    onTouchStart: (e: TouchEvent<HTMLElement>) => {
      if (e.touches.length !== 1) return limpiar();
      const { clientX: x, clientY: y } = e.touches[0];
      const t = window.setTimeout(() => {
        const a: Activo = { id, desde, x0: x, y0: y, dx: 0, dy: 0, scroll0: window.scrollY };
        dedo.current = { x, y };
        activoRef.current = a;
        setActivo(a);
        navigator.vibrate?.(12);
      }, ESPERA_MS);
      pendiente.current = { id, desde, x, y, t };
    },
    onTouchMove: (e: TouchEvent<HTMLElement>) => {
      const { clientX: x, clientY: y } = e.touches[0];
      const a = activoRef.current;
      if (!a) {
        // Se movió antes de tiempo: es scroll, no arrastre
        const p = pendiente.current;
        if (p && Math.hypot(x - p.x, y - p.y) > TOLERANCIA_PX) {
          window.clearTimeout(p.t);
          pendiente.current = null;
        }
        return;
      }
      dedo.current = { x, y };
      mover(x, y);
    },
    onTouchEnd: () => {
      const a = activoRef.current;
      const d = sobreRef.current;
      if (a) {
        suprimirClic.current = Date.now();
        if (d) soltar.current(a.id, a.desde, d);
      }
      limpiar();
    },
    onTouchCancel: limpiar,
    // Android abre el menú del navegador al mantener presionado: aquí no
    onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
  });

  /** Estilo de la tarjeta que se está arrastrando (sigue al dedo). */
  const estilo = (id: string): CSSProperties | undefined =>
    activo?.id === id
      ? { transform: `translate(${activo.dx}px, ${activo.dy}px) scale(1.03)`, zIndex: 50, position: "relative", pointerEvents: "none", boxShadow: "0 18px 40px -12px rgba(0,0,0,0.7)" }
      : undefined;

  /** Un toque que terminó un arrastre no debe abrir la tarea. */
  const clicBloqueado = () => Date.now() - suprimirClic.current < 400;

  return { arrastrando: arrastrandoId, sobre, props, estilo, clicBloqueado };
}
