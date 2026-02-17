-- migration_20260217_sp_pagos_cerrados_cancelados_con_abono.sql
-- Objetivo:
-- 1) Mantener comportamiento actual de "cerrados".
-- 2) Incluir pedidos cancelados que ya tengan abonos (> 0), aunque no tengan NC.
--    Caso de negocio: cliente paga adelanto y luego cancela.
--    Debe verse en endpoint: GET /pagos/cerrados

USE defaultdb;
SET NAMES utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_cerrados`$$
CREATE PROCEDURE `sp_pedido_saldo_listar_cerrados`()
BEGIN
  DECLARE v_estado_pago_cerrado_id INT DEFAULT NULL;
  DECLARE v_estado_pedido_cancelado_id INT DEFAULT NULL;

  SELECT ep.PK_ESP_Cod
    INTO v_estado_pago_cerrado_id
  FROM T_Estado_Pago ep
  WHERE LOWER(TRIM(ep.ESP_Nombre)) = LOWER('Cerrado')
  LIMIT 1;

  SELECT epp.PK_EP_Cod
    INTO v_estado_pedido_cancelado_id
  FROM T_Estado_Pedido epp
  WHERE LOWER(TRIM(epp.EP_Nombre)) = LOWER('Cancelado')
  LIMIT 1;

  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  JOIN T_Pedido p ON p.PK_P_Cod = s.PedidoId
  WHERE
       COALESCE(p.P_CierreFinancieroTipo, 'NINGUNO') = 'RETENCION_CANCEL_CLIENTE'
    OR (v_estado_pago_cerrado_id IS NOT NULL AND s.EstadoPagoId = v_estado_pago_cerrado_id)
    OR (
         v_estado_pedido_cancelado_id IS NOT NULL
         AND s.EstadoPedidoId = v_estado_pedido_cancelado_id
         AND COALESCE(s.MontoAbonado, 0) > 0
       )
  ORDER BY s.PedidoId DESC;
END$$

DELIMITER ;

-- Verificacion sugerida:
-- CALL sp_pedido_saldo_listar_cerrados();
-- Luego probar endpoint:
-- GET /api/v1/pagos/cerrados

