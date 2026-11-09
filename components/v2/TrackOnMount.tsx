"use client";

import { useEffect } from "react";

/** Empuja un evento a GTM (dataLayer) al abrir la página. Ej.: conversión en /agendar/gracias. */
export default function TrackOnMount({ event, data }: { event: string; data?: Record<string, unknown> }) {
  useEffect(() => {
    const w = window as Window & { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event, ...data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
