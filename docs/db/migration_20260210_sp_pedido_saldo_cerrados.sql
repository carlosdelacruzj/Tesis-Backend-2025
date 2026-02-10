-- Migracion: alinear listados de pagos con estado Cerrado
-- Fecha: 2026-02-10
-- Objetivo:
--   1) Excluir pedidos con cierre financiero por cancelacion de cliente
--      de los listados pendientes/parciales/pagados.
--   2) Crear listado de cerrados para pedidos con:
--      - P_CierreFinancieroTipo = 'RETENCION_CANCEL_CLIENTE'
--      - o estado de pago 'Cerrado'

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_pagados`$$
CREATE PROCEDURE `sp_pedido_saldo_listar_pagados`()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  JOIN T_Pedido p ON p.PK_P_Cod = s.PedidoId
  WHERE s.EstadoPagoId = 3
    AND COALESCE(p.P_CierreFinancieroTipo, 'NINGUNO') <> 'RETENCION_CANCEL_CLIENTE'
  ORDER BY s.PedidoId DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_parciales`$$
CREATE PROCEDURE `sp_pedido_saldo_listar_parciales`()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  JOIN T_Pedido p ON p.PK_P_Cod = s.PedidoId
  WHERE s.EstadoPagoId = 2
    AND s.EstadoPedidoId <> 6
    AND COALESCE(p.P_CierreFinancieroTipo, 'NINGUNO') <> 'RETENCION_CANCEL_CLIENTE'
  ORDER BY s.PedidoId DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_pendientes`$$
CREATE PROCEDURE `sp_pedido_saldo_listar_pendientes`()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  JOIN T_Pedido p ON p.PK_P_Cod = s.PedidoId
  WHERE s.EstadoPagoId = 1
    AND s.EstadoPedidoId <> 6
    AND COALESCE(p.P_CierreFinancieroTipo, 'NINGUNO') <> 'RETENCION_CANCEL_CLIENTE'
  ORDER BY s.PedidoId DESC;
END$$

DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_cerrados`$$
CREATE PROCEDURE `sp_pedido_saldo_listar_cerrados`()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  JOIN T_Pedido p ON p.PK_P_Cod = s.PedidoId
  WHERE COALESCE(p.P_CierreFinancieroTipo, 'NINGUNO') = 'RETENCION_CANCEL_CLIENTE'
     OR s.EstadoPagoId = (
       SELECT ep.PK_ESP_Cod
       FROM T_Estado_Pago ep
       WHERE LOWER(ep.ESP_Nombre) = LOWER('Cerrado')
       LIMIT 1
     )
  ORDER BY s.PedidoId DESC;
END$$

DELIMITER ;
