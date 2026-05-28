-- ════════════════════════════════════════════════════════════════════
-- 004 — Índice único de slot: evita solapamiento de citas activas
--
-- Impide que dos citas no canceladas coincidan en el mismo negocio,
-- fecha y hora de inicio.
-- ════════════════════════════════════════════════════════════════════

create unique index if not exists uq_citas_slot
  on citas (negocio_id, fecha, hora_inicio)
  where estado <> 'cancelled';
