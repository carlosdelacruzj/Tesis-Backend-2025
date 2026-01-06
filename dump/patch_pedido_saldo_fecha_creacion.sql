-- Agrega fecha de creacion del pedido en la vista de saldos y en SPs de saldo.

DROP VIEW IF EXISTS V_Pedido_Saldos;

CREATE VIEW V_Pedido_Saldos AS
SELECT
  p.PK_P_Cod AS PedidoId,
  COALESCE(ev.PrimerFecha, p.P_Fecha_Creacion) AS Fecha,
  p.P_Fecha_Creacion AS FechaCreacion,
  pr.Proyecto AS Proyecto,
  COALESCE(sv.CostoTotal, 0) AS CostoTotal,
  COALESCE(ab.MontoAbonado, 0) AS MontoAbonado,
  (COALESCE(sv.CostoTotal, 0) - COALESCE(ab.MontoAbonado, 0)) AS SaldoPendiente,
  p.FK_ESP_Cod AS EstadoPagoId,
  p.FK_EP_Cod AS EstadoPedidoId
FROM T_Pedido p
LEFT JOIN (
  SELECT
    T_PedidoServicio.FK_P_Cod AS PedidoId,
    SUM(T_PedidoServicio.PS_Subtotal) AS CostoTotal
  FROM T_PedidoServicio
  GROUP BY T_PedidoServicio.FK_P_Cod
) sv ON sv.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT
    T_PedidoEvento.FK_P_Cod AS PedidoId,
    MIN(T_PedidoEvento.PE_Fecha) AS PrimerFecha
  FROM T_PedidoEvento
  GROUP BY T_PedidoEvento.FK_P_Cod
) ev ON ev.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT
    v.FK_P_Cod AS PedidoId,
    SUM(v.Pa_Monto_Depositado) AS MontoAbonado
  FROM T_Voucher v
  JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE ev.EV_Nombre = 'Aprobado'
  GROUP BY v.FK_P_Cod
) ab ON ab.PedidoId = p.PK_P_Cod
LEFT JOIN (
  SELECT
    T_Proyecto.FK_P_Cod AS PedidoId,
    MAX(T_Proyecto.Pro_Nombre) AS Proyecto
  FROM T_Proyecto
  GROUP BY T_Proyecto.FK_P_Cod
) pr ON pr.PedidoId = p.PK_P_Cod;

DROP PROCEDURE IF EXISTS sp_pedido_saldo_listar_pendientes;
DROP PROCEDURE IF EXISTS sp_pedido_saldo_listar_parciales;
DROP PROCEDURE IF EXISTS sp_pedido_saldo_listar_pagados;

DELIMITER ;;
CREATE PROCEDURE sp_pedido_saldo_listar_pendientes()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 1
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE sp_pedido_saldo_listar_parciales()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 2
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;

DELIMITER ;;
CREATE PROCEDURE sp_pedido_saldo_listar_pagados()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 3
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;
