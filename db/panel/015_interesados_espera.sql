-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 015 · Interesados "En espera" (D-141)
-- Después de la reunión, el cliente dice "te confirmo": se pone en espera con una nota y un plazo
-- (máximo una semana). El aviso de las 8 a. m. recuerda escribirle un día antes y el día del plazo.
-- ════════════════════════════════════════════════════════════════════

-- espera = la reunión salió y quedó en confirmar; se le escribe al cumplirse el plazo
alter table interesados drop constraint if exists interesados_estado_check;
alter table interesados add constraint interesados_estado_check
  check (estado in ('agendada', 'espera', 'confirmada', 'cancelada', 'descartada', 'rechazada'));

-- Hasta cuándo esperamos (fecha de Bogotá; la base está en America/Bogota, D-116)
alter table interesados add column espera_hasta date;

-- Notas del seguimiento: quién escribió qué y cuándo (no se editan; se agregan)
create table interesado_notas (
  id uuid primary key default gen_random_uuid(),
  interesado_id uuid not null references interesados on delete cascade,
  negocio_id uuid not null references negocios on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  usuario_id text references "user" ("id") on delete set null,
  quien text not null check (char_length(quien) between 1 and 80),
  creado timestamptz not null default now()
);
create index interesado_notas_idx on interesado_notas (interesado_id, creado desc);
create trigger interesado_notas_agencia before insert or update on interesado_notas
for each row execute function exigir_agencia();

-- Recordatorios ya enviados (un aviso por interesado, tipo y día; no se repite)
create table avisos_interesados (
  interesado_id uuid not null references interesados on delete cascade,
  tipo text not null check (tipo in ('manana', 'hoy')),
  fecha date not null,
  primary key (interesado_id, tipo, fecha)
);
