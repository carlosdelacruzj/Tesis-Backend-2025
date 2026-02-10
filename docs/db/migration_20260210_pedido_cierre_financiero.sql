-- Migracion: cierre financiero por cancelacion de cliente en pedido
-- Fecha: 2026-02-10
-- Objetivo:
--   Registrar casos donde el pedido se cierra por cancelacion del cliente
--   sin marcarlo falsamente como 'pagado total'.

SET @db_name := DATABASE();

-- 1) Tipo de cierre financiero
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'T_Pedido'
        AND COLUMN_NAME = 'P_CierreFinancieroTipo'
    ),
    'SELECT "P_CierreFinancieroTipo ya existe" AS msg',
    'ALTER TABLE `T_Pedido` ADD COLUMN `P_CierreFinancieroTipo` ENUM(''NINGUNO'',''RETENCION_CANCEL_CLIENTE'') NOT NULL DEFAULT ''NINGUNO'''
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Monto de cierre financiero
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'T_Pedido'
        AND COLUMN_NAME = 'P_CierreFinancieroMonto'
    ),
    'SELECT "P_CierreFinancieroMonto ya existe" AS msg',
    'ALTER TABLE `T_Pedido` ADD COLUMN `P_CierreFinancieroMonto` DECIMAL(10,2) NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Fecha de cierre financiero
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'T_Pedido'
        AND COLUMN_NAME = 'P_CierreFinancieroFecha'
    ),
    'SELECT "P_CierreFinancieroFecha ya existe" AS msg',
    'ALTER TABLE `T_Pedido` ADD COLUMN `P_CierreFinancieroFecha` DATETIME NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Notas de cierre financiero
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'T_Pedido'
        AND COLUMN_NAME = 'P_CierreFinancieroNotas'
    ),
    'SELECT "P_CierreFinancieroNotas ya existe" AS msg',
    'ALTER TABLE `T_Pedido` ADD COLUMN `P_CierreFinancieroNotas` VARCHAR(500) NULL'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) Indice opcional para reportes
SET @sql := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = @db_name
        AND TABLE_NAME = 'T_Pedido'
        AND INDEX_NAME = 'ix_pedido_cierre_financiero_tipo'
    ),
    'SELECT "ix_pedido_cierre_financiero_tipo ya existe" AS msg',
    'ALTER TABLE `T_Pedido` ADD INDEX `ix_pedido_cierre_financiero_tipo` (`P_CierreFinancieroTipo`)'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
