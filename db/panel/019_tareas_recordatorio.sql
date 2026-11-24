-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 019 · Recordatorio en las tareas (D-183)
-- Cada tarea puede llevar un recordatorio antes de su día: el mismo día, un día antes (24 h),
-- dos días antes o una semana antes. Llega con el aviso de las 8 a. m. (app/api/avisos/diario)
-- al celular de quien tiene la tarea y de quien puso el recordatorio. Una sola vez por día de la tarea.
-- ════════════════════════════════════════════════════════════════════

alter table agencia_tareas add column if not exists recordatorio text
  check (recordatorio is null or recordatorio in ('mismo_dia', '1_dia', '2_dias', '1_semana'));
alter table agencia_tareas add column if not exists recordatorio_por text references "user" ("id") on delete set null;

-- Ya se envió el recordatorio para esa tarea en esa fecha (si cambian el día, vuelve a avisar)
create table avisos_recordatorios (
  tarea_id uuid not null references agencia_tareas on delete cascade,
  fecha date not null,
  primary key (tarea_id, fecha)
);
