-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 008 · Publicar "Mi sitio" en aratasan.com (D-117)
-- `datos` = borrador (lo que se guarda). `publicado` = lo que está en el sitio.
-- Al publicar, el panel copia el borrador a `publicado` y pide a Vercel
-- reconstruir el sitio; el sitio lee `publicado` desde /api/sitio al construirse.
-- ════════════════════════════════════════════════════════════════════
alter table config_sitio
  add column publicado jsonb check (publicado is null or jsonb_typeof(publicado) = 'object'),
  add column publicado_en timestamptz,
  add column publicado_por text references "user" ("id") on delete set null;

-- Publicar no es un cambio de textos: el historial y "actualizado" solo se mueven al guardar.
drop trigger config_sitio_version on config_sitio;
create trigger config_sitio_version
before insert or update of datos on config_sitio
for each row execute function config_sitio_guardar_version();
