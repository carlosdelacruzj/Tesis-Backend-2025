-- migration_20260217_fix_estado_pago_cancelados_con_abono.sql
-- Objetivo:
-- Sincronizar historico de pedidos para que
-- pedido cancelado + monto abonado > 0 => estado de pago Cerrado.

USE defaultdb;
SET NAMES utf8mb4;

SET @estado_pedido_cancelado := (
  SELECT PK_EP_Cod
  FROM T_Estado_Pedido
  WHERE LOWER(TRIM(EP_Nombre)) = LOWER('Cancelado')
  LIMIT 1
);

SET @estado_pago_cerrado := (
  SELECT PK_ESP_Cod
  FROM T_Estado_Pago
  WHERE LOWER(TRIM(ESP_Nombre)) = LOWER('Cerrado')
  LIMIT 1
);

UPDATE T_Pedido p
JOIN V_Pedido_Saldos s
  ON s.PedidoId = p.PK_P_Cod
SET p.FK_ESP_Cod = @estado_pago_cerrado
WHERE @estado_pedido_cancelado IS NOT NULL
  AND @estado_pago_cerrado IS NOT NULL
  AND p.FK_EP_Cod = @estado_pedido_cancelado
  AND COALESCE(s.MontoAbonado, 0) > 0
  AND p.FK_ESP_Cod <> @estado_pago_cerrado;

-- Verificacion sugerida:
-- SELECT p.PK_P_Cod, p.FK_EP_Cod, p.FK_ESP_Cod, s.MontoAbonado
-- FROM T_Pedido p
-- JOIN V_Pedido_Saldos s ON s.PedidoId = p.PK_P_Cod
-- WHERE p.FK_EP_Cod = @estado_pedido_cancelado
--   AND COALESCE(s.MontoAbonado,0) > 0
-- ORDER BY p.PK_P_Cod DESC;

