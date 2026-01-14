-- Fase 17: actualizar SP de cotizacion -> pedido para copiar servicios y eventos
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_cotizacion_convertir_a_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_convertir_a_pedido`(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,           -- FK_Em_Cod responsable del pedido
  IN  p_nombre_pedido VARCHAR(225),  -- opcional; si NULL se autogenera
  IN  p_fecha_hoy     DATE,          -- fecha de referencia (Lima)
  OUT o_pedido_id     INT
)
BEGIN
  DECLARE v_fk_cli      INT;
  DECLARE v_tipo_evento VARCHAR(40);
  DECLARE v_fecha_ev    DATE;
  DECLARE v_lugar       VARCHAR(150);
  DECLARE v_estado      VARCHAR(20);
  DECLARE v_nombre      VARCHAR(225);
  DECLARE v_fecha_ref   DATE;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET v_fecha_ref = COALESCE(p_fecha_hoy, CURDATE());

  -- 1) Leer cotizacion y bloquearla
  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,     v_estado
  FROM T_Cotizacion c
  JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotizacion no encontrada';
  END IF;

  -- 2) Validar estado
  IF v_estado <> 'Aceptada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden migrar cotizaciones en estado Aceptada';
  END IF;

  -- 3) Validar cliente (cotizacion sin cliente no migra)
  IF v_fk_cli IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotizacion no tiene cliente ni lead asociado';
  END IF;

  -- 4) Nombre de pedido
  SET v_nombre = COALESCE(
    p_nombre_pedido,
    CONCAT(
      COALESCE(v_tipo_evento,'Evento'),
      ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, v_fecha_ref), '%Y-%m-%d'),
      COALESCE(CONCAT(' - ', v_lugar), '')
    )
  );

  -- 5) Insertar Pedido
  INSERT INTO T_Pedido
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones, FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id), p_empleado_id, v_nombre, v_fecha_ev);

  SET o_pedido_id = LAST_INSERT_ID();

  /* 6) Insertar lineas (servicios) */
  INSERT INTO T_PedidoServicio
    (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_Nombre, PS_Descripcion, PS_Moneda, PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas)
  SELECT
    o_pedido_id,
    cs.FK_ExS_Cod,
    NULL,
    cs.CS_Nombre,
    cs.CS_Descripcion,
    cs.CS_Moneda,
    cs.CS_PrecioUnit,
    cs.CS_Cantidad,
    cs.CS_Descuento,
    cs.CS_Recargo,
    cs.CS_Notas
  FROM T_CotizacionServicio cs
  WHERE cs.FK_Cot_Cod = p_cot_id;

  /* 7) Insertar eventos */
  INSERT INTO T_PedidoEvento
    (FK_P_Cod, PE_Fecha, PE_Hora, PE_Ubicacion, PE_Direccion, PE_Notas)
  SELECT
    o_pedido_id,
    ce.CotE_Fecha,
    ce.CotE_Hora,
    ce.CotE_Ubicacion,
    ce.CotE_Direccion,
    ce.CotE_Notas
  FROM T_CotizacionEvento ce
  WHERE ce.FK_Cot_Cod = p_cot_id;

  COMMIT;
END ;;
DELIMITER ;
