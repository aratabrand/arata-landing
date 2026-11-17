-- ════════════════════════════════════════════════════════════════════
-- Panel de Arata San · 007 · La base trabaja en hora de Bogotá (D-116)
-- Neon viene en GMT: entre las 7 p. m. y la medianoche de Colombia,
-- `current_date` daba la fecha de mañana (clientes nuevos, inicio de proyectos…).
-- Aplica a las conexiones nuevas. Los datos guardados no cambian.
-- (Aplicada en Neon el 11 nov 2026 con el conector; este archivo la deja registrada.)
-- ════════════════════════════════════════════════════════════════════
do $$ begin
  execute format('alter database %I set timezone to %L', current_database(), 'America/Bogota');
end $$;
