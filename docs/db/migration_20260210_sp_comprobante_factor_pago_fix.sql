-- Migracion: corregir prorrateo de comprobante por voucher parcial
-- Fecha: 2026-02-10
-- Problema:
--   El SP redondeaba factorPago a 2 decimales antes de calcular montos,
--   generando descuadres en boletas/facturas parciales.
-- Solucion:
--   1) Mantener factorPago con precision para calculo (v_factorPago_raw).
--   2) Usar ese factor en detalle y totalSinIgv.
--   3) Mantener factorPago (redondeado) solo como dato de presentacion.

DELIMITER $$

DROP PROCEDURE IF EXISTS `SP_get_comprobante_pdf_by_voucher`$$
CREATE PROCEDURE `SP_get_comprobante_pdf_by_voucher`(IN p_PK_Pa_Cod INT)
BEGIN
  DECLARE v_total_raw DECIMAL(10,2) DEFAULT 0;
  DECLARE v_total     DECIMAL(10,2) DEFAULT 0;
  DECLARE v_pedidoId  INT DEFAULT NULL;

  DECLARE v_sumPedidoSinIgv DECIMAL(18,2) DEFAULT 0;
  DECLARE v_viaticosSinIgv  DECIMAL(10,2) DEFAULT 0;
  DECLARE v_basePedidoSinIgv DECIMAL(18,2) DEFAULT 0;

  DECLARE v_cnt INT DEFAULT 0;

  DECLARE v_factorPago_raw DECIMAL(18,8) DEFAULT 1;
  DECLARE v_factorPago     DECIMAL(18,8) DEFAULT 1;

  DECLARE v_totalSinIgv  DECIMAL(10,2) DEFAULT 0;
  DECLARE v_igv          DECIMAL(10,2) DEFAULT 0;
  DECLARE v_totalConIgv  DECIMAL(10,2) DEFAULT 0;

  DECLARE v_clienteId INT DEFAULT NULL;
  DECLARE v_userId INT DEFAULT NULL;

  DECLARE v_clienteTipoDoc VARCHAR(10) DEFAULT '';
  DECLARE v_clienteNumDoc VARCHAR(20) DEFAULT '';
  DECLARE v_clienteNombre VARCHAR(200) DEFAULT '';
  DECLARE v_clienteDireccion VARCHAR(255) DEFAULT '';
  DECLARE v_clienteCorreo VARCHAR(120) DEFAULT '';
  DECLARE v_clienteCelular VARCHAR(30) DEFAULT '';

  DECLARE v_tipo VARCHAR(20) DEFAULT 'BOLETA';
  DECLARE v_serie VARCHAR(10) DEFAULT 'B001';
  DECLARE v_numero VARCHAR(20) DEFAULT '';

  SELECT v.Pa_Monto_Depositado, v.FK_P_Cod
    INTO v_total_raw, v_pedidoId
  FROM T_Voucher v
  WHERE v.PK_Pa_Cod = p_PK_Pa_Cod
  LIMIT 1;

  IF v_pedidoId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voucher no encontrado o sin pedido asociado';
  END IF;

  IF IFNULL(v_total_raw,0) <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Este SP es solo para BOLETA/FACTURA (voucher positivo).';
  END IF;

  SET v_total = ROUND(ABS(IFNULL(v_total_raw,0)), 2);

  SELECT p.FK_Cli_Cod INTO v_clienteId
  FROM T_Pedido p
  WHERE p.PK_P_Cod = v_pedidoId
  LIMIT 1;

  SELECT c.FK_U_Cod INTO v_userId
  FROM T_Cliente c
  WHERE c.PK_Cli_Cod = v_clienteId
  LIMIT 1;

  SELECT
    CASE u.FK_TD_Cod
      WHEN 1 THEN 'DNI'
      WHEN 2 THEN 'CE'
      WHEN 3 THEN 'RUC'
      WHEN 4 THEN 'PAS'
      ELSE 'DNI'
    END,
    IFNULL(u.U_Numero_Documento,''),
    TRIM(CONCAT(IFNULL(u.U_Nombre,''), ' ', IFNULL(u.U_Apellido,''))),
    IFNULL(u.U_Direccion,''),
    IFNULL(u.U_Correo,''),
    IFNULL(u.U_Celular,'')
  INTO
    v_clienteTipoDoc,
    v_clienteNumDoc,
    v_clienteNombre,
    v_clienteDireccion,
    v_clienteCorreo,
    v_clienteCelular
  FROM T_Usuario u
  WHERE u.PK_U_Cod = v_userId
  LIMIT 1;

  IF v_clienteTipoDoc = 'RUC' THEN
    SET v_tipo = 'FACTURA';
    SET v_serie = 'F001';
  ELSE
    SET v_tipo = 'BOLETA';
    SET v_serie = 'B001';
  END IF;

  SET v_numero = LPAD(p_PK_Pa_Cod, 8, '0');

  SELECT COUNT(*), ROUND(SUM(IFNULL(ps.PS_Subtotal,0)),2)
    INTO v_cnt, v_sumPedidoSinIgv
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = v_pedidoId;

  SELECT ROUND(IFNULL(p.P_ViaticosMonto,0),2)
    INTO v_viaticosSinIgv
  FROM T_Pedido p
  WHERE p.PK_P_Cod = v_pedidoId
  LIMIT 1;

  SET v_basePedidoSinIgv = ROUND(IFNULL(v_sumPedidoSinIgv,0) + IFNULL(v_viaticosSinIgv,0), 2);

  IF v_basePedidoSinIgv <= 0 THEN
    SET v_factorPago_raw = 1;
    SET v_factorPago = 1;
    SET v_totalSinIgv = ROUND(v_total / 1.18, 2);
  ELSE
    SET v_factorPago_raw = v_total / NULLIF(v_basePedidoSinIgv * 1.18, 0);
    IF v_factorPago_raw > 1 THEN SET v_factorPago_raw = 1; END IF;

    -- Mostrar con redondeo, pero calcular con el factor crudo.
    SET v_factorPago = ROUND(v_factorPago_raw, 4);
    SET v_totalSinIgv = ROUND(v_basePedidoSinIgv * v_factorPago_raw, 2);
  END IF;

  SET v_igv = ROUND(v_totalSinIgv * 0.18, 2);
  SET v_totalConIgv = ROUND(v_totalSinIgv + v_igv, 2);

  SELECT
    'D''la Cruz Video y Fotografia' AS empresaRazonSocial,
    '10078799884'                  AS empresaRuc,
    'Cal. Piura MZ B4 Lt-10 S. J. de Miraflores' AS empresaDireccion,

    v_tipo   AS tipo,
    v_serie  AS serie,
    v_numero AS numero,

    DATE_FORMAT(NOW(), '%Y-%m-%d') AS fechaEmision,
    DATE_FORMAT(NOW(), '%H:%i')    AS horaEmision,
    '$' AS moneda,

    v_clienteTipoDoc AS clienteTipoDoc,
    v_clienteNumDoc  AS clienteNumDoc,
    v_clienteNombre  AS clienteNombre,
    v_clienteDireccion AS clienteDireccion,
    v_clienteCorreo  AS clienteCorreo,
    v_clienteCelular AS clienteCelular,

    v_pedidoId AS pedidoId,
    (SELECT IFNULL(p.P_Nombre_Pedido,'') FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoNombre,
    (SELECT p.P_FechaEvento FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoFechaEvento,
    (SELECT IFNULL(p.P_Lugar,'') FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoLugar,

    v_totalSinIgv AS opGravada,
    v_igv         AS igv,
    v_totalConIgv AS total,
    v_totalConIgv AS totalConIgv,

    0.00 AS anticipos,
    v_factorPago AS factorPago;

  SELECT
    CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2)) AS cantidad,
    'UNIDAD' AS unidad,
    CONCAT(
      IFNULL(ps.PS_Nombre,'Servicio'),
      IF(ps.PS_Descripcion IS NOT NULL AND ps.PS_Descripcion <> '', CONCAT(' - ', ps.PS_Descripcion), '')
    ) AS descripcion,
    ROUND(IFNULL(ps.PS_PrecioUnit,0) * v_factorPago_raw, 2) AS valorUnitario,
    0.00 AS descuento,
    ROUND(ROUND(IFNULL(ps.PS_PrecioUnit,0) * v_factorPago_raw, 2) * CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2)), 2) AS importe
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = v_pedidoId

  UNION ALL

  SELECT
    1.00 AS cantidad,
    'UNIDAD' AS unidad,
    'Viaticos' AS descripcion,
    ROUND(IFNULL(v_viaticosSinIgv,0) * v_factorPago_raw, 2) AS valorUnitario,
    0.00 AS descuento,
    ROUND(IFNULL(v_viaticosSinIgv,0) * v_factorPago_raw, 2) AS importe
  WHERE IFNULL(v_viaticosSinIgv,0) > 0

  ORDER BY descripcion;
END$$

DELIMITER ;
