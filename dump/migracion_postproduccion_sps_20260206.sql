-- Migracion SPs postproduccion - 2026-02-06
-- Actualiza SPs de proyecto para incluir campos de pre-entrega, respaldo y entrega final.

DROP PROCEDURE IF EXISTS sp_proyecto_actualizar;
DROP PROCEDURE IF EXISTS sp_proyecto_listar;
DROP PROCEDURE IF EXISTS sp_proyecto_obtener;

DELIMITER ;;
CREATE PROCEDURE sp_proyecto_actualizar(
  IN p_id INT,
  IN p_nombre VARCHAR(50),
  IN p_fecha_inicio DATE,
  IN p_fecha_fin DATE,
  IN p_pre_entrega_enlace VARCHAR(255),
  IN p_pre_entrega_tipo VARCHAR(60),
  IN p_pre_entrega_feedback VARCHAR(255),
  IN p_pre_entrega_fecha DATE,
  IN p_respaldo_ubicacion VARCHAR(255),
  IN p_respaldo_notas VARCHAR(255),
  IN p_entrega_final_enlace VARCHAR(255),
  IN p_entrega_final_fecha DATE,
  IN p_estado TINYINT,
  IN p_responsable INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255),
  IN p_updated_at DATETIME
)
BEGIN
  UPDATE T_Proyecto
  SET Pro_Nombre = COALESCE(NULLIF(TRIM(p_nombre), ''), Pro_Nombre),
      Pro_Estado = COALESCE(p_estado, Pro_Estado),
      FK_Em_Cod = COALESCE(p_responsable, FK_Em_Cod),
      EPro_Fecha_Inicio_Edicion = COALESCE(p_fecha_inicio, EPro_Fecha_Inicio_Edicion),
      Pro_Fecha_Fin_Edicion = COALESCE(p_fecha_fin, Pro_Fecha_Fin_Edicion),
      Pro_Pre_Entrega_Enlace = COALESCE(NULLIF(TRIM(p_pre_entrega_enlace), ''), Pro_Pre_Entrega_Enlace),
      Pro_Pre_Entrega_Tipo = COALESCE(NULLIF(TRIM(p_pre_entrega_tipo), ''), Pro_Pre_Entrega_Tipo),
      Pro_Pre_Entrega_Feedback = COALESCE(NULLIF(TRIM(p_pre_entrega_feedback), ''), Pro_Pre_Entrega_Feedback),
      Pro_Pre_Entrega_Fecha = COALESCE(p_pre_entrega_fecha, Pro_Pre_Entrega_Fecha),
      Pro_Respaldo_Ubicacion = COALESCE(NULLIF(TRIM(p_respaldo_ubicacion), ''), Pro_Respaldo_Ubicacion),
      Pro_Respaldo_Notas = COALESCE(NULLIF(TRIM(p_respaldo_notas), ''), Pro_Respaldo_Notas),
      Pro_Entrega_Final_Enlace = COALESCE(NULLIF(TRIM(p_entrega_final_enlace), ''), Pro_Entrega_Final_Enlace),
      Pro_Entrega_Final_Fecha = COALESCE(p_entrega_final_fecha, Pro_Entrega_Final_Fecha),
      Pro_Enlace = COALESCE(NULLIF(TRIM(p_enlace), ''), Pro_Enlace),
      Pro_Notas = COALESCE(NULLIF(TRIM(p_notas), ''), Pro_Notas),
      updated_at = COALESCE(p_updated_at, updated_at)
  WHERE PK_Pro_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE sp_proyecto_listar()
BEGIN
  SELECT
    pr.PK_Pro_Cod               AS proyectoId,
    pr.Pro_Nombre               AS proyectoNombre,
    pr.FK_P_Cod                 AS pedidoId,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion    AS fechaFinEdicion,
    pr.Pro_Pre_Entrega_Enlace   AS preEntregaEnlace,
    pr.Pro_Pre_Entrega_Tipo     AS preEntregaTipo,
    pr.Pro_Pre_Entrega_Feedback AS preEntregaFeedback,
    pr.Pro_Pre_Entrega_Fecha    AS preEntregaFecha,
    pr.Pro_Respaldo_Ubicacion   AS respaldoUbicacion,
    pr.Pro_Respaldo_Notas       AS respaldoNotas,
    pr.Pro_Entrega_Final_Enlace AS entregaFinalEnlace,
    pr.Pro_Entrega_Final_Fecha  AS entregaFinalFecha,
    pr.Pro_Estado               AS estadoId,
    ep.EPro_Nombre              AS estadoNombre,
    pr.FK_Em_Cod                AS responsableId,
    pr.Pro_Notas                AS notas,
    pr.Pro_Enlace               AS enlace,
    pr.created_at               AS createdAt,
    pr.updated_at               AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  ORDER BY pr.PK_Pro_Cod DESC;
END;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE sp_proyecto_obtener(IN p_id INT)
BEGIN
  -- 1) Proyecto (cabecera)
  SELECT
    pr.PK_Pro_Cod               AS proyectoId,
    pr.Pro_Nombre               AS proyectoNombre,
    pr.FK_P_Cod                 AS pedidoId,
    pr.Pro_Estado               AS estadoId,
    ep.EPro_Nombre              AS estadoNombre,
    pr.FK_Em_Cod                AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion    AS fechaFinEdicion,
    pr.Pro_Pre_Entrega_Enlace   AS preEntregaEnlace,
    pr.Pro_Pre_Entrega_Tipo     AS preEntregaTipo,
    pr.Pro_Pre_Entrega_Feedback AS preEntregaFeedback,
    pr.Pro_Pre_Entrega_Fecha    AS preEntregaFecha,
    pr.Pro_Respaldo_Ubicacion   AS respaldoUbicacion,
    pr.Pro_Respaldo_Notas       AS respaldoNotas,
    pr.Pro_Entrega_Final_Enlace AS entregaFinalEnlace,
    pr.Pro_Entrega_Final_Fecha  AS entregaFinalFecha,
    pr.Pro_Enlace               AS enlace,
    pr.Pro_Notas                AS notas,
    pr.created_at               AS createdAt,
    pr.updated_at               AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  LEFT JOIN T_Empleados em       ON em.PK_Em_Cod   = pr.FK_Em_Cod
  LEFT JOIN T_Usuario u          ON u.PK_U_Cod     = em.FK_U_Cod
  WHERE pr.PK_Pro_Cod = p_id;

  -- 2) Dias del proyecto (con estado)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.FK_Pro_Cod AS proyectoId,
    pd.PD_Fecha AS fecha,
    pd.FK_EPD_Cod AS estadoDiaId,
    epd.EPD_Nombre AS estadoDiaNombre
  FROM T_ProyectoDia pd
  LEFT JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
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
    pd.PK_PD_Cod AS diaId,
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
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pds.PK_PDS_Cod;

  -- 5) Empleados por dia
  SELECT
    pde.PK_PDE_Cod AS asignacionId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pde.FK_Em_Cod AS empleadoId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS empleadoNombre,
    pde.PDE_Notas AS notas
  FROM T_ProyectoDiaEmpleado pde
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
  JOIN T_Empleados em ON em.PK_Em_Cod = pde.FK_Em_Cod
  JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pde.PK_PDE_Cod;

  -- 6) Equipos por dia
  SELECT
    pdq.PK_PDQ_Cod AS asignacionId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdq.FK_Eq_Cod AS equipoId,
    eq.Eq_Serie AS equipoSerie,
    mo.NMo_Nombre AS modelo,
    te.TE_Nombre AS tipoEquipo,
    eq.FK_EE_Cod AS estadoEquipoId,
    pdq.FK_Em_Cod AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
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
  LEFT JOIN T_Empleados em ON em.PK_Em_Cod = pdq.FK_Em_Cod
  LEFT JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
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

  -- 9) Incidencias por dia
  SELECT
    pdi.PK_PDI_Cod AS incidenciaId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdi.PDI_Tipo AS tipo,
    pdi.PDI_Descripcion AS descripcion,
    pdi.PDI_FechaHora_Evento AS fechaHoraEvento,
    pdi.FK_U_Cod AS usuarioId,
    pdi.FK_Eq_Cod AS equipoId,
    pdi.FK_Eq_Reemplazo_Cod AS equipoReemplazoId,
    pdi.FK_Em_Cod AS empleadoId,
    pdi.FK_Em_Reemplazo_Cod AS empleadoReemplazoId,
    pdi.created_at AS createdAt
  FROM T_ProyectoDiaIncidencia pdi
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdi.FK_PD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdi.PK_PDI_Cod;
END;;
DELIMITER ;
