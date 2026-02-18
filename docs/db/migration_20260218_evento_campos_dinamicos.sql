-- Campos dinamicos por tipo de evento
-- Fecha: 2026-02-18
-- Objetivo:
-- 1) Guardar definicion de formulario por tipo de evento (schema).
-- 2) Guardar respuestas dinamicas por cotizacion y pedido (datosEvento).

SET NAMES utf8mb4;

-- ================================
-- T_Eventos.E_FormSchema (JSON)
-- ================================
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Eventos'
    AND column_name = 'E_FormSchema'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Eventos` ADD COLUMN `E_FormSchema` JSON NULL AFTER `E_IconUrl`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- Backfill: si no hay schema, usar arreglo vacio para facilitar consumo en front.
UPDATE `T_Eventos`
SET `E_FormSchema` = JSON_ARRAY()
WHERE `E_FormSchema` IS NULL
  AND `PK_E_Cod` > 0;

-- ==================================
-- T_Cotizacion.Cot_DatosEvento (JSON)
-- ==================================
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Cotizacion'
    AND column_name = 'Cot_DatosEvento'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Cotizacion` ADD COLUMN `Cot_DatosEvento` JSON NULL AFTER `Cot_Mensaje`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- ===============================
-- T_Pedido.P_DatosEvento (JSON)
-- ===============================
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Pedido'
    AND column_name = 'P_DatosEvento'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Pedido` ADD COLUMN `P_DatosEvento` JSON NULL AFTER `P_Mensaje`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;
