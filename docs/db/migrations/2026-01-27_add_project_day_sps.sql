-- 2026-01-27_add_project_day_sps.sql
-- SPs minimos para proyecto por dias

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

  -- 3) Servicios por dia
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

  -- 4) Empleados asignados por dia
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

  -- 5) Equipos asignados por dia
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

  -- 6) Requerimientos de personal por dia (segun servicios del dia)
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

  -- 7) Requerimientos de equipo por dia (segun servicios del dia)
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

DROP PROCEDURE IF EXISTS sp_proyecto_disponibilidad;
DELIMITER ;;
CREATE PROCEDURE sp_proyecto_disponibilidad(
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE,
  IN p_proyecto_id  INT,
  IN p_tipo_equipo  INT,
  IN p_cargo_id     INT
)
BEGIN
  IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaInicio y fechaFin son requeridos';
  END IF;
  IF p_fecha_fin < p_fecha_inicio THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaFin no puede ser menor a fechaInicio';
  END IF;

  /* Empleados operativos y activos */
  SELECT
    em.PK_Em_Cod           AS empleadoId,
    u.PK_U_Cod             AS usuarioId,
    u.U_Nombre             AS nombre,
    u.U_Apellido           AS apellido,
    te.PK_Tipo_Emp_Cod     AS cargoId,
    te.TiEm_Cargo          AS cargo,
    em.FK_Estado_Emp_Cod   AS estadoId,
    ee.EsEm_Nombre         AS estado,
    te.TiEm_OperativoCampo AS operativoCampo,
    IF(conf.conflictos IS NULL, 1, 0)                 AS disponible,
    COALESCE(conf.conflictos, JSON_ARRAY())           AS conflictos
  FROM T_Empleados em
  JOIN T_Usuario u            ON u.PK_U_Cod         = em.FK_U_Cod
  JOIN T_Tipo_Empleado te     ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
  LEFT JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = em.FK_Estado_Emp_Cod
  LEFT JOIN (
    SELECT
      pde.FK_Em_Cod AS empleadoId,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'proyectoId',  pd.FK_Pro_Cod,
          'fecha',       pd.PD_Fecha,
          'estado',      pde.PDE_Estado
        )
      ) AS conflictos
    FROM T_ProyectoDiaEmpleado pde
    JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
    WHERE (pde.PDE_Estado IS NULL OR pde.PDE_Estado NOT IN ('Cancelado', 'Anulado'))
      AND pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)
    GROUP BY pde.FK_Em_Cod
  ) conf ON conf.empleadoId = em.PK_Em_Cod
  WHERE te.TiEm_OperativoCampo = 1
    AND em.FK_Estado_Emp_Cod = 1
    AND (p_cargo_id IS NULL OR te.PK_Tipo_Emp_Cod = p_cargo_id)
  ORDER BY disponible DESC, te.TiEm_Cargo, u.U_Nombre, u.U_Apellido;

  /* Equipos */
  SELECT
    eq.PK_Eq_Cod     AS idEquipo,
    eq.Eq_Fecha_Ingreso AS fechaIngreso,
    eq.Eq_Serie      AS serie,
    mo.PK_IMo_Cod    AS idModelo,
    mo.NMo_Nombre    AS nombreModelo,
    ma.PK_IMa_Cod    AS idMarca,
    ma.NMa_Nombre    AS nombreMarca,
    teq.PK_TE_Cod    AS idTipoEquipo,
    teq.TE_Nombre    AS nombreTipoEquipo,
    eq.FK_EE_Cod     AS idEstado,
    eeq.EE_Nombre    AS nombreEstado,
    IF(confEq.conflictos IS NULL, 1, 0)       AS disponible,
    COALESCE(confEq.conflictos, JSON_ARRAY()) AS conflictos
  FROM T_Equipo eq
  JOIN T_Modelo mo       ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Marca  ma       ON ma.PK_IMa_Cod = mo.FK_IMa_Cod
  JOIN T_Tipo_Equipo teq ON teq.PK_TE_Cod = mo.FK_TE_Cod
  JOIN T_Estado_Equipo eeq ON eeq.PK_EE_Cod = eq.FK_EE_Cod
  LEFT JOIN (
    SELECT
      pdq.FK_Eq_Cod AS equipoId,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'proyectoId',  pd.FK_Pro_Cod,
          'fecha',       pd.PD_Fecha,
          'estado',      pdq.PDQ_Estado
        )
      ) AS conflictos
    FROM T_ProyectoDiaEquipo pdq
    JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
    WHERE (pdq.PDQ_Estado IS NULL OR pdq.PDQ_Estado NOT IN ('Cancelado', 'Anulado'))
      AND pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)
    GROUP BY pdq.FK_Eq_Cod
  ) confEq ON confEq.equipoId = eq.PK_Eq_Cod
  WHERE eeq.EE_Nombre = 'Disponible'
    AND (p_tipo_equipo IS NULL OR teq.PK_TE_Cod = p_tipo_equipo)
  ORDER BY disponible DESC, teq.TE_Nombre, mo.NMo_Nombre, eq.PK_Eq_Cod;
END ;;
DELIMITER ;
