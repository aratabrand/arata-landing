"use client";

import { useEffect } from "react";
import { medir } from "@/lib/medir";

/** Manda un evento al abrir la página (GA4 + GTM). Ej.: conversión en /agendar/gracias. */
export default function TrackOnMount({ event, data }: { event: string; data?: Record<string, string | number> }) {
  useEffect(() => {
    medir(event, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
