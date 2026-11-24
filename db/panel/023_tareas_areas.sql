-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 023 · Áreas de las tareas (D-188)
-- Áreas fijas: proyectos (tareas ligadas a un proyecto), marketing, desarrollo, finanzas y
-- diseño (en el código, AREAS). El equipo puede agregar más: quedan en `tarea_areas`.
-- Ventas y Administración dejan de ser fijas; si ya había tareas en ellas, se vuelven áreas
-- agregadas para no perder nada.
-- ════════════════════════════════════════════════════════════════════

alter table agencia_tareas drop constraint if exists agencia_tareas_area_check;
alter table agencia_tareas add constraint agencia_tareas_area_check check (area ~ '^[a-z0-9-]{2,40}$');

create table tarea_areas (
  negocio_id uuid not null references negocios on delete cascade,
  -- Lo que se guarda en agencia_tareas.area (sale del nombre: «Ventas y alianzas» → ventas-y-alianzas)
  clave text not null check (clave ~ '^[a-z0-9-]{2,40}$' and clave not in ('proyectos', 'marketing', 'desarrollo', 'finanzas', 'diseno')),
  nombre text not null check (char_length(nombre) between 2 and 40),
  creado_por text references "user" ("id") on delete set null,
  creado timestamptz not null default now(),
  primary key (negocio_id, clave)
);
create trigger tarea_areas_agencia before insert or update on tarea_areas
for each row execute function exigir_agencia();

insert into tarea_areas (negocio_id, clave, nombre)
select distinct t.negocio_id, t.area, case t.area when 'ventas' then 'Ventas' when 'administracion' then 'Administración' else initcap(replace(t.area, '-', ' ')) end
  from agencia_tareas t
 where t.area not in ('proyectos', 'marketing', 'desarrollo', 'finanzas', 'diseno')
on conflict do nothing;
