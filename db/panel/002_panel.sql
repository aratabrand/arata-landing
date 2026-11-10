-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 002 · Datos del panel
-- Base: Neon, proyecto "arata-panel" (D-107).
-- ⚠ Solo Arata San y clientes de PÁGINA WEB. Los catálogos (Arata Print,
--   Caravana) tienen su propio sistema y su propia base: no van aquí (D-105).
--
-- Seguridad: la base NO se expone al navegador. Solo el servidor de Next se
-- conecta (DATABASE_URL) y cada consulta filtra por los negocios del usuario
-- en sesión con doble factor (lib/panel/sesion.ts). Ver 05 §1.
-- ════════════════════════════════════════════════════════════════════

-- ── Negocios ─────────────────────────────────────────────────────────
create table negocios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  -- Solo la agencia y clientes de página web. La base rechaza cualquier otro tipo.
  tipo text not null check (tipo in ('agencia', 'pagina-web')),
  nombre text not null,
  contacto text not null,
  rubro text,
  ciudad text,
  sitio text check (sitio is null or sitio ~ '^https://'),
  instagram text,
  instagram_id text,
  ga4_propiedad text,
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  plan text,
  demo boolean not null default false,
  creado timestamptz not null default now()
);

-- ── Quién entra a qué negocio (usuario = tabla "user" de Better Auth) ──
create table miembros (
  negocio_id uuid not null references negocios on delete cascade,
  usuario_id text not null references "user" ("id") on delete cascade,
  rol text not null default 'dueno' check (rol in ('dueno', 'equipo', 'arata')),
  creado timestamptz not null default now(),
  primary key (negocio_id, usuario_id)
);
create index miembros_usuario_idx on miembros (usuario_id);

-- ── Métricas por día (las llena n8n) ────────────────────────────────
create table metricas_diarias (
  negocio_id uuid not null references negocios on delete cascade,
  fecha date not null,
  ventas bigint not null default 0 check (ventas >= 0),
  pedidos int not null default 0 check (pedidos >= 0),
  visitas int not null default 0 check (visitas >= 0),
  clics_whatsapp int not null default 0 check (clics_whatsapp >= 0),
  ig_visualizaciones int not null default 0 check (ig_visualizaciones >= 0),
  ig_alcance int not null default 0 check (ig_alcance >= 0),
  ig_interacciones int not null default 0 check (ig_interacciones >= 0),
  ig_seguidores_nuevos int not null default 0,
  actualizado timestamptz not null default now(),
  primary key (negocio_id, fecha)
);

create table fuentes_visitas (
  negocio_id uuid not null references negocios on delete cascade,
  fecha date not null,
  fuente text not null,
  visitas int not null check (visitas >= 0),
  primary key (negocio_id, fecha, fuente)
);

-- ── Clientes y ventas ───────────────────────────────────────────────
create table clientes (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 80),
  telefono text not null check (telefono ~ '^[0-9]{7,15}$'),
  correo text check (correo is null or char_length(correo) <= 120),
  ciudad text check (ciudad is null or char_length(ciudad) <= 60),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'activo', 'recurrente', 'inactivo')),
  origen text check (origen in ('Instagram', 'Google', 'WhatsApp', 'Referido', 'Página')),
  notas text check (notas is null or char_length(notas) <= 2000),
  creado date not null default current_date,
  unique (negocio_id, telefono)
);

create table ventas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  cliente_id uuid references clientes on delete set null,
  producto text not null check (char_length(producto) <= 120),
  unidades int not null default 1 check (unidades > 0),
  valor bigint not null check (valor >= 0),
  canal text check (canal in ('WhatsApp', 'Página', 'Instagram', 'Local')),
  fecha timestamptz not null default now()
);
create index ventas_negocio_fecha_idx on ventas (negocio_id, fecha desc);
create index ventas_cliente_idx on ventas (cliente_id);

-- ── Proyectos (tablero) ─────────────────────────────────────────────
create table proyectos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  titulo text not null check (char_length(titulo) between 3 and 90),
  descripcion text check (descripcion is null or char_length(descripcion) <= 400),
  fase text not null default 'por-hacer' check (fase in ('por-hacer', 'diseno', 'construccion', 'revision', 'entregado')),
  responsable text not null default 'Arata San' check (responsable in ('Arata San', 'Tu equipo')),
  prioridad text not null default 'media' check (prioridad in ('alta', 'media', 'baja')),
  fecha_limite date,
  orden int not null default 0,
  creado timestamptz not null default now()
);
create index proyectos_negocio_idx on proyectos (negocio_id);

create table tareas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos on delete cascade,
  texto text not null check (char_length(texto) between 1 and 120),
  hecha boolean not null default false,
  orden int not null default 0
);
create index tareas_proyecto_idx on tareas (proyecto_id);

-- ── Configuración del sitio + historial ─────────────────────────────
create table config_sitio (
  negocio_id uuid primary key references negocios on delete cascade,
  datos jsonb not null check (jsonb_typeof(datos) = 'object'),
  actualizado timestamptz not null default now(),
  actualizado_por text references "user" ("id") on delete set null
);

create table config_sitio_versiones (
  id bigint generated always as identity primary key,
  negocio_id uuid not null references negocios on delete cascade,
  datos jsonb not null,
  creado timestamptz not null default now(),
  creado_por text references "user" ("id") on delete set null
);
create index config_versiones_negocio_idx on config_sitio_versiones (negocio_id, creado desc);

-- Cada guardado deja una copia (para deshacer) con quién lo hizo
create function config_sitio_guardar_version() returns trigger
language plpgsql as $$
begin
  new.actualizado := now();
  insert into config_sitio_versiones (negocio_id, datos, creado_por)
  values (new.negocio_id, new.datos, new.actualizado_por);
  return new;
end;
$$;

create trigger config_sitio_version
before insert or update on config_sitio
for each row execute function config_sitio_guardar_version();

-- ── Vista: clientes con sus compras ─────────────────────────────────
create view clientes_resumen as
select
  c.*,
  count(v.id)::int as compras,
  coalesce(sum(v.valor), 0)::bigint as total_comprado,
  max(v.fecha)::date as ultima_compra
from clientes c
left join ventas v on v.cliente_id = c.id
group by c.id;

-- ════════════════════════════════════════════════════════════════════
-- Datos iniciales: Arata San (el primer y, por ahora, único negocio)
-- ════════════════════════════════════════════════════════════════════
insert into negocios (slug, tipo, nombre, contacto, rubro, ciudad, sitio, instagram, whatsapp, plan)
values ('arata-san', 'agencia', 'Arata San', 'Sergio', 'Agencia digital', 'Bogotá',
        'https://www.aratasan.com', '@arata.san.web', '573134011189', 'Interno');
