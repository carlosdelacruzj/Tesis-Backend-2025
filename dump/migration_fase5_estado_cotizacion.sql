-- Fase 5: eliminar Cot_Estado y dejar solo FK_ECot_Cod
-- Ejecuta este script una sola vez en la BD.

UPDATE `T_Cotizacion` c
JOIN `T_Estado_Cotizacion` ec ON ec.`ECot_Nombre` = 'Borrador'
SET c.`FK_ECot_Cod` = ec.`PK_ECot_Cod`
WHERE c.`FK_ECot_Cod` IS NULL;

ALTER TABLE `T_Cotizacion`
  MODIFY COLUMN `FK_ECot_Cod` int NOT NULL DEFAULT 1;

ALTER TABLE `T_Cotizacion`
  DROP COLUMN `Cot_Estado`;
