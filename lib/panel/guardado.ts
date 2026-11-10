"use client";

import { useCallback, useEffect, useState } from "react";

// Guardado del panel en modo DEMO: localStorage del navegador.
// Sirve para probar el panel sin backend. En producción este hook se reemplaza
// por lecturas/escrituras a Supabase (docs/panel-cliente/04-construccion.md §3):
// la firma [valor, set, listo, restablecer] se mantiene para no tocar los módulos.
// localStorage puede fallar (modo privado, bloqueado): todo va en try/catch.

const PREFIJO = "arata-panel:";

export function useGuardado<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(inicial);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFIJO + clave);
      if (raw) setValor(JSON.parse(raw) as T);
    } catch {
      /* sin almacenamiento: se usa el valor inicial */
    }
    setListo(true);
  }, [clave]);

  useEffect(() => {
    if (!listo) return;
    try {
      window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    } catch {
      /* no se pudo guardar: el cambio vive solo en esta pestaña */
    }
  }, [clave, valor, listo]);

  const restablecer = useCallback(() => {
    try {
      window.localStorage.removeItem(PREFIJO + clave);
    } catch {
      /* nada */
    }
    setValor(inicial);
  }, [clave, inicial]);

  return [valor, setValor, listo, restablecer] as const;
}

/** id corto para filas nuevas (en producción lo da la base de datos). */
export const nuevoId = (prefijo: string) => `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
