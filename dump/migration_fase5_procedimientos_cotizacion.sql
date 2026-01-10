DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_actualizar`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_admin_actualizar"(
  IN p_cot_id          INT,
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),       -- 'Borrador' | 'Enviada' | ...
  IN p_items_json      JSON,              -- array de items
  IN p_eventos_json    JSON               -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }
)
BEGIN
  DECLARE v_estado_id INT DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Validación existencia
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

  -- Update parcial de cabecera
  UPDATE defaultdb.T_Cotizacion
  SET Cot_TipoEvento   = COALESCE(p_tipo_evento,    Cot_TipoEvento),
      Cot_IdTipoEvento = COALESCE(p_id_tipo_evento, Cot_IdTipoEvento),
      Cot_FechaEvento  = COALESCE(p_fecha_evento,   Cot_FechaEvento),
      Cot_Lugar        = COALESCE(p_lugar,          Cot_Lugar),
      Cot_HorasEst     = COALESCE(p_horas_est,      Cot_HorasEst),
      Cot_Mensaje      = COALESCE(p_mensaje,        Cot_Mensaje),
      FK_ECot_Cod      = COALESCE(v_estado_id,      FK_ECot_Cod)
  WHERE PK_Cot_Cod = p_cot_id;

  -- Reemplazo completo de items si se envia JSON
  IF p_items_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionServicio
    WHERE FK_Cot_Cod = p_cot_id;

    INSERT INTO defaultdb.T_CotizacionServicio(
      FK_Cot_Cod,
      FK_ExS_Cod,
      CS_EventoId,
      CS_ServicioId,
      CS_Nombre,
      CS_Descripcion,
      CS_Moneda,
      CS_PrecioUnit,
      CS_Cantidad,
      CS_Descuento,
      CS_Recargo,
      CS_Notas,
      CS_Horas,
      CS_Staff,
      CS_FotosImpresas,
      CS_TrailerMin,
      CS_FilmMin
    )
    SELECT
      p_cot_id,
      j.id_evento_servicio,
      j.evento_id,
      j.servicio_id,
      j.nombre,
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
      nombre              VARCHAR(120)  PATH '$.nombre',
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

  -- Reemplazo completo de eventos si se envia JSON
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
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_crear_v3`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_admin_crear_v3"(
  IN p_cliente_id      INT,            -- si viene (>0), NO se crea lead
  IN p_lead_nombre     VARCHAR(80),    -- usados SOLO si no viene cliente
  IN p_lead_celular    VARCHAR(30),
  IN p_lead_origen     VARCHAR(40),

  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),    -- 'Borrador' | 'Enviada' (opcional)

  IN p_items_json      JSON,           -- array de ítems
  IN p_eventos_json    JSON            -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }
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

  /* 1) Origen: CLIENTE (preferente) o crear LEAD */
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

  /* 2) Cabecera */
  INSERT INTO defaultdb.T_Cotizacion(
    FK_Lead_Cod, FK_Cli_Cod,
    Cot_TipoEvento, Cot_IdTipoEvento, Cot_FechaEvento,
    Cot_Lugar, Cot_HorasEst, Cot_Mensaje, FK_ECot_Cod
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
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  /* 3) Ítems (si viene array JSON) */
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

  /* 4) Eventos (si viene array JSON) */
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
    WHERE evt.fecha IS NOT NULL; -- la columna CotE_Fecha es NOT NULL
  END IF;

  COMMIT;

  /* 5) Salida */
  SELECT
    v_cot_id  AS idCotizacion,
    v_cli_id  AS clienteId,
    v_lead_id AS leadId,
    CASE WHEN v_cli_id IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen;
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_estado_actualizar`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_estado_actualizar"(
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

  -- devolver JSON de detalle (lead o cliente)
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
    'total',           COALESCE((
                        SELECT SUM(s.CS_Subtotal)
                        FROM defaultdb.T_CotizacionServicio s
                        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                      ),0),
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
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_listar_general`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_listar_general"()
BEGIN
  SELECT
      c.PK_Cot_Cod        AS idCotizacion,

      -- Origen
      c.FK_Lead_Cod       AS idLead,
      c.FK_Cli_Cod        AS idCliente,
      CASE WHEN c.FK_Cli_Cod IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen,

      -- Siempre "Nombre Apellido" si es CLIENTE; si es LEAD usa Lead_Nombre
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN
          TRIM(CONCAT_WS(' ',
            NULLIF(u.U_Nombre, ''),
            NULLIF(u.U_Apellido, '')
          ))
        ELSE
          l.Lead_Nombre
      END AS contactoNombre,

      -- Celular segun origen
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN u.U_Celular
        ELSE l.Lead_Celular
      END AS contactoCelular,

      -- Cabecera
      c.Cot_TipoEvento     AS tipoEvento,
      c.Cot_IdTipoEvento   AS idTipoEvento,
      c.Cot_FechaEvento    AS fechaEvento,
      c.Cot_Lugar          AS lugar,
      c.Cot_HorasEst       AS horasEstimadas,
      c.Cot_Mensaje        AS mensaje,
      ec.ECot_Nombre AS estado,
      c.Cot_Fecha_Crea     AS fechaCreacion,

      -- Total
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
  ORDER BY c.PK_Cot_Cod DESC;
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_obtener_json`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_obtener_json"(
  IN p_cot_id INT
)
BEGIN
  -- Validaciones básicas
  IF p_cot_id IS NULL OR p_cot_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cot_id inválido';
  END IF;

  IF (SELECT COUNT(*) FROM defaultdb.T_Cotizacion WHERE PK_Cot_Cod = p_cot_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotización no existe';
  END IF;

  /*
    Soporte para:
    - Lead: c.FK_Lead_Cod no nulo
    - Cliente: c.FK_Cli_Cod no nulo (T_Cliente -> T_Usuario)
    El objeto 'contacto' unifica ambos casos.
  */
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
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_convertir_a_pedido`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_convertir_a_pedido"(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,           -- FK_Em_Cod responsable del pedido
  IN  p_nombre_pedido VARCHAR(225),  -- opcional; si NULL se autogenera
  OUT o_pedido_id     INT
)
BEGIN
  DECLARE v_fk_cli      INT;
  DECLARE v_tipo_evento VARCHAR(40);
  DECLARE v_fecha_ev    DATE;
  DECLARE v_lugar       VARCHAR(150);
  DECLARE v_estado      VARCHAR(20);
  DECLARE v_nombre      VARCHAR(225);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- 1) Leer cotización y bloquearla
  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,     v_estado
  FROM T_Cotizacion c
  JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotización no encontrada';
  END IF;

  -- 2) Validar estado
  IF v_estado <> 'Aceptada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden migrar cotizaciones en estado Aceptada';
  END IF;

  -- 3) Validar cliente (cotización sin cliente no migra)
  IF v_fk_cli IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotización no tiene cliente ni lead asociado';
  END IF;

  -- 4) Nombre de pedido
  SET v_nombre = COALESCE(
    p_nombre_pedido,
    CONCAT(
      COALESCE(v_tipo_evento,'Evento'),
      ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, CURDATE()), '%Y-%m-%d'),
      COALESCE(CONCAT(' - ', v_lugar), '')
    )
  );

  -- 5) Insertar Pedido
  INSERT INTO T_Pedido
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones, FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, CURDATE(), CONCAT('Origen: Cotización #', p_cot_id), p_empleado_id, v_nombre, v_fecha_ev);

  SET o_pedido_id = LAST_INSERT_ID();

  /* 6) Insertar líneas (servicios) */
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

  /* 7) Migrar eventos/locaciones */
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
END;


DROP PROCEDURE IF EXISTS `sp_cotizacion_publica_crear`;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_publica_crear"(
  IN p_lead_nombre    VARCHAR(80),
  IN p_lead_celular   VARCHAR(30),
  IN p_lead_origen    VARCHAR(40),
  IN p_tipo_evento    VARCHAR(40),
  IN p_id_tipo_evento INT,
  IN p_fecha_evento   DATE,
  IN p_lugar          VARCHAR(150),
  IN p_horas_est      DECIMAL(4,1),
  IN p_mensaje        VARCHAR(500)
)
BEGIN
  DECLARE v_lead_id INT;
  DECLARE v_cot_id  INT;
  DECLARE v_estado_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;

  -- dedup simple por celular (ajusta si luego agregas email)
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
    Cot_Mensaje,
    FK_ECot_Cod
  )
  VALUES (
    v_lead_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_mensaje,
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END;

