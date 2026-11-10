-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 005 · Proceso de entrega de cada proyecto (D-111)
-- Cada proyecto tiene pasos por etapa (arranque → diseño → construcción →
-- revisión → entrega). La etapa actual y el avance se CALCULAN de los pasos:
-- etapa = la del primer paso sin terminar; avance = hechos / total.
-- Los pasos iniciales salen de la plantilla del servicio (lib/panel/finanzas/procesos.ts).
-- ════════════════════════════════════════════════════════════════════

alter table fin_proyectos
  add column fecha_inicio date not null default current_date,
  add column fecha_limite date;

create table fin_tareas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references fin_proyectos on delete cascade,
  etapa text not null check (etapa in ('arranque', 'diseno', 'construccion', 'revision', 'entrega')),
  texto text not null check (char_length(texto) between 2 and 120),
  hecha boolean not null default false,
  hecha_en timestamptz,
  orden int not null default 0,
  creado timestamptz not null default now()
);
create index fin_tareas_proyecto_idx on fin_tareas (proyecto_id, orden);
