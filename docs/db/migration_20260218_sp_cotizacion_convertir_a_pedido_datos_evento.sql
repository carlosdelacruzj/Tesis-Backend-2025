-- migration_20260218_sp_cotizacion_convertir_a_pedido_datos_evento.sql
-- Fecha: 2026-02-18
-- Objetivo:
-- 1) Actualizar SP sp_cotizacion_convertir_a_pedido para copiar
--    T_Cotizacion.Cot_DatosEvento -> T_Pedido.P_DatosEvento.
-- 2) Backfill de pedidos existentes creados desde cotizacion.

SET NAMES utf8mb4;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_cotizacion_convertir_a_pedido`$$
CREATE PROCEDURE `sp_cotizacion_convertir_a_pedido`(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,
  IN  p_nombre_pedido VARCHAR(225),
  IN  p_fecha_hoy     DATE,
  OUT o_pedido_id     INT
)
BEGIN
  DECLARE v_fk_cli         INT;
  DECLARE v_tipo_evento    VARCHAR(40);
  DECLARE v_fecha_ev       DATE;
  DECLARE v_lugar          VARCHAR(150);
  DECLARE v_estado         VARCHAR(20);
  DECLARE v_nombre         VARCHAR(225);
  DECLARE v_fecha_ref      DATE;
  DECLARE v_id_tipo_evento INT;
  DECLARE v_dias           SMALLINT;
  DECLARE v_viaticos_monto DECIMAL(10,2);
  DECLARE v_horas_est      DECIMAL(4,1);
  DECLARE v_mensaje        VARCHAR(500);
  DECLARE v_datos_evento   JSON;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET v_fecha_ref = COALESCE(p_fecha_hoy, CURDATE());

  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar,
         c.Cot_IdTipoEvento, c.Cot_Dias, c.Cot_ViaticosMonto, c.Cot_HorasEst,
         c.Cot_Mensaje, c.Cot_DatosEvento, ec.ECot_Nombre
    INTO v_fk_cli,         v_tipo_evento,   v_fecha_ev,        v_lugar,
         v_id_tipo_evento, v_dias,          v_viaticos_monto,  v_horas_est,
         v_mensaje,        v_datos_evento,  v_estado
  FROM T_Cotizacion c
  JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotizacion no encontrada';
  END IF;

  IF v_estado <> 'Aceptada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden migrar cotizaciones en estado Aceptada';
  END IF;

  IF v_fk_cli IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotizacion no tiene cliente ni lead asociado';
  END IF;

  SET v_nombre = COALESCE(
    p_nombre_pedido,
    CONCAT(
      COALESCE(v_tipo_evento,'Evento'),
      ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, v_fecha_ref), '%d-%m-%Y'),
      COALESCE(CONCAT(' - ', v_lugar), '')
    )
  );

  INSERT INTO T_Pedido
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones,
     FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento, P_Lugar, P_IdTipoEvento, P_Dias,
     P_ViaticosMonto, P_HorasEst, P_Mensaje, P_DatosEvento)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id),
     p_empleado_id, v_nombre, v_fecha_ev, v_lugar, v_id_tipo_evento, v_dias,
     COALESCE(v_viaticos_monto, 0), v_horas_est, v_mensaje, v_datos_evento);

  SET o_pedido_id = LAST_INSERT_ID();

  INSERT INTO T_PedidoServicio
    (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_EventoId, PS_ServicioId,
     PS_Nombre, PS_Descripcion, PS_Moneda, PS_PrecioUnit, PS_Cantidad, PS_Descuento,
     PS_Recargo, PS_Notas, PS_Horas, PS_Staff, PS_FotosImpresas, PS_TrailerMin, PS_FilmMin)
  SELECT
    o_pedido_id,
    cs.FK_ExS_Cod,
    NULL,
    cs.CS_EventoId,
    cs.CS_ServicioId,
    cs.CS_Nombre,
    cs.CS_Descripcion,
    cs.CS_Moneda,
    cs.CS_PrecioUnit,
    cs.CS_Cantidad,
    cs.CS_Descuento,
    cs.CS_Recargo,
    cs.CS_Notas,
    cs.CS_Horas,
    cs.CS_Staff,
    cs.CS_FotosImpresas,
    cs.CS_TrailerMin,
    cs.CS_FilmMin
  FROM T_CotizacionServicio cs
  WHERE cs.FK_Cot_Cod = p_cot_id
  ORDER BY cs.PK_CotServ_Cod;

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

  -- Copiar serviciosFechas (mapeo por orden de insercion)
  INSERT INTO T_PedidoServicioFecha (FK_P_Cod, FK_PedServ_Cod, PSF_Fecha)
  SELECT
    o_pedido_id,
    ps.PK_PS_Cod,
    csf.CSF_Fecha
  FROM (
    SELECT PK_PS_Cod, ROW_NUMBER() OVER (ORDER BY PK_PS_Cod) AS rn
    FROM T_PedidoServicio
    WHERE FK_P_Cod = o_pedido_id
  ) ps
  JOIN (
    SELECT PK_CotServ_Cod, ROW_NUMBER() OVER (ORDER BY PK_CotServ_Cod) AS rn
    FROM T_CotizacionServicio
    WHERE FK_Cot_Cod = p_cot_id
  ) cs ON cs.rn = ps.rn
  JOIN T_CotizacionServicioFecha csf ON csf.FK_CotServ_Cod = cs.PK_CotServ_Cod;

  COMMIT;
END$$

DELIMITER ;

-- Backfill historico:
-- pedidos creados desde cotizacion que aun no tengan P_DatosEvento.
UPDATE T_Pedido p
JOIN T_Cotizacion c ON c.PK_Cot_Cod = p.FK_Cot_Cod
SET p.P_DatosEvento = c.Cot_DatosEvento
WHERE p.P_DatosEvento IS NULL
  AND p.PK_P_Cod > 0
  AND c.Cot_DatosEvento IS NOT NULL;
