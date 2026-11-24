-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 020 · Notificaciones de cada persona (D-185)
-- Las notificaciones salen del historial (compartido), pero cada persona maneja las suyas
-- como en Android o iPhone: borra una (X o deslizar), borra todas, y cada una se va sola a las
-- 24 horas. El historial del panel NO se borra: sigue siendo el registro de quién hizo qué.
-- ════════════════════════════════════════════════════════════════════

-- Una por una (X o deslizar)
create table notificaciones_borradas (
  usuario_id text not null references "user" ("id") on delete cascade,
  historial_id bigint not null references panel_historial on delete cascade,
  borrado timestamptz not null default now(),
  primary key (usuario_id, historial_id)
);

-- «Borrar todas»: lo anterior a este momento ya no se muestra
alter table notificaciones_vistas add column if not exists borradas_hasta timestamptz;
