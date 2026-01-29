-- 2026-01-27_fix_cotizacion_estado_total_viaticos.sql
-- Ajusta el total devuelto al cambiar estado para incluir viaticos

DROP PROCEDURE IF EXISTS sp_cotizacion_estado_actualizar;
DELIMITER ;;
CREATE PROCEDURE sp_cotizacion_estado_actualizar(
  IN p_cot_id           INT,
  IN p_estado_nuevo     VARCHAR(20),   -- Borrador|Enviada|Aceptada|Rechazada
  IN p_estado_esperado  VARCHAR(20)    -- NULL = sin concurrencia optimista
)
BEGIN
  DECLARE v_estado_actual VARCHAR(20);
  DECLARE v_estado_nuevo_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- leer + lock
  SELECT ec.ECot_Nombre INTO v_estado_actual
  FROM defaultdb.T_Cotizacion c
  JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado_actual IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quote not found';
  END IF;

  -- concurrencia optimista (opcional)
  IF p_estado_esperado IS NOT NULL AND p_estado_esperado <> v_estado_actual THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Version conflict';
  END IF;

  -- reglas de transicion (basicas, ajusta a tu flujo)
  IF v_estado_actual = 'Borrador' AND p_estado_nuevo NOT IN ('Enviada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid transition from Borrador';
  END IF;

  IF v_estado_actual = 'Enviada' AND p_estado_nuevo NOT IN ('Aceptada','Rechazada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid transition from Enviada';
  END IF;

  IF v_estado_actual IN ('Aceptada','Rechazada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Final state cannot transition';
  END IF;

  SELECT PK_ECot_Cod INTO v_estado_nuevo_id
  FROM defaultdb.T_Estado_Cotizacion
  WHERE ECot_Nombre = p_estado_nuevo
  LIMIT 1;

  IF v_estado_nuevo_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de cotizacion invalido';
  END IF;

  -- update
  UPDATE defaultdb.T_Cotizacion
  SET FK_ECot_Cod = v_estado_nuevo_id
  WHERE PK_Cot_Cod = p_cot_id;

  -- devolver JSON de detalle (incluye viaticos)
  SELECT JSON_OBJECT(
    'id',              c.PK_Cot_Cod,
    'estado',          ec.ECot_Nombre,
    'fechaCreacion',   c.Cot_Fecha_Crea,
    'eventoId',        c.Cot_IdTipoEvento,
    'tipoEvento',      c.Cot_TipoEvento,
    'fechaEvento',     c.Cot_FechaEvento,
    'lugar',           c.Cot_Lugar,
    'horasEstimadas',  c.Cot_HorasEst,
    'mensaje',         c.Cot_Mensaje,
    'viaticosMonto',   COALESCE(c.Cot_ViaticosMonto, 0),
    'totalServicios',  COALESCE((
                        SELECT SUM(s.CS_Subtotal)
                        FROM defaultdb.T_CotizacionServicio s
                        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                      ),0),
    'total',           COALESCE((
                        SELECT SUM(s.CS_Subtotal)
                        FROM defaultdb.T_CotizacionServicio s
                        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                      ),0) + COALESCE(c.Cot_ViaticosMonto, 0),
    'contacto',
      CASE
        WHEN l.PK_Lead_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',             l.PK_Lead_Cod,
            'nombre',         l.Lead_Nombre,
            'celular',        l.Lead_Celular,
            'origen',         'LEAD',
            'fechaCreacion',  l.Lead_Fecha_Crea
          )
        WHEN cli.PK_Cli_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',             cli.PK_Cli_Cod,
            'nombre',         TRIM(CONCAT(COALESCE(u.U_Nombre,''),' ',COALESCE(u.U_Apellido,''))),
            'celular',        u.U_Celular,
            'origen',         'CLIENTE',
            'fechaCreacion',  c.Cot_Fecha_Crea
          )
        ELSE
          JSON_OBJECT(
            'id',             NULL,
            'nombre',         NULL,
            'celular',        NULL,
            'origen',         NULL,
            'fechaCreacion',  NULL
          )
      END
  ) AS detalle_json
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli  ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u    ON u.PK_U_Cod = cli.FK_U_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

  COMMIT;
END;;
DELIMITER ;
