-- Migracion: netear notas de credito en resumen de pagos por pedido
-- Objetivo:
-- 1) Separar cobros positivos de notas de credito (vouchers negativos)
-- 2) Mantener columnas actuales usadas por backend:
--    - CostoTotal (ahora neto de NC)
--    - MontoAbonado (solo cobros positivos)
--    - SaldoPendiente
-- 3) Exponer columnas auxiliares:
--    - CostoTotalOriginal, CostoTotalNeto, CobrosPositivos, NotasCredito

DROP VIEW IF EXISTS `V_Pedido_Saldos`;

CREATE VIEW `V_Pedido_Saldos` AS
SELECT
  p.`PK_P_Cod` AS `PedidoId`,
  COALESCE(ev.`PrimerFecha`, p.`P_Fecha_Creacion`) AS `Fecha`,
  p.`P_Fecha_Creacion` AS `FechaCreacion`,
  pr.`Proyecto` AS `Proyecto`,

  -- Base sin IGV
  (COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) AS `CostoBase`,
  ROUND((COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) * 0.18, 2) AS `Igv`,

  -- Total original (con IGV)
  ROUND((COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) * 1.18, 2) AS `CostoTotalOriginal`,

  -- Cobros positivos y NC por separado
  COALESCE(pay.`CobrosPositivos`, 0) AS `CobrosPositivos`,
  COALESCE(pay.`NotasCredito`, 0) AS `NotasCredito`,

  -- Total neto = original - NC (no negativo)
  GREATEST(
    ROUND((COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) * 1.18, 2)
      - COALESCE(pay.`NotasCredito`, 0),
    0
  ) AS `CostoTotalNeto`,

  -- Compatibilidad con backend actual:
  -- CostoTotal => neto, MontoAbonado => cobros positivos
  GREATEST(
    ROUND((COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) * 1.18, 2)
      - COALESCE(pay.`NotasCredito`, 0),
    0
  ) AS `CostoTotal`,
  COALESCE(pay.`CobrosPositivos`, 0) AS `MontoAbonado`,

  -- Saldo pendiente sobre total neto
  GREATEST(
    GREATEST(
      ROUND((COALESCE(sv.`CostoTotal`, 0) + COALESCE(p.`P_ViaticosMonto`, 0)) * 1.18, 2)
        - COALESCE(pay.`NotasCredito`, 0),
      0
    ) - COALESCE(pay.`CobrosPositivos`, 0),
    0
  ) AS `SaldoPendiente`,

  p.`FK_ESP_Cod` AS `EstadoPagoId`,
  p.`FK_EP_Cod` AS `EstadoPedidoId`
FROM `T_Pedido` p
LEFT JOIN (
  SELECT
    `T_PedidoServicio`.`FK_P_Cod` AS `PedidoId`,
    SUM(`T_PedidoServicio`.`PS_Subtotal`) AS `CostoTotal`
  FROM `T_PedidoServicio`
  GROUP BY `T_PedidoServicio`.`FK_P_Cod`
) sv
  ON sv.`PedidoId` = p.`PK_P_Cod`
LEFT JOIN (
  SELECT
    `T_PedidoEvento`.`FK_P_Cod` AS `PedidoId`,
    MIN(`T_PedidoEvento`.`PE_Fecha`) AS `PrimerFecha`
  FROM `T_PedidoEvento`
  GROUP BY `T_PedidoEvento`.`FK_P_Cod`
) ev
  ON ev.`PedidoId` = p.`PK_P_Cod`
LEFT JOIN (
  SELECT
    v.`FK_P_Cod` AS `PedidoId`,
    ROUND(SUM(CASE WHEN v.`Pa_Monto_Depositado` > 0 THEN v.`Pa_Monto_Depositado` ELSE 0 END), 2) AS `CobrosPositivos`,
    ROUND(SUM(CASE WHEN v.`Pa_Monto_Depositado` < 0 THEN ABS(v.`Pa_Monto_Depositado`) ELSE 0 END), 2) AS `NotasCredito`
  FROM `T_Voucher` v
  JOIN `T_Estado_voucher` ev2
    ON ev2.`PK_EV_Cod` = v.`FK_EV_Cod`
  WHERE ev2.`EV_Nombre` = 'Aprobado'
  GROUP BY v.`FK_P_Cod`
) pay
  ON pay.`PedidoId` = p.`PK_P_Cod`
LEFT JOIN (
  SELECT
    `T_Proyecto`.`FK_P_Cod` AS `PedidoId`,
    MAX(`T_Proyecto`.`Pro_Nombre`) AS `Proyecto`
  FROM `T_Proyecto`
  GROUP BY `T_Proyecto`.`FK_P_Cod`
) pr
  ON pr.`PedidoId` = p.`PK_P_Cod`;

