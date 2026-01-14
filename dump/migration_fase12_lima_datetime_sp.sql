-- Migration: standardize Lima datetime usage in SPs
-- Review before applying.

DELIMITER ;;

DROP PROCEDURE IF EXISTS sp_cotizacion_admin_crear_v3;;
CREATE PROCEDURE sp_cotizacion_admin_crear_v3(
  IN p_cliente_id      INT,
  IN p_lead_nombre     VARCHAR(80),
  IN p_lead_celular    VARCHAR(30),
  IN p_lead_origen     VARCHAR(40),
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),
  IN p_fecha_crea      DATETIME,
  IN p_items_json      JSON,
  IN p_eventos_json    JSON
)
BEGIN
  DECLARE v_lead_id INT DEFAULT NULL;
  DECLARE v_cli_id  INT DEFAULT NULL;
  DECLARE v_cot_id  INT DEFAULT NULL;
  DECLARE v_estado_nombre VARCHAR(20);
  DECLARE v_estado_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF p_cliente_id IS NOT NULL AND p_cliente_id > 0 THEN
    SELECT PK_Cli_Cod INTO v_cli_id
    FROM defaultdb.T_Cliente
    WHERE PK_Cli_Cod = p_cliente_id
    LIMIT 1;

    IF v_cli_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe.';
    END IF;

    SET v_lead_id = NULL;
  ELSE
    IF p_lead_nombre IS NULL OR TRIM(p_lead_nombre) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Se requiere nombre para crear el lead.';
    END IF;

    INSERT INTO defaultdb.T_Lead(
      Lead_Nombre, Lead_Celular, Lead_Origen, Lead_Fecha_Crea
    )
    VALUES (
      p_lead_nombre, p_lead_celular, p_lead_origen,
      COALESCE(p_fecha_crea, NOW())
    );

    SET v_lead_id = LAST_INSERT_ID();
    SET v_cli_id  = NULL;
  END IF;

  SET v_estado_nombre = COALESCE(p_estado, 'Borrador');
  SELECT PK_ECot_Cod INTO v_estado_id
  FROM defaultdb.T_Estado_Cotizacion
  WHERE ECot_Nombre = v_estado_nombre
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de cotizacion invalido';
  END IF;

  INSERT INTO defaultdb.T_Cotizacion(
    FK_Lead_Cod, FK_Cli_Cod,
    Cot_TipoEvento, Cot_IdTipoEvento, Cot_FechaEvento,
    Cot_Lugar, Cot_HorasEst, Cot_Mensaje, FK_ECot_Cod,
    Cot_Fecha_Crea
  )
  VALUES (
    v_lead_id,
    v_cli_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_mensaje,
    v_estado_id,
    COALESCE(p_fecha_crea, NOW())
  );

  SET v_cot_id = LAST_INSERT_ID();

  IF p_items_json IS NOT NULL AND JSON_TYPE(p_items_json) = 'ARRAY' THEN
    INSERT INTO defaultdb.T_CotizacionServicio(
      FK_Cot_Cod, FK_ExS_Cod, CS_EventoId, CS_ServicioId,
      CS_Nombre, CS_Descripcion, CS_Moneda,
      CS_PrecioUnit, CS_Cantidad, CS_Descuento, CS_Recargo,
      CS_Notas, CS_Horas, CS_Staff, CS_FotosImpresas, CS_TrailerMin, CS_FilmMin
    )
    SELECT
      v_cot_id,
      j.id_evento_servicio,
      j.evento_id,
      j.servicio_id,
      COALESCE(j.nombre, j.titulo),
      j.descripcion,
      COALESCE(j.moneda, 'USD'),
      j.precio_unit,
      COALESCE(j.cantidad, 1),
      COALESCE(j.descuento, 0),
      COALESCE(j.recargo, 0),
      j.notas,
      j.horas,
      j.personal,
      j.fotos_impresas,
      j.trailer_min,
      j.film_min
    FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS (
      id_evento_servicio  INT           PATH '$.idEventoServicio'  NULL ON ERROR,
      evento_id           INT           PATH '$.eventoId'          NULL ON ERROR,
      servicio_id         INT           PATH '$.servicioId'        NULL ON ERROR,
      nombre              VARCHAR(120)  PATH '$.nombre'            NULL ON ERROR,
      titulo              VARCHAR(120)  PATH '$.titulo'            NULL ON ERROR,
      descripcion         VARCHAR(1000) PATH '$.descripcion'       NULL ON ERROR,
      moneda              CHAR(3)       PATH '$.moneda'            NULL ON ERROR,
      precio_unit         DECIMAL(10,2) PATH '$.precioUnit',
      cantidad            DECIMAL(10,2) PATH '$.cantidad'          NULL ON ERROR,
      descuento           DECIMAL(10,2) PATH '$.descuento'         NULL ON ERROR,
      recargo             DECIMAL(10,2) PATH '$.recargo'           NULL ON ERROR,
      notas               VARCHAR(150)  PATH '$.notas'             NULL ON ERROR,
      horas               DECIMAL(4,1)  PATH '$.horas'             NULL ON ERROR,
      personal            SMALLINT      PATH '$.personal'          NULL ON ERROR,
      fotos_impresas      INT           PATH '$.fotosImpresas'     NULL ON ERROR,
      trailer_min         INT           PATH '$.trailerMin'        NULL ON ERROR,
      film_min            INT           PATH '$.filmMin'           NULL ON ERROR
    )) AS j;
  END IF;

  IF p_eventos_json IS NOT NULL AND JSON_TYPE(p_eventos_json) = 'ARRAY' THEN
    INSERT INTO defaultdb.T_CotizacionEvento(
      FK_Cot_Cod, CotE_Fecha, CotE_Hora,
      CotE_Ubicacion, CotE_Direccion, CotE_Notas
    )
    SELECT
      v_cot_id,
      evt.fecha,
      evt.hora,
      NULLIF(TRIM(evt.ubicacion), ''),
      NULLIF(TRIM(evt.direccion), ''),
      NULLIF(TRIM(evt.notas), '')
    FROM JSON_TABLE(p_eventos_json, '$[*]' COLUMNS (
      fecha      DATE          PATH '$.fecha',
      hora       TIME          PATH '$.hora'        NULL ON ERROR,
      ubicacion  VARCHAR(100)  PATH '$.ubicacion'   NULL ON ERROR,
      direccion  VARCHAR(150)  PATH '$.direccion'   NULL ON ERROR,
      notas      VARCHAR(255)  PATH '$.notas'       NULL ON ERROR
    )) AS evt
    WHERE evt.fecha IS NOT NULL;
  END IF;

  COMMIT;
END;;

DROP PROCEDURE IF EXISTS sp_cotizacion_publica_crear;;
CREATE PROCEDURE sp_cotizacion_publica_crear(
  IN p_lead_nombre    VARCHAR(80),
  IN p_lead_celular   VARCHAR(30),
  IN p_lead_origen    VARCHAR(40),
  IN p_tipo_evento    VARCHAR(40),
  IN p_id_tipo_evento INT,
  IN p_fecha_evento   DATE,
  IN p_lugar          VARCHAR(150),
  IN p_horas_est      DECIMAL(4,1),
  IN p_mensaje        VARCHAR(500),
  IN p_fecha_crea     DATETIME
)
BEGIN
  DECLARE v_lead_id INT;
  DECLARE v_cot_id  INT;
  DECLARE v_estado_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;

  SELECT PK_Lead_Cod INTO v_lead_id
  FROM T_Lead
  WHERE p_lead_celular IS NOT NULL AND Lead_Celular = p_lead_celular
  LIMIT 1 FOR UPDATE;

  IF v_lead_id IS NULL THEN
    INSERT INTO T_Lead(
      Lead_Nombre, Lead_Celular, Lead_Origen, Lead_Fecha_Crea
    )
    VALUES (
      p_lead_nombre, p_lead_celular, p_lead_origen,
      COALESCE(p_fecha_crea, NOW())
    );
    SET v_lead_id = LAST_INSERT_ID();
  END IF;

  SELECT PK_ECot_Cod INTO v_estado_id
  FROM T_Estado_Cotizacion
  WHERE ECot_Nombre = 'Borrador'
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de cotizacion invalido';
  END IF;

  INSERT INTO T_Cotizacion(
    FK_Lead_Cod,
    Cot_TipoEvento, Cot_IdTipoEvento, Cot_FechaEvento,
    Cot_Lugar, Cot_HorasEst, Cot_Mensaje, FK_ECot_Cod,
    Cot_Fecha_Crea
  )
  VALUES (
    v_lead_id,
    p_tipo_evento, p_id_tipo_evento, p_fecha_evento,
    p_lugar, p_horas_est, p_mensaje, v_estado_id,
    COALESCE(p_fecha_crea, NOW())
  );

  SET v_cot_id = LAST_INSERT_ID();

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END;;

DROP PROCEDURE IF EXISTS sp_cotizacion_convertir_a_pedido;;
CREATE PROCEDURE sp_cotizacion_convertir_a_pedido(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,
  IN  p_nombre_pedido VARCHAR(225),
  IN  p_fecha_hoy     DATE,
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

  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,     v_estado
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
      ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, v_fecha_ref), '%Y-%m-%d'),
      COALESCE(CONCAT(' - ', v_lugar), '')
    )
  );

  INSERT INTO T_Pedido
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion,
     P_Observaciones, FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id),
     p_empleado_id, v_nombre, v_fecha_ev);

  SET o_pedido_id = LAST_INSERT_ID();

  COMMIT;
END;;

DROP PROCEDURE IF EXISTS sp_pedido_listar;;
CREATE PROCEDURE sp_pedido_listar(
  IN p_fecha_hora DATETIME
)
BEGIN
  DECLARE v_fecha_ref DATETIME;
  SET v_fecha_ref = COALESCE(p_fecha_hora, NOW());

  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)             AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,
    evProx.PE_Fecha                                      AS ProxFecha,
    TIME_FORMAT(evProx.PE_Hora, '%H:%i:%s')              AS ProxHora,
    CASE DAYOFWEEK(evProx.PE_Fecha)
      WHEN 1 THEN 'dom' WHEN 2 THEN 'lun' WHEN 3 THEN 'mar'
      WHEN 4 THEN 'mie' WHEN 5 THEN 'jue' WHEN 6 THEN 'vie'
      WHEN 7 THEN 'sab' ELSE NULL
    END                                                  AS ProxDia,
    evProx.PE_Ubicacion                                  AS Ubicacion,
    (SELECT e.E_Nombre
       FROM T_PedidoServicio ps
       JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
       JOIN T_Eventos e          ON e.PK_E_Cod     = exs.PK_E_Cod
      WHERE ps.FK_P_Cod = p.PK_P_Cod
      ORDER BY ps.PK_PS_Cod
      LIMIT 1)                                           AS TipoEvento,
    (
      SELECT GROUP_CONCAT(CONCAT(t.moneda, ' ', FORMAT(t.total, 2)) SEPARATOR ' | ')
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,
    (
      SELECT JSON_ARRAYAGG(JSON_OBJECT('moneda', t.moneda, 'total', t.total))
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalesJSON,
    COALESCE(ep.EP_Nombre, CONCAT('Estado #', p.FK_EP_Cod)) AS Estado,
    COALESCE(esp.ESP_Nombre, CONCAT('Pago #', p.FK_ESP_Cod)) AS Pago,
    p.FK_Em_Cod                                              AS ResponsableId
  FROM T_Pedido p
  JOIN T_Cliente c      ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u      ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod  = p.FK_EP_Cod
  LEFT JOIN T_Estado_Pago  esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN T_PedidoEvento evProx
    ON evProx.PK_PE_Cod = COALESCE(
      (SELECT e1.PK_PE_Cod
       FROM T_PedidoEvento e1
       WHERE e1.FK_P_Cod = p.PK_P_Cod
         AND CONCAT(e1.PE_Fecha, ' ', COALESCE(e1.PE_Hora, '00:00:00')) >= v_fecha_ref
       ORDER BY e1.PE_Fecha, e1.PE_Hora
       LIMIT 1),
      (SELECT e2.PK_PE_Cod
       FROM T_PedidoEvento e2
       WHERE e2.FK_P_Cod = p.PK_P_Cod
       ORDER BY e2.PE_Fecha, e2.PE_Hora
       LIMIT 1)
    )
  ORDER BY p.PK_P_Cod DESC;
END;;

DROP PROCEDURE IF EXISTS sp_voucher_listar_por_pedido_detalle;;
CREATE PROCEDURE sp_voucher_listar_por_pedido_detalle(
  IN pPedidoId INT,
  IN p_fecha_hora DATETIME
)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS Codigo,
    IFNULL(v.Pa_Fecha, DATE(COALESCE(p_fecha_hora, NOW()))) AS Fecha,
    v.Pa_Monto_Depositado  AS Monto,
    mp.MP_Nombre           AS MetodoPago,
    v.Pa_Imagen_Voucher    AS Link
  FROM T_Voucher v
  JOIN T_Metodo_Pago mp    ON mp.PK_MP_Cod = v.FK_MP_Cod
  JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = pPedidoId
  ORDER BY v.PK_Pa_Cod DESC;
END;;

DROP PROCEDURE IF EXISTS sp_proyecto_actualizar;;
CREATE PROCEDURE sp_proyecto_actualizar(
  IN p_id INT,
  IN p_nombre VARCHAR(50),
  IN p_fecha_inicio DATE,
  IN p_fecha_fin DATE,
  IN p_estado TINYINT,
  IN p_responsable INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255),
  IN p_multimedia INT,
  IN p_edicion INT,
  IN p_updated_at DATETIME
)
BEGIN
  UPDATE T_Proyecto
  SET Pro_Nombre = COALESCE(NULLIF(TRIM(p_nombre), ''), Pro_Nombre),
      Pro_Estado = COALESCE(p_estado, Pro_Estado),
      FK_Em_Cod = COALESCE(p_responsable, FK_Em_Cod),
      EPro_Fecha_Inicio_Edicion = COALESCE(p_fecha_inicio, EPro_Fecha_Inicio_Edicion),
      Pro_Fecha_Fin_Edicion = COALESCE(p_fecha_fin, Pro_Fecha_Fin_Edicion),
      Pro_Enlace = COALESCE(NULLIF(TRIM(p_enlace), ''), Pro_Enlace),
      Pro_Notas = COALESCE(NULLIF(TRIM(p_notas), ''), Pro_Notas),
      Pro_Revision_Multimedia = COALESCE(p_multimedia, Pro_Revision_Multimedia),
      Pro_Revision_Edicion = COALESCE(p_edicion, Pro_Revision_Edicion),
      updated_at = COALESCE(p_updated_at, updated_at)
  WHERE PK_Pro_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END;;

DROP PROCEDURE IF EXISTS sp_proyecto_crear;;
CREATE PROCEDURE sp_proyecto_crear(
  IN p_nombre VARCHAR(50),
  IN p_fk_pedido INT,
  IN p_estado TINYINT,
  IN p_responsable INT,
  IN p_fecha_inicio DATE,
  IN p_fecha_fin DATE,
  IN p_enlace VARCHAR(255),
  IN p_notas VARCHAR(255),
  IN p_multimedia INT,
  IN p_edicion INT,
  IN p_created_at DATETIME,
  IN p_updated_at DATETIME
)
BEGIN
  INSERT INTO T_Proyecto (
    Pro_Nombre, FK_P_Cod, Pro_Estado, FK_Em_Cod,
    EPro_Fecha_Inicio_Edicion, Pro_Fecha_Fin_Edicion,
    Pro_Enlace, Pro_Notas, Pro_Revision_Multimedia, Pro_Revision_Edicion,
    created_at, updated_at
  ) VALUES (
    TRIM(p_nombre), p_fk_pedido, p_estado, p_responsable,
    p_fecha_inicio, p_fecha_fin,
    NULLIF(TRIM(p_enlace), ''), NULLIF(TRIM(p_notas), ''),
    p_multimedia, p_edicion,
    COALESCE(p_created_at, NOW()),
    COALESCE(p_updated_at, NOW())
  );
  SELECT LAST_INSERT_ID() AS proyectoId;
END;;

DELIMITER ;
