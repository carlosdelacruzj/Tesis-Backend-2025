-- Migracion: Campos de cancelacion por dia + enlace a Nota de Credito
-- Fecha: 2026-02-10
-- Tabla objetivo: T_ProyectoDia
--
-- Alineado con front:
--   responsable: CLIENTE | INTERNO
--   motivo: segun responsable (validacion en backend)

ALTER TABLE `T_ProyectoDia`
  ADD COLUMN `PD_CancelResponsable` ENUM('CLIENTE','INTERNO') NULL AFTER `PD_Fecha`,
  ADD COLUMN `PD_CancelMotivo` VARCHAR(255) NULL AFTER `PD_CancelResponsable`,
  ADD COLUMN `PD_CancelNotas` VARCHAR(500) NULL AFTER `PD_CancelMotivo`,
  ADD COLUMN `PD_CancelFecha` DATETIME NULL AFTER `PD_CancelNotas`,
  ADD COLUMN `PD_NC_Requerida` TINYINT(1) NOT NULL DEFAULT 0 AFTER `PD_CancelFecha`,
  ADD COLUMN `PD_NC_VoucherId` INT NULL AFTER `PD_NC_Requerida`;

ALTER TABLE `T_ProyectoDia`
  ADD INDEX `ix_proyecto_dia_nc_voucher` (`PD_NC_VoucherId`);

ALTER TABLE `T_ProyectoDia`
  ADD CONSTRAINT `fk_proyecto_dia_nc_voucher`
    FOREIGN KEY (`PD_NC_VoucherId`)
    REFERENCES `T_Voucher` (`PK_Pa_Cod`)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

