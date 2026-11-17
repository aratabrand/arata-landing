-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 011 · Responsable de cada paso y días por paso (D-123)
-- En cada paso de un proyecto se elige quién lo hizo y se registran sus días.
-- Los días siguen en fin_horas (cuentan igual en el reparto, D-118); tarea_id dice
-- de qué paso salieron. Si se quita el paso, los días se quedan (tarea_id vacío).
-- ════════════════════════════════════════════════════════════════════
alter table fin_tareas add column responsable_id uuid references equipo_personas on delete set null;
alter table fin_horas add column tarea_id uuid references fin_tareas on delete set null;
create index fin_horas_tarea_idx on fin_horas (tarea_id) where tarea_id is not null;
