-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 003 · Finanzas y equipo (D-109)
-- SOLO para el negocio de tipo 'agencia' (Arata San). Nunca para clientes
-- de página web ni catálogos: la base lo impide con un trigger.
--
-- Reglas (docs/panel-cliente/06-finanzas.md):
--   ganancia = valor del proyecto − gastos del proyecto
--   bolsa de trabajo = ganancia × bolsa_trabajo_pct, repartida por horas
--   resto = ganancia − bolsa, repartido con los % de `reparto` (socios + empresa)
--   Al cerrar un proyecto se guarda una copia de los % (reparto_congelado):
--   cambiar los % después no altera proyectos ya cerrados.
-- Todo en pesos colombianos (COP), sin decimales.
-- ════════════════════════════════════════════════════════════════════

-- Solo la agencia puede tener finanzas
create function exigir_agencia() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from negocios where id = new.negocio_id and tipo = 'agencia') then
    raise exception 'Finanzas y equipo son solo para la agencia (Arata San)';
  end if;
  return new;
end;
$$;

-- ── Personas del equipo ─────────────────────────────────────────────
create table equipo_personas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 60),
  area text not null check (char_length(area) between 2 and 60),
  es_socio boolean not null default true,
  usuario_id text references "user" ("id") on delete set null,
  activo boolean not null default true,
  orden int not null default 0,
  creado timestamptz not null default now(),
  unique (negocio_id, usuario_id)
);
create index equipo_personas_negocio_idx on equipo_personas (negocio_id);
create trigger equipo_personas_agencia before insert or update on equipo_personas
for each row execute function exigir_agencia();

-- ── Configuración del reparto + historial ───────────────────────────
-- reparto: [{"beneficiario": "<uuid persona>" | "empresa", "pct": 25}, …] (suma 100)
create table fin_config (
  negocio_id uuid primary key references negocios on delete cascade,
  bolsa_trabajo_pct numeric(5, 2) not null check (bolsa_trabajo_pct between 0 and 100),
  reparto jsonb not null check (jsonb_typeof(reparto) = 'array'),
  reserva_meses int not null default 3 check (reserva_meses between 0 and 24),
  actualizado timestamptz not null default now(),
  actualizado_por text references "user" ("id") on delete set null
);
create trigger fin_config_agencia before insert or update on fin_config
for each row execute function exigir_agencia();

create table fin_config_versiones (
  id bigint generated always as identity primary key,
  negocio_id uuid not null references negocios on delete cascade,
  bolsa_trabajo_pct numeric(5, 2) not null,
  reparto jsonb not null,
  reserva_meses int not null,
  creado timestamptz not null default now(),
  creado_por text references "user" ("id") on delete set null
);
create index fin_config_versiones_idx on fin_config_versiones (negocio_id, creado desc);

create function fin_config_guardar_version() returns trigger
language plpgsql as $$
begin
  new.actualizado := now();
  insert into fin_config_versiones (negocio_id, bolsa_trabajo_pct, reparto, reserva_meses, creado_por)
  values (new.negocio_id, new.bolsa_trabajo_pct, new.reparto, new.reserva_meses, new.actualizado_por);
  return new;
end;
$$;
create trigger fin_config_version before insert or update on fin_config
for each row execute function fin_config_guardar_version();

-- ── Proyectos (ventas) ──────────────────────────────────────────────
create table fin_proyectos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  nombre text not null check (char_length(nombre) between 2 and 90),
  cliente text check (cliente is null or char_length(cliente) <= 90),
  servicio text check (servicio is null or char_length(servicio) <= 60),
  estado text not null default 'en-curso' check (estado in ('propuesta', 'en-curso', 'cerrado')),
  valor bigint not null default 0 check (valor >= 0),
  fecha_cierre date,
  -- copia de {bolsa_trabajo_pct, reparto} al cerrar
  reparto_congelado jsonb check (reparto_congelado is null or jsonb_typeof(reparto_congelado) = 'object'),
  notas text check (notas is null or char_length(notas) <= 1000),
  creado timestamptz not null default now(),
  check (estado <> 'cerrado' or fecha_cierre is not null)
);
create index fin_proyectos_negocio_idx on fin_proyectos (negocio_id, estado, fecha_cierre desc);
create trigger fin_proyectos_agencia before insert or update on fin_proyectos
for each row execute function exigir_agencia();

-- ── Gastos (de un proyecto o de la empresa) ─────────────────────────
create table fin_gastos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  proyecto_id uuid references fin_proyectos on delete cascade, -- null = gasto de la empresa
  concepto text not null check (char_length(concepto) between 2 and 90),
  categoria text not null check (categoria in ('herramientas', 'publicidad', 'hosting-dominio', 'freelance', 'transporte', 'impuestos', 'inversion', 'otros')),
  valor bigint not null check (valor > 0),
  fecha date not null default current_date,
  creado timestamptz not null default now()
);
create index fin_gastos_negocio_idx on fin_gastos (negocio_id, fecha desc);
create index fin_gastos_proyecto_idx on fin_gastos (proyecto_id);
create trigger fin_gastos_agencia before insert or update on fin_gastos
for each row execute function exigir_agencia();

-- ── Horas trabajadas por persona y proyecto ─────────────────────────
create table fin_horas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references fin_proyectos on delete cascade,
  persona_id uuid not null references equipo_personas on delete cascade,
  area text not null check (char_length(area) between 2 and 60),
  horas numeric(6, 2) not null check (horas > 0 and horas <= 1000),
  fecha date not null default current_date,
  nota text check (nota is null or char_length(nota) <= 200),
  creado timestamptz not null default now()
);
create index fin_horas_proyecto_idx on fin_horas (proyecto_id);
create index fin_horas_persona_idx on fin_horas (persona_id);

-- ── Gastos fijos mensuales (para el punto de equilibrio) ────────────
create table fin_gastos_fijos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  concepto text not null check (char_length(concepto) between 2 and 90),
  valor_mensual bigint not null check (valor_mensual > 0),
  activo boolean not null default true,
  creado timestamptz not null default now()
);
create index fin_gastos_fijos_negocio_idx on fin_gastos_fijos (negocio_id);
create trigger fin_gastos_fijos_agencia before insert or update on fin_gastos_fijos
for each row execute function exigir_agencia();

-- ════════════════════════════════════════════════════════════════════
-- Datos iniciales de Arata San (los % son de arranque: se cambian en el panel)
-- ════════════════════════════════════════════════════════════════════
insert into equipo_personas (negocio_id, nombre, area, es_socio, usuario_id, orden)
select n.id, p.nombre, p.area, true,
       case when p.orden = 1 then (select m.usuario_id from miembros m where m.negocio_id = n.id and m.rol = 'dueno' order by m.creado limit 1) end,
       p.orden
from negocios n
cross join (values
  ('Sergio', 'Estrategia y diseño', 1),
  ('Andrés', 'Comercial', 2),
  ('Santiago', 'Tecnología', 3)
) as p (nombre, area, orden)
where n.slug = 'arata-san';

insert into fin_config (negocio_id, bolsa_trabajo_pct, reparto, reserva_meses)
select n.id, 30,
       (select jsonb_agg(x) from (
          select jsonb_build_object('beneficiario', e.id::text, 'pct', 25) as x
          from equipo_personas e where e.negocio_id = n.id order by e.orden
        ) s) || jsonb_build_array(jsonb_build_object('beneficiario', 'empresa', 'pct', 25)),
       3
from negocios n where n.slug = 'arata-san';
