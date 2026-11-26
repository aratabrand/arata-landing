"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Calendario from "../CalendarioCal";
import { calLinks } from "@/content/agendar";
import { medir } from "@/lib/medir";

// Agenda directa de las landings de campaña (D-197): sin preguntas, el calendario de una.
// Nombre, correo y WhatsApp los pide Cal.com; lo demás viaja en las notas (`notas`).
// El aviso de datos va ARRIBA del calendario: se lee antes de elegir la hora (Ley 1581, D-099).
export default function AgendaDirecta({
  notas,
  notaAutorizacion,
  aviso,
  avisoLink,
  origen,
}: {
  notas: string;
  notaAutorizacion: string;
  aviso: string;
  avisoLink: string;
  /** Para medir de qué landing salió la cita (GA4 y, cuando exista, el pixel). */
  origen: string;
}) {
  const router = useRouter();
  // Constancia: fecha y hora en que se mostró el aviso y se abrió el calendario
  const todasLasNotas = useMemo(
    () =>
      `${notas}\n${notaAutorizacion}, ${new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })} (hora de Bogotá)`,
    [notas, notaAutorizacion]
  );

  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-fog-dim">
        {aviso}{" "}
        <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 underline-offset-4 hover:text-white">
          {avisoLink}
        </Link>
        .
      </p>
      <Calendario
        link={calLinks.landing}
        nombre=""
        correo=""
        notas={todasLasNotas}
        sinDetalles
        onAgendada={() => {
          medir("cita_agendada", { tipo: "catalogo", origen });
          // D-204: el origen viaja a la página de «¡Listo!» para que el Lead diga que vino de la landing
          router.push(`/agendar/gracias?tipo=catalogo&origen=${encodeURIComponent(origen)}`);
        }}
      />
    </div>
  );
}
