-- Migracion SP: sp_proyecto_crear_desde_pedido sin auto-fechas de edicion
-- Fecha: 2026-02-07
USE defaultdb;

DROP PROCEDURE IF EXISTS sp_proyecto_crear_desde_pedido;

DELIMITER ;;
CREATE PROCEDURE sp_proyecto_crear_desde_pedido(
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
      ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod
    ) x;

    INSERT IGNORE INTO T_ProyectoDiaServicio (FK_PD_Cod, FK_PS_Cod)
    SELECT
      pd.PK_PD_Cod,
      psf.FK_PedServ_Cod
    FROM T_PedidoServicioFecha psf
    JOIN T_ProyectoDia pd
      ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = psf.PSF_Fecha
    WHERE psf.FK_P_Cod = p_pedido_id;

  COMMIT;

  SELECT v_proyecto_id AS proyectoId;
END;;
DELIMITER ;
