-- migration_20260212_sp_pedido_pago_resumen_explicito.sql
-- Objetivo:
-- Exponer en sp_pedido_pago_resumen campos explicitos para evitar
-- calculos de fallback en backend:
--   - CostoTotalOriginal
--   - CostoTotalNeto
--   - CobrosPositivos
--   - NotasCredito
--
-- Mantiene compatibilidad con consumidores existentes devolviendo tambien:
--   CostoBase, Igv, CostoTotal, MontoAbonado, SaldoPendiente

USE defaultdb;

DROP PROCEDURE IF EXISTS `sp_pedido_pago_resumen`;

DELIMITER $$
CREATE PROCEDURE `sp_pedido_pago_resumen`(IN pPedidoId INT)
BEGIN
  SELECT
    CostoBase,
    Igv,
    CostoTotalOriginal,
    CostoTotalNeto,
    CobrosPositivos,
    NotasCredito,
    CostoTotal,
    MontoAbonado,
    SaldoPendiente
  FROM V_Pedido_Saldos
  WHERE PedidoId = pPedidoId;
END$$
DELIMITER ;

-- Verificacion sugerida:
-- SHOW CREATE PROCEDURE sp_pedido_pago_resumen;
-- CALL sp_pedido_pago_resumen(1);
