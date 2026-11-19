-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 013 · Interesados que agendan reunión por Cal.com (D-133)
-- Cal.com avisa al panel (webhook) cada vez que alguien agenda, cancela o cambia la hora.
-- Cada reserva queda aquí con lo que la persona respondió en /agendar. Desde Clientes →
-- Interesados se entra a la llamada y, si salió bien, se confirma y pasa a ser cliente.
-- ════════════════════════════════════════════════════════════════════

create table interesados (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios on delete cascade,
  -- Reserva de Cal.com. Una reprogramación cambia el uid: se actualiza la misma fila.
  cal_uid text not null check (cal_uid ~ '^[A-Za-z0-9_-]{6,80}$'),
  cal_booking_id bigint,
  nombre text not null check (char_length(nombre) between 1 and 120),
  correo text check (correo is null or char_length(correo) <= 254),
  -- Con indicativo y solo números (ej. 573001234567); null si no lo dejó
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{7,15}$'),
  -- Respuestas del formulario de /agendar (llegan en las notas de la cita)
  necesita text check (necesita is null or char_length(necesita) <= 120),
  tipo text check (tipo is null or tipo in ('pagina', 'catalogo', 'sistema', 'auditoria')),
  pagina_web text check (pagina_web is null or char_length(pagina_web) <= 200),
  cuando text check (cuando is null or char_length(cuando) <= 120),
  inversion text check (inversion is null or char_length(inversion) <= 120),
  autorizacion text check (autorizacion is null or char_length(autorizacion) <= 200),
  evento text check (evento is null or char_length(evento) <= 120),
  reunion_inicio timestamptz not null,
  reunion_fin timestamptz,
  zona_horaria text check (zona_horaria is null or char_length(zona_horaria) <= 60),
  -- Para entrar a la llamada y para ver o cambiar la reserva (solo https de sitios conocidos)
  enlace_llamada text check (enlace_llamada is null or enlace_llamada ~ '^https://'),
  enlace_reserva text check (enlace_reserva is null or enlace_reserva ~ '^https://'),
  -- agendada = esperando la reunión · confirmada = salió bien y ya es cliente
  -- cancelada = canceló en Cal.com · descartada = la reunión no avanzó
  estado text not null default 'agendada' check (estado in ('agendada', 'confirmada', 'cancelada', 'descartada')),
  cliente_id uuid references clientes on delete set null,
  cerrado_por text references "user" ("id") on delete set null,
  cerrado_en timestamptz,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now(),
  unique (cal_uid)
);
create index interesados_negocio_idx on interesados (negocio_id, estado, reunion_inicio);
create index interesados_cliente_idx on interesados (cliente_id) where cliente_id is not null;

-- Solo la agencia (igual que Finanzas): ningún cliente de página web tiene interesados aquí
create trigger interesados_agencia before insert or update on interesados
for each row execute function exigir_agencia();

-- El historial también registra lo que llega de Cal.com
alter table panel_historial drop constraint if exists panel_historial_entidad_check;
alter table panel_historial add constraint panel_historial_entidad_check
  check (entidad in ('proyecto', 'cliente', 'gasto', 'gasto-fijo', 'dias', 'paso', 'reparto', 'servicio', 'persona', 'sitio', 'ciudad', 'interesado'));
