-- Contratos versionados por pedido
-- Fecha: 2026-02-18

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Version'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Version` INT NOT NULL DEFAULT 1 AFTER `FK_P_Cod`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Estado'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Estado` VARCHAR(20) NOT NULL DEFAULT ''BORRADOR'' AFTER `Cont_Version`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Snapshot'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Snapshot` LONGTEXT NULL AFTER `Cont_Estado`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_SnapshotHash'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_SnapshotHash` CHAR(64) NULL AFTER `Cont_Snapshot`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_EsVigente'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_EsVigente` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Cont_SnapshotHash`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Fecha_Crea'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Fecha_Crea` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `Cont_EsVigente`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Fecha_Cierre'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Fecha_Cierre` DATETIME NULL AFTER `Cont_Fecha_Crea`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND column_name = 'Cont_Pdf_Link'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE `T_Contrato` ADD COLUMN `Cont_Pdf_Link` VARCHAR(255) NULL AFTER `Cont_Link`',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

UPDATE `T_Contrato`
SET
  `Cont_SnapshotHash` = COALESCE(`Cont_SnapshotHash`, SHA2(CONCAT('legacy-', `PK_Cont_Cod`), 256)),
  `Cont_Estado` = COALESCE(NULLIF(`Cont_Estado`, ''), 'BORRADOR'),
  `Cont_Version` = COALESCE(`Cont_Version`, 1),
  `Cont_EsVigente` = COALESCE(`Cont_EsVigente`, 1)
WHERE `PK_Cont_Cod` > 0;

SET @idx_vigente_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND index_name = 'IX_T_Contrato_Pedido_Vigente'
);
SET @sql_idx_vigente := IF(
  @idx_vigente_exists = 0,
  'CREATE INDEX `IX_T_Contrato_Pedido_Vigente` ON `T_Contrato` (`FK_P_Cod`, `Cont_EsVigente`)',
  'SELECT 1'
);
PREPARE stmt_idx_vigente FROM @sql_idx_vigente;
EXECUTE stmt_idx_vigente;
DEALLOCATE PREPARE stmt_idx_vigente;

SET @idx_version_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'T_Contrato'
    AND index_name = 'IX_T_Contrato_Pedido_Version'
);
SET @sql_idx_version := IF(
  @idx_version_exists = 0,
  'CREATE INDEX `IX_T_Contrato_Pedido_Version` ON `T_Contrato` (`FK_P_Cod`, `Cont_Version`)',
  'SELECT 1'
);
PREPARE stmt_idx_version FROM @sql_idx_version;
EXECUTE stmt_idx_version;
DEALLOCATE PREPARE stmt_idx_version;
