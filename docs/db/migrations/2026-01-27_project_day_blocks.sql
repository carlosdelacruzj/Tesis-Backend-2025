-- 2026-01-27_project_day_blocks.sql
-- Soporte de multiples locaciones por dia (bloques por dia)

-- ==============================
-- 1) Nueva tabla: bloques por dia
-- ==============================
CREATE TABLE IF NOT EXISTS T_ProyectoDiaBloque (
  PK_PDB_Cod INT NOT NULL AUTO_INCREMENT,
  FK_PD_Cod INT NOT NULL,
  PDB_Hora TIME DEFAULT NULL,
  PDB_Ubicacion VARCHAR(100) DEFAULT NULL,
  PDB_Direccion VARCHAR(150) DEFAULT NULL,
  PDB_Notas VARCHAR(255) DEFAULT NULL,
  PDB_Orden INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PK_PDB_Cod),
  UNIQUE KEY uq_pdb_dia_orden (FK_PD_Cod, PDB_Orden),
  KEY ix_pdb_dia (FK_PD_Cod),
  CONSTRAINT fk_pdb_pd
    FOREIGN KEY (FK_PD_Cod) REFERENCES T_ProyectoDia (PK_PD_Cod) ON DELETE CASCADE
);

-- ==============================
-- 2) Migrar datos existentes (1 bloque por dia)
-- ==============================
INSERT INTO T_ProyectoDiaBloque (FK_PD_Cod, PDB_Hora, PDB_Ubicacion, PDB_Direccion, PDB_Notas, PDB_Orden)
SELECT
  pd.PK_PD_Cod,
  pd.PD_Hora,
  pd.PD_Ubicacion,
  pd.PD_Direccion,
  pd.PD_Notas,
  1
FROM T_ProyectoDia pd
WHERE pd.PD_Hora IS NOT NULL
   OR pd.PD_Ubicacion IS NOT NULL
   OR pd.PD_Direccion IS NOT NULL
   OR pd.PD_Notas IS NOT NULL;

-- Eliminar campos del dia para evitar doble fuente (la info vive en bloques)
ALTER TABLE T_ProyectoDia
  DROP COLUMN PD_Hora,
  DROP COLUMN PD_Ubicacion,
  DROP COLUMN PD_Direccion,
  DROP COLUMN PD_Notas;

-- ==============================
-- 3) SP: crear proyecto desde pedido (dias + bloques)
-- ==============================
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
  DECLARE v_fecha_inicio DATE;
  DECLARE v_fecha_fin DATE;

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

  SELECT MIN(PE_Fecha), MAX(PE_Fecha)
  INTO v_fecha_inicio, v_fecha_fin
  FROM T_PedidoEvento
  WHERE FK_P_Cod = p_pedido_id;

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
      v_fecha_inicio,
      v_fecha_fin,
      NULLIF(TRIM(p_enlace), ''),
      NULLIF(TRIM(p_notas), ''),
      NULL,
      NULL
    );

    SET v_proyecto_id = LAST_INSERT_ID();

    -- Crear dias unicos
    INSERT INTO T_ProyectoDia (FK_Pro_Cod, PD_Fecha)
    SELECT v_proyecto_id, pe.PE_Fecha
    FROM T_PedidoEvento pe
    WHERE pe.FK_P_Cod = p_pedido_id
    GROUP BY pe.PE_Fecha;

    -- Crear bloques por dia desde eventos del pedido
    SET @pdb_orden := 0;
    SET @pdb_fecha := NULL;

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
        (@pdb_orden := IF(@pdb_fecha = pe.PE_Fecha, @pdb_orden + 1, 1)) AS PDB_Orden,
        (@pdb_fecha := pe.PE_Fecha) AS _set_fecha
      FROM T_PedidoEvento pe
      JOIN T_ProyectoDia pd
        ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = pe.PE_Fecha
      WHERE pe.FK_P_Cod = p_pedido_id
      ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod
    ) x;

    -- Asignar servicios por dia en el proyecto
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
END ;;
DELIMITER ;

-- ==============================
-- 4) SP: obtener proyecto (agrega bloques por dia)
-- ==============================
DROP PROCEDURE IF EXISTS sp_proyecto_obtener;
DELIMITER ;;
CREATE PROCEDURE sp_proyecto_obtener(IN p_id INT)
BEGIN
  -- 1) Proyecto (cabecera)
  SELECT
    pr.PK_Pro_Cod              AS proyectoId,
    pr.Pro_Nombre              AS proyectoNombre,
    pr.FK_P_Cod                AS pedidoId,
    pr.Pro_Estado              AS estadoId,
    ep.EPro_Nombre             AS estadoNombre,
    pr.FK_Em_Cod               AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion   AS fechaFinEdicion,
    pr.Pro_Revision_Edicion    AS edicion,
    pr.Pro_Revision_Multimedia AS multimedia,
    pr.Pro_Enlace              AS enlace,
    pr.Pro_Notas               AS notas,
    pr.created_at              AS createdAt,
    pr.updated_at              AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  LEFT JOIN T_Empleados em       ON em.PK_Em_Cod   = pr.FK_Em_Cod
  LEFT JOIN T_Usuario u          ON u.PK_U_Cod     = em.FK_U_Cod
  WHERE pr.PK_Pro_Cod = p_id;

  -- 2) Dias del proyecto
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.FK_Pro_Cod AS proyectoId,
    pd.PD_Fecha AS fecha,
    pd.PD_Hora AS hora,
    pd.PD_Ubicacion AS ubicacion,
    pd.PD_Direccion AS direccion,
    pd.PD_Notas AS notas
  FROM T_ProyectoDia pd
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pd.PK_PD_Cod;

  -- 3) Bloques (locaciones/horas) por dia
  SELECT
    pdb.PK_PDB_Cod AS bloqueId,
    pdb.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdb.PDB_Hora AS hora,
    pdb.PDB_Ubicacion AS ubicacion,
    pdb.PDB_Direccion AS direccion,
    pdb.PDB_Notas AS notas,
    pdb.PDB_Orden AS orden
  FROM T_ProyectoDiaBloque pdb
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdb.FK_PD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdb.PDB_Orden, pdb.PK_PDB_Cod;

  -- 4) Servicios por dia
  SELECT
    pds.PK_PDS_Cod AS id,
    pds.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ps.PK_PS_Cod AS pedidoServicioId,
    ps.FK_ExS_Cod AS eventoServicioId,
    ps.PS_Nombre AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad AS cantidad,
    ps.PS_Descuento AS descuento,
    ps.PS_Recargo AS recargo,
    ps.PS_Subtotal AS subtotal
  FROM T_ProyectoDiaServicio pds
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pds.FK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, ps.PS_Nombre, ps.PK_PS_Cod;

  -- 5) Empleados asignados por dia
  SELECT
    pde.PK_PDE_Cod AS asignacionId,
    pde.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pde.FK_Em_Cod AS empleadoId,
    CONCAT(u2.U_Nombre, ' ', u2.U_Apellido) AS empleadoNombre,
    pde.PDE_Estado AS estado,
    pde.PDE_Notas AS notas
  FROM T_ProyectoDiaEmpleado pde
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
  JOIN T_Empleados em2 ON em2.PK_Em_Cod = pde.FK_Em_Cod
  JOIN T_Usuario u2 ON u2.PK_U_Cod = em2.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pde.PK_PDE_Cod;

  -- 6) Equipos asignados por dia
  SELECT
    pdq.PK_PDQ_Cod AS asignacionId,
    pdq.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdq.FK_Eq_Cod AS equipoId,
    eq.Eq_Serie AS equipoSerie,
    mo.NMo_Nombre AS modelo,
    te.TE_Nombre AS tipoEquipo,
    eq.FK_EE_Cod AS estadoEquipoId,
    pdq.PDQ_Estado AS estado,
    pdq.PDQ_Notas AS notas,
    pdq.PDQ_Devuelto AS devuelto,
    pdq.PDQ_Fecha_Devolucion AS fechaDevolucion,
    pdq.PDQ_Estado_Devolucion AS estadoDevolucion,
    pdq.PDQ_Notas_Devolucion AS notasDevolucion,
    pdq.PDQ_Usuario_Devolucion AS usuarioDevolucion
  FROM T_ProyectoDiaEquipo pdq
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
  JOIN T_Equipo eq ON eq.PK_Eq_Cod = pdq.FK_Eq_Cod
  JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdq.PK_PDQ_Cod;

  -- 7) Requerimientos de personal por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ess.Staff_Rol AS rol,
    SUM(ess.Staff_Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioStaff ess ON ess.FK_ExS_Cod = exs.PK_ExS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, ess.Staff_Rol
  ORDER BY pd.PD_Fecha, ess.Staff_Rol;

  -- 8) Requerimientos de equipo por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    te.PK_TE_Cod AS tipoEquipoId,
    te.TE_Nombre AS tipoEquipoNombre,
    SUM(ese.Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioEquipo ese ON ese.FK_ExS_Cod = exs.PK_ExS_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = ese.FK_TE_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, te.PK_TE_Cod, te.TE_Nombre
  ORDER BY pd.PD_Fecha, te.TE_Nombre;
END ;;
DELIMITER ;
