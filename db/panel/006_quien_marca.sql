-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 006 · Quién marcó cada paso (D-113)
-- Andrés y Santiago (rol equipo) pueden marcar pasos de los proyectos.
-- Se guarda quién lo marcó para que el equipo vea quién avanzó qué.
-- ════════════════════════════════════════════════════════════════════
alter table fin_tareas add column hecha_por text references "user" ("id") on delete set null;
