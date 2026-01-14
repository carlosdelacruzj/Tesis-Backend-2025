-- Fase 16: bloquear cotizaciones con cliente inactivo y excluir inactivos del autocompletado
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_cliente_autocompletar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cliente_autocompletar`(
  IN p_query VARCHAR(120),
  IN p_limit INT
)
BEGIN
  DECLARE v_q VARCHAR(120);
  DECLARE v_q_norm VARCHAR(120);
  DECLARE v_t1 VARCHAR(60);
  DECLARE v_t2 VARCHAR(60);
  DECLARE v_limit INT DEFAULT 10;

  -- Normaliza y colapsa espacios dobles
  SET v_q = NULLIF(TRIM(p_query), '');
  IF v_q IS NOT NULL THEN
    SET v_q_norm = REPLACE(REPLACE(REPLACE(v_q, '  ', ' '), '  ', ' '), '  ', ' ');
  ELSE
    SET v_q_norm = NULL;
  END IF;

  -- token1 = primera palabra; token2 = resto (todo lo que viene despues de la 1ra palabra)
  SET v_t1 = NULL;
  SET v_t2 = NULL;
  IF v_q_norm IS NOT NULL THEN
    SET v_t1 = NULLIF(TRIM(SUBSTRING_INDEX(v_q_norm, ' ', 1)), '');
    SET v_t2 = NULLIF(TRIM(SUBSTRING(v_q_norm, LENGTH(SUBSTRING_INDEX(v_q_norm, ' ', 1)) + 2)), '');
  END IF;

  -- Limite seguro
  SET v_limit = IFNULL(p_limit, 10);
  SET v_limit = CASE
                  WHEN v_limit < 1  THEN 10
                  WHEN v_limit > 50 THEN 50
                  ELSE v_limit
                END;

  IF v_q_norm IS NULL THEN
    -- Sin texto: devolver 0 filas
    SELECT
      CAST(NULL AS SIGNED) AS idCliente,
      CAST(NULL AS CHAR)   AS codigoCliente,
      CAST(NULL AS CHAR)   AS nombre,
      CAST(NULL AS CHAR)   AS apellido,
      CAST(NULL AS CHAR)   AS correo,
      CAST(NULL AS CHAR)   AS celular,
      CAST(NULL AS CHAR)   AS doc,
      CAST(NULL AS CHAR)   AS direccion,
      CAST(NULL AS SIGNED) AS tipoDocumentoId,
      CAST(NULL AS CHAR)   AS tipoDocumentoCodigo,
      CAST(NULL AS CHAR)   AS tipoDocumentoNombre
    WHERE 1=0;

  ELSEIF v_t2 IS NOT NULL THEN
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      CASE WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial ELSE u.U_Nombre END AS nombre,
      CASE WHEN td.TD_Codigo = 'RUC' THEN NULL ELSE u.U_Apellido END AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      u.FK_TD_Cod AS tipoDocumentoId,
      td.TD_Codigo AS tipoDocumentoCodigo,
      td.TD_Nombre AS tipoDocumentoNombre,
      90 AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
    WHERE
      c.FK_ECli_Cod = 1
      AND (
        (u.U_Nombre  LIKE CONCAT(v_t1, '%') AND u.U_Apellido LIKE CONCAT(v_t2, '%'))
        OR c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%')
      )
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;

  ELSE
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      CASE WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial ELSE u.U_Nombre END AS nombre,
      CASE WHEN td.TD_Codigo = 'RUC' THEN NULL ELSE u.U_Apellido END AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      u.FK_TD_Cod AS tipoDocumentoId,
      td.TD_Codigo AS tipoDocumentoCodigo,
      td.TD_Nombre AS tipoDocumentoNombre,
      (CASE
         WHEN u.U_Numero_Documento = v_q_norm OR u.U_Correo = v_q_norm OR u.U_Celular = v_q_norm THEN 100
         WHEN c.Cli_RazonSocial = v_q_norm THEN 95
         WHEN c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%') THEN 80
         WHEN u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR u.U_Celular LIKE CONCAT(v_t1, '%') THEN 70
         WHEN u.U_Nombre LIKE CONCAT(v_t1, '%') OR u.U_Apellido LIKE CONCAT(v_t1, '%') THEN 55
         ELSE 0
       END) AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
    WHERE
      c.FK_ECli_Cod = 1
      AND (
        u.U_Numero_Documento = v_q_norm OR
        u.U_Correo = v_q_norm OR
        u.U_Celular = v_q_norm OR
        c.Cli_RazonSocial = v_q_norm OR
        c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%') OR
        u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR
        u.U_Celular          LIKE CONCAT(v_t1, '%') OR
        u.U_Nombre           LIKE CONCAT(v_t1, '%') OR
        u.U_Apellido         LIKE CONCAT(v_t1, '%')
      )
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;
  END IF;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_crear_v3`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cotizacion_admin_crear_v3`(

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



  IN p_items_json      JSON,           -- array de items

  IN p_eventos_json    JSON            -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }

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



  /* 1) Origen: CLIENTE (preferente) o crear LEAD */

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



  /* 3) Items (si viene array JSON) */

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

END ;;
DELIMITER ;
