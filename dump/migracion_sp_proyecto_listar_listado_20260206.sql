-- Migracion SP: sp_proyecto_listar con campos para listado
-- Fecha: 2026-02-06

DROP PROCEDURE IF EXISTS sp_proyecto_listar;

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
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pr.Pro_Notas                AS notas,
    pr.Pro_Enlace               AS enlace,
    pr.created_at               AS createdAt,
    pr.updated_at               AS updatedAt,

    -- ===== Campos extra para listado =====
    COALESCE(evProx.PE_Fecha, p.P_FechaEvento) AS eventoFecha,
    CASE
      WHEN COALESCE(evProx.PE_Fecha, p.P_FechaEvento) IS NULL THEN NULL
      ELSE DATEDIFF(COALESCE(evProx.PE_Fecha, p.P_FechaEvento), CURDATE())
    END AS diasParaEvento,
    COALESCE(evProx.PE_Ubicacion, p.P_Lugar) AS lugar,
    evProx.PE_Direccion AS ubicacion,

    p.FK_ESP_Cod AS estadoPagoId,
    esp.ESP_Nombre AS estadoPagoNombre,
    COALESCE(sal.SaldoPendiente, 0) AS saldoPendiente,

    COALESCE(pdqPend.cnt, 0) AS pendientesDevolucion,
    CASE WHEN COALESCE(pdqPend.cnt, 0) > 0 THEN 1 ELSE 0 END AS tienePendientes

  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  LEFT JOIN T_Empleados em       ON em.PK_Em_Cod   = pr.FK_Em_Cod
  LEFT JOIN T_Usuario u          ON u.PK_U_Cod     = em.FK_U_Cod
  LEFT JOIN T_Pedido p           ON p.PK_P_Cod     = pr.FK_P_Cod
  LEFT JOIN T_Estado_Pago esp    ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN V_Pedido_Saldos sal  ON sal.PedidoId  = p.PK_P_Cod

  LEFT JOIN T_PedidoEvento evProx
    ON evProx.PK_PE_Cod = COALESCE(
      (SELECT e1.PK_PE_Cod
       FROM T_PedidoEvento e1
       WHERE e1.FK_P_Cod = p.PK_P_Cod
         AND CONCAT(e1.PE_Fecha, ' ', COALESCE(e1.PE_Hora, '00:00:00')) >= NOW()
       ORDER BY e1.PE_Fecha, e1.PE_Hora
       LIMIT 1),
      (SELECT e2.PK_PE_Cod
       FROM T_PedidoEvento e2
       WHERE e2.FK_P_Cod = p.PK_P_Cod
       ORDER BY e2.PE_Fecha, e2.PE_Hora
       LIMIT 1)
    )

  LEFT JOIN (
    SELECT
      pd.FK_Pro_Cod AS proyectoId,
      COUNT(*) AS cnt
    FROM T_ProyectoDiaEquipo pdq
    JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
    WHERE pdq.PDQ_Devuelto IS NULL OR pdq.PDQ_Devuelto = 0
    GROUP BY pd.FK_Pro_Cod
  ) pdqPend ON pdqPend.proyectoId = pr.PK_Pro_Cod

  ORDER BY pr.PK_Pro_Cod DESC;
END;;
DELIMITER ;
