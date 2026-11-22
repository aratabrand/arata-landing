-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 016 · Prospectos (D-171)
-- Negocios que Sellbird encontró (Google Maps vía Scavio) y que todavía no han agendado.
-- Clientes → Prospectos → Interesados → Clientes. Solo datos que el negocio publicó:
-- nombre, rubro, teléfono, página y reseñas. La prioridad y el servicio sugerido los
-- calcula lib/panel/clientes/prospectos.ts (clasificar) al importar y al cambiar el titular.
-- ════════════════════════════════════════════════════════════════════

create table prospectos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  -- De dónde salió (sellbird) y su id allá (ej. osm:node/1 o el place_id de Google): no se duplica al reimportar
  fuente text not null default 'sellbird' check (fuente in ('sellbird', 'manual')),
  fuente_id text not null check (char_length(fuente_id) between 1 and 200),
  nombre text not null check (char_length(nombre) between 1 and 160),
  rubro text not null check (rubro in ('odontologia', 'ropa', 'ferreteria', 'repuestos', 'electrodomesticos', 'panaderia', 'otro')),
  -- Categoría tal como la trae Google Maps (ej. "Hardware store")
  categoria text check (categoria is null or char_length(categoria) <= 120),
  servicio text check (servicio is null or servicio in ('pagina', 'catalogo', 'sistema')),
  -- sin_pagina · solo_redes (Instagram, Linktree, WhatsApp…) · tiene_pagina
  pagina text not null check (pagina in ('sin_pagina', 'solo_redes', 'tiene_pagina')),
  sitio_web text check (sitio_web is null or (char_length(sitio_web) <= 300 and sitio_web ~ '^https?://')),
  -- Solo números, con indicativo (573001234567)
  telefono text check (telefono is null or telefono ~ '^[0-9]{7,15}$'),
  tipo_telefono text check (tipo_telefono is null or tipo_telefono in ('celular', 'fijo', 'otro')),
  ciudad text check (ciudad is null or char_length(ciudad) <= 120),
  enlace_maps text check (enlace_maps is null or (char_length(enlace_maps) <= 400 and enlace_maps ~ '^https://')),
  resenas integer not null default 0 check (resenas >= 0),
  calificacion numeric(2,1) check (calificacion is null or calificacion between 0 and 5),
  -- empresa = tiene NIT (S.A.S., Ltda.) · persona_natural · por_verificar (revisar en el RUES)
  titular text not null default 'por_verificar' check (titular in ('empresa', 'persona_natural', 'por_verificar')),
  prioridad text not null check (prioridad in ('alta', 'media', 'baja')),
  puntos smallint not null default 0,
  -- nuevo → contactado → respondio → agendo · no_interesa · no_contactar (para siempre, Ley 1581)
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'respondio', 'agendo', 'no_interesa', 'no_contactar')),
  notas text check (notas is null or char_length(notas) <= 2000),
  interesado_id uuid references interesados on delete set null,
  contactado_en timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  unique (negocio_id, fuente_id)
);
create index prospectos_negocio_idx on prospectos (negocio_id, prioridad, estado);

-- Solo la agencia (igual que Interesados)
create trigger prospectos_agencia before insert or update on prospectos
for each row execute function exigir_agencia();

-- El historial también registra los cambios de prospectos
alter table panel_historial drop constraint if exists panel_historial_entidad_check;
alter table panel_historial add constraint panel_historial_entidad_check
  check (entidad in ('proyecto', 'cliente', 'gasto', 'gasto-fijo', 'dias', 'paso', 'reparto', 'servicio', 'persona', 'sitio', 'ciudad', 'interesado', 'prospecto'));
