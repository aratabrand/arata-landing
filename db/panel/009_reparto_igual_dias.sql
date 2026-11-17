-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 009 · Reparto por partes iguales + pago por días (D-118)
--   ganancia = valor − gastos del proyecto
--   1.º se pagan los días trabajados: días × valor del día (8 horas = 1 día)
--   2.º lo que queda se reparte por partes iguales: socios activos + Arata (empresa)
-- Reemplaza la bolsa por horas y los % fijos (D-109). No había proyectos cerrados
-- ni horas registradas, así que no se recalcula nada viejo.
-- Rol nuevo 'finanzas': edita Finanzas, menos el valor del día y el equipo (solo 'dueno').
-- ════════════════════════════════════════════════════════════════════

alter table miembros drop constraint miembros_rol_check;
alter table miembros add constraint miembros_rol_check check (rol in ('dueno', 'finanzas', 'equipo', 'arata'));

-- Valor del día por defecto (COP). Cada proyecto puede tener el suyo.
alter table fin_config add column tarifa_dia bigint not null default 80000 check (tarifa_dia between 1000 and 10000000);
alter table fin_config_versiones add column tarifa_dia bigint;
alter table fin_proyectos add column tarifa_dia bigint check (tarifa_dia is null or tarifa_dia between 1000 and 10000000);

-- La bolsa y los % quedan sin uso (se conservan por el historial de versiones)
update fin_config set bolsa_trabajo_pct = 0;
comment on column fin_config.bolsa_trabajo_pct is 'Sin uso desde D-118 (reparto por partes iguales).';
comment on column fin_config.reparto is 'Sin uso desde D-118: las partes son los socios activos + la empresa.';

create or replace function fin_config_guardar_version() returns trigger
language plpgsql as $$
begin
  new.actualizado := now();
  insert into fin_config_versiones (negocio_id, bolsa_trabajo_pct, reparto, reserva_meses, tarifa_dia, creado_por)
  values (new.negocio_id, new.bolsa_trabajo_pct, new.reparto, new.reserva_meses, new.tarifa_dia, new.actualizado_por);
  return new;
end;
$$;

-- Trabajo en días (con medios días). La tabla conserva su nombre; `area` = actividad.
alter table fin_horas drop constraint fin_horas_horas_check;
alter table fin_horas rename column horas to dias;
alter table fin_horas add constraint fin_horas_dias_check check (dias > 0 and dias <= 365 and dias * 2 = round(dias * 2));
comment on column fin_horas.area is 'Actividad: qué hizo (diseño, desarrollo, contenido…).';
