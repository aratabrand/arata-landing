-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 022 · Tareas con rango de fechas (D-187)
-- `fecha` es el día en que empieza; `fecha_fin` (opcional) el día en que debe quedar lista.
-- Sin fecha_fin, la tarea es de un solo día. «Vencida» y el recordatorio cuentan desde la final.
-- ════════════════════════════════════════════════════════════════════

alter table agencia_tareas add column if not exists fecha_fin date;
alter table agencia_tareas add constraint agencia_tareas_rango_check
  check (fecha_fin is null or (fecha is not null and fecha_fin >= fecha));
