-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 014 · Reuniones que hay que aceptar en Cal.com (D-134)
-- Con "confirmación manual" en Cal.com, quien agenda queda en espera hasta que Sergio o Andrés
-- la aceptan (filtro contra spam). Cal.com avisa: solicitada → aceptada (creada) o rechazada.
-- ════════════════════════════════════════════════════════════════════

-- true = llegó la solicitud y todavía nadie la acepta en Cal.com
alter table interesados add column por_aceptar boolean not null default false;

-- rechazada = Arata San la rechazó en Cal.com (spam o no aplica)
alter table interesados drop constraint if exists interesados_estado_check;
alter table interesados add constraint interesados_estado_check
  check (estado in ('agendada', 'confirmada', 'cancelada', 'descartada', 'rechazada'));
