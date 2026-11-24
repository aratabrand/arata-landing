-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 018 · Tareas del equipo (D-181)
-- Tablero por días de la semana + tabla tipo Notion. Tareas de proyectos y de las áreas
-- (marketing, ventas, finanzas…), con responsable, fecha, prioridad, estado, lista de
-- chequeo y comentarios. Solo la agencia. (La tabla vieja `tareas` es del panel de ejemplo
-- de clientes y no se toca.)
-- ════════════════════════════════════════════════════════════════════

create table agencia_tareas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  titulo text not null check (char_length(titulo) between 2 and 160),
  descripcion text check (descripcion is null or char_length(descripcion) <= 4000),
  area text not null check (area in ('proyectos', 'marketing', 'ventas', 'finanzas', 'diseno', 'administracion')),
  -- Opcional: la tarea es de un proyecto (se ve también en su ficha)
  proyecto_id uuid references fin_proyectos on delete set null,
  -- Quién la hace (persona del equipo). Sin responsable = «Sin asignar»
  responsable_id uuid references equipo_personas on delete set null,
  -- Día en que se hace (columna del tablero). Sin fecha = «Sin fecha»
  fecha date,
  prioridad text not null default 'media' check (prioridad in ('urgente', 'alta', 'media', 'baja')),
  estado text not null default 'por_hacer' check (estado in ('por_hacer', 'en_curso', 'hecha')),
  -- Orden dentro del día (arrastrar)
  orden integer not null default 0,
  creado_por text references "user" ("id") on delete set null,
  hecha_en timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index agencia_tareas_fecha_idx on agencia_tareas (negocio_id, fecha, orden);
create index agencia_tareas_responsable_idx on agencia_tareas (negocio_id, responsable_id, estado);
create index agencia_tareas_proyecto_idx on agencia_tareas (proyecto_id) where proyecto_id is not null;
create trigger agencia_tareas_agencia before insert or update on agencia_tareas
for each row execute function exigir_agencia();

-- Lista de chequeo (subtareas marcables)
create table tarea_items (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references agencia_tareas on delete cascade,
  texto text not null check (char_length(texto) between 1 and 200),
  hecho boolean not null default false,
  orden integer not null default 0,
  creado timestamptz not null default now()
);
create index tarea_items_tarea_idx on tarea_items (tarea_id, orden);

-- Comentarios (quién y cuándo, como las notas de Interesados)
create table tarea_comentarios (
  id uuid primary key default gen_random_uuid(),
  tarea_id uuid not null references agencia_tareas on delete cascade,
  usuario_id text references "user" ("id") on delete set null,
  quien text not null check (char_length(quien) between 1 and 80),
  texto text not null check (char_length(texto) between 1 and 1000),
  creado timestamptz not null default now()
);
create index tarea_comentarios_tarea_idx on tarea_comentarios (tarea_id, creado);

-- Resumen de las 8 a. m.: una vez por persona y día
create table avisos_tareas (
  usuario_id text not null references "user" ("id") on delete cascade,
  fecha date not null,
  primary key (usuario_id, fecha)
);

-- El historial también registra las tareas
alter table panel_historial drop constraint if exists panel_historial_entidad_check;
alter table panel_historial add constraint panel_historial_entidad_check
  check (entidad in ('proyecto', 'cliente', 'gasto', 'gasto-fijo', 'dias', 'paso', 'reparto', 'servicio', 'persona', 'sitio', 'ciudad', 'interesado', 'prospecto', 'tarea'));
