-- Fase 25: agregar dias en cotizacion/pedido y actualizar SPs relacionados
-- Ejecuta este script una sola vez en la BD.

ALTER TABLE T_Cotizacion
  ADD COLUMN Cot_Dias SMALLINT NULL AFTER Cot_HorasEst;

ALTER TABLE T_Pedido
  ADD COLUMN P_Dias SMALLINT NULL AFTER P_FechaEvento;

DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_crear_v3`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_admin_crear_v3`(
  IN p_cliente_id      INT,
  IN p_lead_nombre     VARCHAR(80),
  IN p_lead_celular    VARCHAR(30),
  IN p_lead_origen     VARCHAR(40),
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_dias            SMALLINT,
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),
  IN p_fecha_crea      DATETIME,
  IN p_items_json      JSON,
  IN p_eventos_json    JSON
)
BEGIN
  DECLARE v_lead_id INT DEFAULT NULL;
  DECLARE v_cli_id  INT DEFAULT NULL;
  DECLARE v_cli_estado INT DEFAULT NULL;
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
    SELECT PK_Cli_Cod, FK_ECli_Cod INTO v_cli_id, v_cli_estado
    FROM defaultdb.T_Cliente
    WHERE PK_Cli_Cod = p_cliente_id
    LIMIT 1;

    IF v_cli_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe.';
    ELSEIF v_cli_estado <> 1 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente inactivo.';
    END IF;

    SET v_lead_id = NULL;
  ELSE
    IF p_lead_nombre IS NULL OR TRIM(p_lead_nombre) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Se requiere nombre para crear el lead.';
    END IF;

    INSERT INTO defaultdb.T_Lead(Lead_Nombre, Lead_Celular, Lead_Origen)
    VALUES (p_lead_nombre, p_lead_celular, p_lead_origen);

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
    Cot_Lugar, Cot_HorasEst, Cot_Dias, Cot_Mensaje, FK_ECot_Cod, Cot_Fecha_Crea
  )
  VALUES (
    v_lead_id,
    v_cli_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_dias,
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

  SELECT
    v_cot_id  AS idCotizacion,
    v_cli_id  AS clienteId,
    v_lead_id AS leadId,
    CASE WHEN v_cli_id IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_publica_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_publica_crear`(
  IN p_lead_nombre    VARCHAR(80),
  IN p_lead_celular   VARCHAR(30),
  IN p_lead_origen    VARCHAR(40),
  IN p_tipo_evento    VARCHAR(40),
  IN p_id_tipo_evento INT,
  IN p_fecha_evento   DATE,
  IN p_lugar          VARCHAR(150),
  IN p_horas_est      DECIMAL(4,1),
  IN p_dias           SMALLINT,
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
    INSERT INTO T_Lead(Lead_Nombre, Lead_Celular, Lead_Origen)
    VALUES (p_lead_nombre, p_lead_celular, p_lead_origen);
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
    Cot_TipoEvento,
    Cot_IdTipoEvento,
    Cot_FechaEvento,
    Cot_Lugar,
    Cot_HorasEst,
    Cot_Dias,
    Cot_Mensaje,
    Cot_Fecha_Crea,
    FK_ECot_Cod
  )
  VALUES (
    v_lead_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_dias,
    p_mensaje,
    COALESCE(p_fecha_crea, NOW()),
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_admin_actualizar`(
  IN p_cot_id          INT,
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_dias            SMALLINT,
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),
  IN p_items_json      JSON,
  IN p_eventos_json    JSON
)
BEGIN
  DECLARE v_estado_id INT DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF (SELECT COUNT(*) FROM defaultdb.T_Cotizacion WHERE PK_Cot_Cod = p_cot_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='La cotizacion no existe';
  END IF;

  IF p_estado IS NOT NULL THEN
    SELECT PK_ECot_Cod INTO v_estado_id
    FROM defaultdb.T_Estado_Cotizacion
    WHERE ECot_Nombre = p_estado
    LIMIT 1;

    IF v_estado_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Estado de cotizacion invalido';
    END IF;
  END IF;

  UPDATE defaultdb.T_Cotizacion
  SET Cot_TipoEvento   = COALESCE(p_tipo_evento,    Cot_TipoEvento),
      Cot_IdTipoEvento = COALESCE(p_id_tipo_evento, Cot_IdTipoEvento),
      Cot_FechaEvento  = COALESCE(p_fecha_evento,   Cot_FechaEvento),
      Cot_Lugar        = COALESCE(p_lugar,          Cot_Lugar),
      Cot_HorasEst     = COALESCE(p_horas_est,      Cot_HorasEst),
      Cot_Dias         = COALESCE(p_dias,           Cot_Dias),
      Cot_Mensaje      = COALESCE(p_mensaje,        Cot_Mensaje),
      FK_ECot_Cod      = COALESCE(v_estado_id,      FK_ECot_Cod)
  WHERE PK_Cot_Cod = p_cot_id;

  IF p_items_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionServicio
    WHERE FK_Cot_Cod = p_cot_id;

    INSERT INTO defaultdb.T_CotizacionServicio(
      FK_Cot_Cod, FK_ExS_Cod, CS_EventoId, CS_ServicioId,
      CS_Nombre, CS_Descripcion, CS_Moneda,
      CS_PrecioUnit, CS_Cantidad, CS_Descuento, CS_Recargo,
      CS_Notas, CS_Horas, CS_Staff, CS_FotosImpresas, CS_TrailerMin, CS_FilmMin
    )
    SELECT
      p_cot_id,
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

  IF p_eventos_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionEvento
    WHERE FK_Cot_Cod = p_cot_id;

    INSERT INTO defaultdb.T_CotizacionEvento(
      FK_Cot_Cod, CotE_Fecha, CotE_Hora,
      CotE_Ubicacion, CotE_Direccion, CotE_Notas
    )
    SELECT
      p_cot_id,
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
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_listar_general`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_listar_general`()
BEGIN
  SELECT
      c.PK_Cot_Cod        AS idCotizacion,
      c.FK_Lead_Cod       AS idLead,
      c.FK_Cli_Cod        AS idCliente,
      CASE WHEN c.FK_Cli_Cod IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen,
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN
          CASE
            WHEN td.TD_Codigo = 'RUC' THEN cli.Cli_RazonSocial
            ELSE TRIM(CONCAT_WS(' ',
              NULLIF(u.U_Nombre, ''),
              NULLIF(u.U_Apellido, '')
            ))
          END
        ELSE
          l.Lead_Nombre
      END AS contactoNombre,
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN u.U_Celular
        ELSE l.Lead_Celular
      END AS contactoCelular,
      c.Cot_TipoEvento     AS tipoEvento,
      c.Cot_IdTipoEvento   AS idTipoEvento,
      c.Cot_FechaEvento    AS fechaEvento,
      c.Cot_Lugar          AS lugar,
      c.Cot_HorasEst       AS horasEstimadas,
      c.Cot_Dias           AS dias,
      c.Cot_Mensaje        AS mensaje,
      ec.ECot_Nombre AS estado,
      c.Cot_Fecha_Crea     AS fechaCreacion,
      COALESCE((
        SELECT SUM(
          COALESCE(cs.CS_Subtotal,
                   COALESCE(cs.CS_PrecioUnit,0) * COALESCE(cs.CS_Cantidad,1)
                   - COALESCE(cs.CS_Descuento,0) + COALESCE(cs.CS_Recargo,0))
        )
        FROM defaultdb.T_CotizacionServicio cs
        WHERE cs.FK_Cot_Cod = c.PK_Cot_Cod
      ), 0) AS total
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u   ON u.PK_U_Cod    = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  ORDER BY c.PK_Cot_Cod DESC;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_obtener_json`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_obtener_json`(
  IN p_cot_id INT
)
BEGIN
  IF p_cot_id IS NULL OR p_cot_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cot_id invalido';
  END IF;

  IF (SELECT COUNT(*) FROM defaultdb.T_Cotizacion WHERE PK_Cot_Cod = p_cot_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotizacion no existe';
  END IF;

  SELECT
    JSON_OBJECT(
      'idCotizacion', c.PK_Cot_Cod,
      'contacto',
      CASE
        WHEN l.PK_Lead_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',         l.PK_Lead_Cod,
            'nombre',     l.Lead_Nombre,
            'celular',    l.Lead_Celular,
            'origen',     'LEAD',
            'fechaCrea',  l.Lead_Fecha_Crea
          )
        WHEN cli.PK_Cli_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',         cli.PK_Cli_Cod,
            'nombre',     CONCAT(COALESCE(u.U_Nombre,''), 
                                 CASE WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' ' ELSE '' END,
                                 COALESCE(u.U_Apellido,'')),
            'celular',    u.U_Celular,
            'origen',     'CLIENTE',
            'fechaCrea',  c.Cot_Fecha_Crea
          )
        ELSE
          JSON_OBJECT(
            'id',         NULL,
            'nombre',     NULL,
            'celular',    NULL,
            'origen',     NULL,
            'fechaCrea',  NULL
          )
      END,
      'cotizacion', JSON_OBJECT(
        'tipoEvento',     c.Cot_TipoEvento,
        'idTipoEvento',   c.Cot_IdTipoEvento,
        'fechaEvento',    c.Cot_FechaEvento,
        'lugar',          c.Cot_Lugar,
        'horasEstimadas', c.Cot_HorasEst,
        'dias',           c.Cot_Dias,
        'mensaje',        c.Cot_Mensaje,
        'estado',         ec.ECot_Nombre,
        'fechaCreacion',  c.Cot_Fecha_Crea,
        'total',          COALESCE((
                           SELECT SUM(s.CS_Subtotal)
                           FROM defaultdb.T_CotizacionServicio s
                           WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                         ),0)
      ),
      'items', COALESCE((
        SELECT JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'idCotizacionServicio', s.PK_CotServ_Cod,
                   'idEventoServicio',     s.FK_ExS_Cod,
                   'eventoId',             s.CS_EventoId,
                   'servicioId',           s.CS_ServicioId,
                   'nombre',               s.CS_Nombre,
                   'descripcion',          s.CS_Descripcion,
                   'moneda',               s.CS_Moneda,
                   'precioUnit',           s.CS_PrecioUnit,
                   'cantidad',             s.CS_Cantidad,
                   'descuento',            s.CS_Descuento,
                   'recargo',              s.CS_Recargo,
                   'subtotal',             s.CS_Subtotal,
                   'notas',                s.CS_Notas,
                   'horas',                s.CS_Horas,
                   'personal',             s.CS_Staff,
                   'fotosImpresas',        s.CS_FotosImpresas,
                   'trailerMin',           s.CS_TrailerMin,
                   'filmMin',              s.CS_FilmMin,
                   'eventoServicio',
                   CASE
                     WHEN s.FK_ExS_Cod IS NULL THEN NULL
                     ELSE (
                       SELECT JSON_OBJECT(
                         'id',               exs.PK_ExS_Cod,
                         'servicioId',       exs.PK_S_Cod,
                         'servicioNombre',   srv.S_Nombre,
                         'eventoId',         exs.PK_E_Cod,
                         'eventoNombre',     evt.E_Nombre,
                         'categoriaId',      exs.FK_ESC_Cod,
                         'categoriaNombre',  cat.ESC_Nombre,
                         'categoriaTipo',    cat.ESC_Tipo,
                         'titulo',           exs.ExS_Titulo,
                         'esAddon',          exs.ExS_EsAddon,
                         'precio',           exs.ExS_Precio,
                         'descripcion',      exs.ExS_Descripcion,
                         'horas',            exs.ExS_Horas,
                         'fotosImpresas',    exs.ExS_FotosImpresas,
                         'trailerMin',       exs.ExS_TrailerMin,
                         'filmMin',          exs.ExS_FilmMin,
                         'staff', COALESCE((
                           SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                      'rol',      st.Staff_Rol,
                                      'cantidad', st.Staff_Cantidad
                                    )
                                  )
                           FROM defaultdb.T_EventoServicioStaff st
                           WHERE st.FK_ExS_Cod = exs.PK_ExS_Cod
                         ), JSON_ARRAY()),
                         'equipos', COALESCE((
                           SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                      'tipoEquipoId',  eq.FK_TE_Cod,
                                      'tipoEquipo',    te.TE_Nombre,
                                      'cantidad',      eq.Cantidad,
                                      'notas',         eq.Notas
                                    )
                                  )
                           FROM defaultdb.T_EventoServicioEquipo eq
                           JOIN defaultdb.T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
                           WHERE eq.FK_ExS_Cod = exs.PK_ExS_Cod
                         ), JSON_ARRAY())
                       )
                       FROM defaultdb.T_EventoServicio exs
                       LEFT JOIN defaultdb.T_Servicios srv ON srv.PK_S_Cod = exs.PK_S_Cod
                       LEFT JOIN defaultdb.T_Eventos   evt ON evt.PK_E_Cod = exs.PK_E_Cod
                       LEFT JOIN defaultdb.T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = exs.FK_ESC_Cod
                       WHERE exs.PK_ExS_Cod = s.FK_ExS_Cod
                       LIMIT 1
                     )
                   END
                 )
               )
        FROM defaultdb.T_CotizacionServicio s
        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY()),
      'eventos', COALESCE((
        SELECT JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'id',         e.PK_CotE_Cod,
                   'fecha',      e.CotE_Fecha,
                   'hora',       e.CotE_Hora,
                   'ubicacion',  e.CotE_Ubicacion,
                   'direccion',  e.CotE_Direccion,
                   'notas',      e.CotE_Notas
                 )
               )
        FROM defaultdb.T_CotizacionEvento e
        WHERE e.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY())
    ) AS cotizacion_json
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli  ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u    ON u.PK_U_Cod = cli.FK_U_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_convertir_a_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_convertir_a_pedido`(
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
  DECLARE v_id_tipo_evento INT;
  DECLARE v_dias        SMALLINT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET v_fecha_ref = COALESCE(p_fecha_hoy, CURDATE());

  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar, c.Cot_IdTipoEvento, c.Cot_Dias, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,     v_id_tipo_evento, v_dias,    v_estado
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
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones, FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento, P_IdTipoEvento, P_Dias)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id), p_empleado_id, v_nombre, v_fecha_ev, v_id_tipo_evento, v_dias);

  SET o_pedido_id = LAST_INSERT_ID();

  INSERT INTO T_PedidoServicio
    (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_EventoId, PS_ServicioId,
     PS_Nombre, PS_Descripcion, PS_Moneda, PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas,
     PS_Horas, PS_Staff, PS_FotosImpresas, PS_TrailerMin, PS_FilmMin)
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
  WHERE cs.FK_Cot_Cod = p_cot_id;

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

DROP PROCEDURE IF EXISTS `sp_pedido_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_pedido_listar`()
BEGIN
  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)
    END                                                  AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,
    p.P_Dias                                             AS dias,
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
  LEFT JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod  = p.FK_EP_Cod
  LEFT JOIN T_Estado_Pago  esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN T_PedidoEvento evProx
    ON evProx.PK_PE_Cod = COALESCE(
      (SELECT e1.PK_PE_Cod
       FROM T_PedidoEvento e1
       WHERE e1.FK_P_Cod = p.PK_P_Cod
         AND CONCAT(e1.PE_Fecha, ' ', COALESCE(e1.PE_Hora, '00:00:00')) >= NOW()
       ORDER BY e1.PE_Fecha, e1.PE_Hora
       LIMIT 1),
      (SELECT e2.PK_PE_Cod
       FROM T_PedidoEvento e2
       WHERE e2.FK_P_Cod = p.PK_P_Cod
       ORDER BY e2.PE_Fecha, e2.PE_Hora
       LIMIT 1)
    )
  ORDER BY p.PK_P_Cod DESC;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_pedido_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_pedido_obtener`(IN p_pedido_id INT)
BEGIN
  DECLARE v_exists INT DEFAULT 0;

  SELECT COUNT(*) INTO v_exists
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pedido no encontrado';
  END IF;

  SELECT
    p.PK_P_Cod         AS id,
    p.FK_Cli_Cod       AS clienteId,
    p.FK_Cot_Cod       AS cotizacionId,
    p.FK_Em_Cod        AS empleadoId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.FK_EP_Cod        AS estadoPedidoId,
    p.FK_ESP_Cod       AS estadoPagoId,
    p.P_FechaEvento    AS fechaEvento,
    p.P_IdTipoEvento   AS idTipoEvento,
    p.P_Dias           AS dias,
    p.P_Observaciones  AS observaciones,
    p.P_Nombre_Pedido  AS nombrePedido,
    u.U_Numero_Documento AS clienteDocumento,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE NULL
    END                 AS clienteRazonSocial,
    u.U_Nombre           AS clienteNombres,
    u.U_Apellido         AS clienteApellidos,
    u.U_Celular          AS clienteCelular,
    u.U_Correo           AS clienteCorreo,
    u.U_Direccion        AS clienteDireccion,
    ue.U_Nombre        AS empleadoNombres,
    ue.U_Apellido      AS empleadoApellidos
  FROM T_Pedido p
  JOIN T_Cliente c   ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u   ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  LEFT JOIN T_Empleados e ON e.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario  ue ON ue.PK_U_Cod = e.FK_U_Cod
  WHERE p.PK_P_Cod = p_pedido_id;

  SELECT
    pe.PK_PE_Cod    AS id,
    pe.FK_P_Cod     AS pedidoId,
    pe.PE_Fecha     AS fecha,
    pe.PE_Hora      AS hora,
    pe.PE_Ubicacion AS ubicacion,
    pe.PE_Direccion AS direccion,
    pe.PE_Notas     AS notas
  FROM T_PedidoEvento pe
  WHERE pe.FK_P_Cod = p_pedido_id
  ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod;

  SELECT
    ps.PK_PS_Cod     AS id,
    ps.FK_P_Cod      AS pedidoId,
    ps.FK_PE_Cod     AS eventoCodigo,
    ps.FK_ExS_Cod    AS idEventoServicio,
    ps.PS_EventoId   AS eventoId,
    ps.PS_ServicioId AS servicioId,
    ps.PS_Nombre     AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda     AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad   AS cantidad,
    ps.PS_Descuento  AS descuento,
    ps.PS_Recargo    AS recargo,
    ps.PS_Notas      AS notas,
    ps.PS_Horas      AS horas,
    ps.PS_Staff      AS personal,
    ps.PS_FotosImpresas AS fotosImpresas,
    ps.PS_TrailerMin AS trailerMin,
    ps.PS_FilmMin    AS filmMin,
    ps.PS_Subtotal   AS subtotal
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = p_pedido_id
  ORDER BY ps.PK_PS_Cod;
END ;;
DELIMITER ;
