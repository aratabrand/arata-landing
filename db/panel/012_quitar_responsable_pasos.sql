-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 012 · Se revierte 011 (D-124)
-- El responsable y los días por paso no eran lo que se quería: los días se registran
-- por persona y área en el proyecto (sobre todo al cerrarlo), no por paso.
-- No había datos en estas columnas al quitarlas (revisado el 14 nov 2026).
-- ════════════════════════════════════════════════════════════════════
drop index if exists fin_horas_tarea_idx;
alter table fin_horas drop column if exists tarea_id;
alter table fin_tareas drop column if exists responsable_id;
