-- Fase 1: columna FK_ECot_Cod + backfill desde Cot_Estado
-- Ejecuta este script una sola vez en la BD.

ALTER TABLE `T_Cotizacion`
  ADD COLUMN `FK_ECot_Cod` int DEFAULT NULL;

UPDATE `T_Cotizacion` c
JOIN `T_Estado_Cotizacion` ec
  ON ec.`ECot_Nombre` = c.`Cot_Estado`
SET c.`FK_ECot_Cod` = ec.`PK_ECot_Cod`;

ALTER TABLE `T_Cotizacion`
  ADD KEY `FK_T_Cotizacion_T_Estado_Cotizacion` (`FK_ECot_Cod`),
  ADD CONSTRAINT `FK_T_Cotizacion_T_Estado_Cotizacion`
    FOREIGN KEY (`FK_ECot_Cod`) REFERENCES `T_Estado_Cotizacion` (`PK_ECot_Cod`);
