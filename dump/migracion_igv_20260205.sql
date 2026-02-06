-- Migracion IGV pedidos (base + igv + total) - 2026-02-05
-- Aplica IGV 18% sobre (servicios + viaticos)

-- MySQL no permite variables en VIEW; usar literal fijo
SET @igv_rate := 0.18;

-- =====================
-- Vista V_Pedido_Saldos
-- =====================
DROP VIEW IF EXISTS V_Pedido_Saldos;
CREATE VIEW V_Pedido_Saldos AS
SELECT
  p.PK_P_Cod AS PedidoId,
  COALESCE(ev.PrimerFecha, p.P_Fecha_Creacion) AS Fecha,
  p.P_Fecha_Creacion AS FechaCreacion,
  pr.Proyecto AS Proyecto,
  (COALESCE(sv.CostoTotal, 0) + COALESCE(p.P_ViaticosMonto, 0)) AS CostoBase,
  ROUND((COALESCE(sv.CostoTotal, 0) + COALESCE(p.P_ViaticosMonto, 0)) * 0.18, 2) AS Igv,
  ROUND((COALESCE(sv.CostoTotal, 0) + COALESCE(p.P_ViaticosMonto, 0)) * 1.18, 2) AS CostoTotal,
  COALESCE(ab.MontoAbonado, 0) AS MontoAbonado,
  ROUND(
    ROUND((COALESCE(sv.CostoTotal, 0) + COALESCE(p.P_ViaticosMonto, 0)) * 1.18, 2)
    - COALESCE(ab.MontoAbonado, 0),
    2
  ) AS SaldoPendiente,
  p.FK_ESP_Cod AS EstadoPagoId,
  p.FK_EP_Cod AS EstadoPedidoId
FROM T_Pedido p
LEFT JOIN (
  SELECT FK_P_Cod AS PedidoId, SUM(PS_Subtotal) AS CostoTotal
  FROM T_PedidoServicio
  GROUP BY FK_P_Cod
) sv ON sv.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT FK_P_Cod AS PedidoId, MIN(PE_Fecha) AS PrimerFecha
  FROM T_PedidoEvento
  GROUP BY FK_P_Cod
) ev ON ev.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT v.FK_P_Cod AS PedidoId, SUM(v.Pa_Monto_Depositado) AS MontoAbonado
  FROM T_Voucher v
  JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE ev.EV_Nombre = 'Aprobado'
  GROUP BY v.FK_P_Cod
) ab ON ab.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT FK_P_Cod AS PedidoId, MAX(Pro_Nombre) AS Proyecto
  FROM T_Proyecto
  GROUP BY FK_P_Cod
) pr ON pr.PedidoId = p.PK_P_Cod;

-- =====================
-- SP sp_pedido_listar
-- =====================
DROP PROCEDURE IF EXISTS sp_pedido_listar;
DELIMITER ;;
CREATE PROCEDURE sp_pedido_listar()
BEGIN
  DECLARE v_igv_rate DECIMAL(6,4) DEFAULT 0.18;

  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)
    END                                                  AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,
    p.P_Dias                                             AS dias,
    p.P_ViaticosMonto                                    AS viaticosMonto,
    p.P_Lugar                                            AS Lugar,

    -- Proximo evento elegido (futuro mas cercano; si no hay, el primero)
    evProx.PE_Fecha                                      AS ProxFecha,
    TIME_FORMAT(evProx.PE_Hora, '%H:%i:%s')              AS ProxHora,
    CASE DAYOFWEEK(evProx.PE_Fecha)
      WHEN 1 THEN 'dom' WHEN 2 THEN 'lun' WHEN 3 THEN 'mar'
      WHEN 4 THEN 'mie' WHEN 5 THEN 'jue' WHEN 6 THEN 'vie'
      WHEN 7 THEN 'sab' ELSE NULL
    END                                                  AS ProxDia,
    evProx.PE_Ubicacion                                  AS Ubicacion,

    -- Tipo de evento (E_Nombre) segun primer item del pedido
    (SELECT e.E_Nombre
       FROM T_PedidoServicio ps
       JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
       JOIN T_Eventos e          ON e.PK_E_Cod     = exs.PK_E_Cod
      WHERE ps.FK_P_Cod = p.PK_P_Cod
      ORDER BY ps.PK_PS_Cod
      LIMIT 1)                                           AS TipoEvento,

    -- Totales por moneda (string listo para tabla)
    (
      SELECT GROUP_CONCAT(
        CONCAT(
          t.moneda,
          ' ',
          FORMAT((t.total + COALESCE(p.P_ViaticosMonto, 0)) * (1 + v_igv_rate), 2)
        ) SEPARATOR ' | '
      )
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,

    -- Totales por moneda en JSON
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'moneda',
          t.moneda,
          'total',
          (t.total + COALESCE(p.P_ViaticosMonto, 0)) * (1 + v_igv_rate)
        )
      )
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalesJSON,

    COALESCE(ep.EP_Nombre, CONCAT('Estado #', p.FK_EP_Cod)) AS Estado,
    COALESCE(esp.ESP_Nombre, CONCAT('Pago #', p.FK_ESP_Cod)) AS Pago,
    p.FK_Em_Cod                                              AS ResponsableId

  FROM T_Pedido p
  JOIN T_Cliente c      ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u      ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod  = p.FK_EP_Cod
  LEFT JOIN T_Estado_Pago  esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod

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
  ORDER BY p.PK_P_Cod DESC;
END;;
DELIMITER ;

-- =====================
-- SP sp_pedido_pago_resumen
-- =====================
DROP PROCEDURE IF EXISTS sp_pedido_pago_resumen;
DELIMITER ;;
CREATE PROCEDURE sp_pedido_pago_resumen(IN pPedidoId INT)
BEGIN
  SELECT
    CostoBase,
    Igv,
    CostoTotal,
    MontoAbonado,
    SaldoPendiente
  FROM V_Pedido_Saldos
  WHERE PedidoId = pPedidoId;
END;;
DELIMITER ;

-- =====================
-- SP sp_pedido_listar_por_cliente_detalle
-- =====================
DROP PROCEDURE IF EXISTS sp_pedido_listar_por_cliente_detalle;
DELIMITER ;;
CREATE PROCEDURE sp_pedido_listar_por_cliente_detalle(
  IN p_cliente_id INT
)
BEGIN
  DECLARE v_igv_rate DECIMAL(6,4) DEFAULT 0.18;

  IF p_cliente_id IS NULL OR p_cliente_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cliente_id debe ser mayor que cero';
  END IF;

  SELECT
    p.PK_P_Cod AS pedidoId,
    p.FK_Cli_Cod AS clienteId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.P_Nombre_Pedido AS nombrePedido,
    p.P_Observaciones AS observaciones,
    p.FK_Cot_Cod AS cotizacionId,
    ep.EP_Nombre AS estadoPedido,
    esp.ESP_Nombre AS estadoPago,
    p.FK_Em_Cod AS empleadoId,
    MAX(CONCAT_WS(' ', uEm.U_Nombre, uEm.U_Apellido)) AS empleadoNombre,
    p.P_ViaticosMonto AS viaticosMonto,
    p.P_Lugar AS lugar,
    COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) AS subtotal,
    COALESCE(
      sal.Igv,
      ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * v_igv_rate, 2)
    ) AS igv,
    COALESCE(
      sal.CostoTotal,
      ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * (1 + v_igv_rate), 2)
    ) AS total,
    COALESCE(sal.MontoAbonado, 0) AS montoAbonado,
    COALESCE(
      sal.SaldoPendiente,
      COALESCE(
        sal.CostoTotal,
        ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * (1 + v_igv_rate), 2)
      ) - COALESCE(sal.MontoAbonado, 0),
      0
    ) AS saldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    COALESCE(ev.cantidadEventos, 0) AS cantidadEventos,
    COALESCE(it.cantidadItems, 0) AS cantidadItems
  FROM T_Pedido p
  JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
  JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN T_Empleados em ON em.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario uEm ON uEm.PK_U_Cod = em.FK_U_Cod
  LEFT JOIN V_Pedido_Saldos sal ON sal.PedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      MIN(PE_Fecha) AS primerEventoFecha,
      MAX(PE_Fecha) AS ultimoEventoFecha,
      COUNT(*) AS cantidadEventos
    FROM T_PedidoEvento
    GROUP BY FK_P_Cod
  ) ev ON ev.pedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      COUNT(*) AS cantidadItems,
      SUM(
        COALESCE(
          PS_Subtotal,
          (COALESCE(PS_PrecioUnit,0) * COALESCE(PS_Cantidad,1))
          - COALESCE(PS_Descuento,0)
          + COALESCE(PS_Recargo,0)
        )
      ) AS totalCalculado
    FROM T_PedidoServicio
    GROUP BY FK_P_Cod
  ) it ON it.pedidoId = p.PK_P_Cod
  WHERE p.FK_Cli_Cod = p_cliente_id
  GROUP BY
    p.PK_P_Cod,
    p.FK_Cli_Cod,
    p.P_Fecha_Creacion,
    p.P_Nombre_Pedido,
    p.P_Observaciones,
    p.FK_Cot_Cod,
    ep.EP_Nombre,
    esp.ESP_Nombre,
    p.FK_Em_Cod,
    p.P_ViaticosMonto,
    p.P_Lugar,
    sal.CostoBase,
    sal.Igv,
    sal.CostoTotal,
    sal.MontoAbonado,
    sal.SaldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    ev.cantidadEventos,
    it.cantidadItems,
    it.totalCalculado
  ORDER BY p.P_Fecha_Creacion DESC;
END;;
DELIMITER ;
