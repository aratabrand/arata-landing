-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 021 · Varias personas por tarea (D-186)
-- Una tarea puede tener varios responsables. La columna agencia_tareas.responsable_id queda
-- como «el primero» (compatibilidad); la lista completa está en tarea_responsables.
-- ════════════════════════════════════════════════════════════════════

create table tarea_responsables (
  tarea_id uuid not null references agencia_tareas on delete cascade,
  persona_id uuid not null references equipo_personas on delete cascade,
  primary key (tarea_id, persona_id)
);
create index tarea_responsables_persona_idx on tarea_responsables (persona_id);

-- Las tareas que ya tenían responsable lo conservan
insert into tarea_responsables (tarea_id, persona_id)
select id, responsable_id from agencia_tareas where responsable_id is not null
on conflict do nothing;

-- Si algo escribe solo responsable_id (versión anterior del panel), también queda en la lista
create function tarea_responsable_en_lista() returns trigger
language plpgsql as $$
begin
  if new.responsable_id is not null then
    insert into tarea_responsables (tarea_id, persona_id) values (new.id, new.responsable_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger agencia_tareas_responsable_lista after insert or update of responsable_id on agencia_tareas
for each row execute function tarea_responsable_en_lista();
