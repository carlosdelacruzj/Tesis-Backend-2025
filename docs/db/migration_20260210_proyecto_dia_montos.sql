-- Migracion: montos por dia en proyecto + calculo automatico en SP de migracion
-- Fecha: 2026-02-10
-- Regla de negocio acordada:
--   monto base por dia = SUM(PS_PrecioUnit) de servicios asignados al dia
--   igv = base * 0.18
--   total = base + igv

-- 1) Nuevos campos en T_ProyectoDia
ALTER TABLE `T_ProyectoDia`
  ADD COLUMN `PD_MontoBase` DECIMAL(10,2) NULL AFTER `PD_Fecha`,
  ADD COLUMN `PD_Igv` DECIMAL(10,2) NULL AFTER `PD_MontoBase`,
  ADD COLUMN `PD_MontoTotal` DECIMAL(10,2) NULL AFTER `PD_Igv`;

-- 2) Backfill para dias ya existentes
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

-- 3) SP de migracion pedido -> proyecto con calculo de montos por dia
DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_proyecto_crear_desde_pedido`$$
CREATE PROCEDURE `sp_proyecto_crear_desde_pedido`(
  IN p_pedido_id INT,
  IN p_responsable_id INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255)
)
BEGIN
  DECLARE v_estado_id TINYINT;
  DECLARE v_proyecto_id INT;
  DECLARE v_nombre VARCHAR(50);

  IF p_pedido_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'pedidoId es requerido';
  END IF;

  IF (SELECT COUNT(*) FROM T_Proyecto WHERE FK_P_Cod = p_pedido_id) > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido ya tiene proyecto';
  END IF;

  SELECT COALESCE(NULLIF(TRIM(P_Nombre_Pedido), ''), CONCAT('Pedido ', p_pedido_id))
    INTO v_nombre
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_nombre IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido no existe';
  END IF;

  SELECT PK_EPro_Cod INTO v_estado_id
  FROM T_Estado_Proyecto
  WHERE LOWER(EPro_Nombre) = 'planificado'
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado proyecto Planificado no existe';
  END IF;

  START TRANSACTION;

    INSERT INTO T_Proyecto (
      Pro_Nombre,
      FK_P_Cod,
      Pro_Estado,
      FK_Em_Cod,
      EPro_Fecha_Inicio_Edicion,
      Pro_Fecha_Fin_Edicion,
      Pro_Enlace,
      Pro_Notas,
      Pro_Revision_Multimedia,
      Pro_Revision_Edicion
    ) VALUES (
      v_nombre,
      p_pedido_id,
      v_estado_id,
      p_responsable_id,
      NULL,
      NULL,
      NULLIF(TRIM(p_enlace), ''),
      NULLIF(TRIM(p_notas), ''),
      NULL,
      NULL
    );

    SET v_proyecto_id = LAST_INSERT_ID();

    INSERT INTO T_ProyectoDia (FK_Pro_Cod, PD_Fecha)
    SELECT v_proyecto_id, pe.PE_Fecha
    FROM T_PedidoEvento pe
    WHERE pe.FK_P_Cod = p_pedido_id
    GROUP BY pe.PE_Fecha;

    INSERT INTO T_ProyectoDiaBloque (FK_PD_Cod, PDB_Hora, PDB_Ubicacion, PDB_Direccion, PDB_Notas, PDB_Orden)
    SELECT
      x.FK_PD_Cod,
      x.PE_Hora,
      x.PE_Ubicacion,
      x.PE_Direccion,
      x.PE_Notas,
      x.PDB_Orden
    FROM (
      SELECT
        pd.PK_PD_Cod AS FK_PD_Cod,
        pe.PE_Fecha,
        pe.PE_Hora,
        pe.PE_Ubicacion,
        pe.PE_Direccion,
        pe.PE_Notas,
        ROW_NUMBER() OVER (
          PARTITION BY pe.PE_Fecha
          ORDER BY pe.PE_Hora, pe.PK_PE_Cod
        ) AS PDB_Orden
      FROM T_PedidoEvento pe
      JOIN T_ProyectoDia pd
        ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = pe.PE_Fecha
      WHERE pe.FK_P_Cod = p_pedido_id
    ) x;

    INSERT IGNORE INTO T_ProyectoDiaServicio (FK_PD_Cod, FK_PS_Cod)
    SELECT
      pd.PK_PD_Cod,
      psf.FK_PedServ_Cod
    FROM T_PedidoServicioFecha psf
    JOIN T_ProyectoDia pd
      ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = psf.PSF_Fecha
    WHERE psf.FK_P_Cod = p_pedido_id;

    -- Calculo y snapshot de montos por dia (regla: suma de precio unitario por dia)
    UPDATE T_ProyectoDia pd
    LEFT JOIN (
      SELECT
        pds.FK_PD_Cod AS diaId,
        ROUND(SUM(COALESCE(ps.PS_PrecioUnit, 0)), 2) AS montoBase
      FROM T_ProyectoDiaServicio pds
      JOIN T_PedidoServicio ps
        ON ps.PK_PS_Cod = pds.FK_PS_Cod
      WHERE pds.FK_PD_Cod IN (
        SELECT pd2.PK_PD_Cod
        FROM T_ProyectoDia pd2
        WHERE pd2.FK_Pro_Cod = v_proyecto_id
      )
      GROUP BY pds.FK_PD_Cod
    ) calc
      ON calc.diaId = pd.PK_PD_Cod
    SET
      pd.PD_MontoBase = COALESCE(calc.montoBase, 0),
      pd.PD_Igv = ROUND(COALESCE(calc.montoBase, 0) * 0.18, 2),
      pd.PD_MontoTotal = ROUND(COALESCE(calc.montoBase, 0) * 1.18, 2)
    WHERE pd.FK_Pro_Cod = v_proyecto_id;

  COMMIT;

  SELECT v_proyecto_id AS proyectoId;
END$$

DELIMITER ;
