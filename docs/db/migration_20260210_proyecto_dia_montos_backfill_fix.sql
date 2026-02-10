-- Fix de migracion: completar backfill de montos por dia en T_ProyectoDia
-- Ejecutar despues de haber creado columnas PD_MontoBase, PD_Igv, PD_MontoTotal.

UPDATE `T_ProyectoDia` pd
LEFT JOIN (
  SELECT
    pds.`FK_PD_Cod` AS diaId,
    ROUND(SUM(COALESCE(ps.`PS_PrecioUnit`, 0)), 2) AS montoBase
  FROM `T_ProyectoDiaServicio` pds
  JOIN `T_PedidoServicio` ps
    ON ps.`PK_PS_Cod` = pds.`FK_PS_Cod`
  GROUP BY pds.`FK_PD_Cod`
) calc
  ON calc.diaId = pd.`PK_PD_Cod`
SET
  pd.`PD_MontoBase` = COALESCE(calc.montoBase, 0),
  pd.`PD_Igv` = ROUND(COALESCE(calc.montoBase, 0) * 0.18, 2),
  pd.`PD_MontoTotal` = ROUND(COALESCE(calc.montoBase, 0) * 1.18, 2)
WHERE pd.`PK_PD_Cod` > 0;

