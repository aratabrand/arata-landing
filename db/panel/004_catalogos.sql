-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 004 · Clientes y servicios como listas (D-109)
-- Los proyectos ya no guardan el cliente ni el servicio como texto libre:
-- se eligen de una tabla, para que no haya dos formas de escribir lo mismo.
-- ════════════════════════════════════════════════════════════════════

-- ── Servicios que vende Arata (solo agencia) ────────────────────────
create table servicios (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 80),
  categoria text not null check (categoria in ('pagina-web', 'catalogo', 'sistema', 'mantenimiento', 'otro')),
  activo boolean not null default true,
  orden int not null default 0,
  creado timestamptz not null default now()
);
-- Mismo nombre escrito distinto (mayúsculas, espacios) = el mismo servicio
create unique index servicios_nombre_unico on servicios (negocio_id, lower(btrim(nombre)));
create trigger servicios_agencia before insert or update on servicios
for each row execute function exigir_agencia();

-- ── Clientes: datos de empresa y de dónde vinieron ──────────────────
alter table clientes
  add column empresa text check (empresa is null or char_length(empresa) <= 90),
  add column origen_detalle text check (origen_detalle is null or char_length(origen_detalle) <= 200),
  add column sitio_web text check (sitio_web is null or char_length(sitio_web) <= 200),
  add column instagram text check (instagram is null or char_length(instagram) <= 60);

alter table clientes drop constraint clientes_origen_check;
alter table clientes add constraint clientes_origen_check
  check (origen in ('Instagram', 'Google', 'WhatsApp', 'Referido', 'Página', 'Publicidad', 'Evento', 'Otro'));

-- ── Proyectos: cliente y servicio desde las tablas ──────────────────
-- (la base estaba vacía al aplicar esto; no hay datos que mover)
alter table fin_proyectos drop column cliente, drop column servicio;
alter table fin_proyectos
  add column cliente_id uuid references clientes on delete restrict,
  add column servicio_id uuid references servicios on delete restrict;
create index fin_proyectos_cliente_idx on fin_proyectos (cliente_id);
create index fin_proyectos_servicio_idx on fin_proyectos (servicio_id);

-- ── Servicios iniciales: los paquetes del sitio ─────────────────────
insert into servicios (negocio_id, nombre, categoria, orden)
select n.id, s.nombre, s.categoria, s.orden
from negocios n
cross join (values
  ('Página Lista en 5 Días', 'pagina-web', 1),
  ('Tienda por WhatsApp en 5 Días', 'catalogo', 2),
  ('Tu Negocio en Orden', 'sistema', 3),
  ('Mantenimiento mensual', 'mantenimiento', 4)
) as s (nombre, categoria, orden)
where n.slug = 'arata-san';
