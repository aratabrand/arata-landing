-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 017 · Buscar más prospectos desde el panel (D-179)
-- El botón «Buscar más prospectos» consulta Google Maps por Scavio (1 crédito = 1 página de
-- hasta 20 negocios). Cada página buscada queda aquí para no volver a pagarla, para saber qué
-- nicho y qué zona rinden, y para recuperar sin gastar los negocios que los filtros dejaron por fuera.
-- ════════════════════════════════════════════════════════════════════

-- Los rubros salen de los nichos (lib/panel/clientes/nichos.ts): ya no es una lista fija en la base
alter table prospectos drop constraint if exists prospectos_rubro_check;
alter table prospectos add constraint prospectos_rubro_check check (rubro ~ '^[a-z_]{2,40}$');

-- Cómo se puntúa: «necesita página» (D-173, la primera carga) o «ya vende por internet» (D-179)
alter table prospectos add column if not exists enfoque text not null default 'sin_pagina'
  check (enfoque in ('sin_pagina', 'ya_vende'));

-- De dónde salió: Sellbird (CSV), el panel (botón) o a mano
alter table prospectos drop constraint if exists prospectos_fuente_check;
alter table prospectos add constraint prospectos_fuente_check check (fuente in ('sellbird', 'panel', 'manual'));

create table prospecto_busquedas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  usuario_id text,
  quien text not null check (char_length(quien) between 1 and 120),
  nicho text not null check (nicho ~ '^[a-z_]{2,40}$'),
  zona text not null check (zona ~ '^[a-z_]{2,40}$'),
  enfoque text not null check (enfoque in ('sin_pagina', 'ya_vende')),
  -- Página de Google Maps: 0 = negocios 1 a 20, 1 = 21 a 40…
  pagina smallint not null check (pagina between 0 and 9),
  consulta text not null check (char_length(consulta) <= 200),
  filtros jsonb not null default '{}',
  estado text not null default 'corriendo' check (estado in ('corriendo', 'lista', 'fallo')),
  creditos smallint not null default 0,
  encontrados smallint not null default 0,
  nuevos smallint not null default 0,
  repetidos smallint not null default 0,
  descartados smallint not null default 0,
  altas smallint not null default 0,
  -- Los negocios descartados por los filtros, ya clasificados: se recuperan sin gastar créditos
  resultados jsonb not null default '[]',
  saldo_despues integer,
  error text check (error is null or char_length(error) <= 500),
  creado timestamptz not null default now(),
  terminado timestamptz
);
create index prospecto_busquedas_idx on prospecto_busquedas (negocio_id, nicho, zona, pagina, creado desc);

create trigger prospecto_busquedas_agencia before insert or update on prospecto_busquedas
for each row execute function exigir_agencia();
