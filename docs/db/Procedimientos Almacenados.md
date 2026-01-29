# Procedimientos Almacenados

## Indice

- [sp_cliente_actualizar](#sp_cliente_actualizar)
- [sp_cliente_autocompletar](#sp_cliente_autocompletar)
- [sp_cliente_buscar_por_documento](#sp_cliente_buscar_por_documento)
- [sp_cliente_crear](#sp_cliente_crear)
- [sp_cliente_listar](#sp_cliente_listar)
- [sp_cliente_obtener](#sp_cliente_obtener)
- [sp_cotizacion_admin_actualizar](#sp_cotizacion_admin_actualizar)
- [sp_cotizacion_admin_crear_v3](#sp_cotizacion_admin_crear_v3)
- [sp_cotizacion_convertir_a_pedido](#sp_cotizacion_convertir_a_pedido)
- [sp_cotizacion_estado_actualizar](#sp_cotizacion_estado_actualizar)
- [sp_cotizacion_listar_general](#sp_cotizacion_listar_general)
- [sp_cotizacion_obtener_json](#sp_cotizacion_obtener_json)
- [sp_cotizacion_publica_crear](#sp_cotizacion_publica_crear)
- [sp_empleado_actualizar](#sp_empleado_actualizar)
- [sp_empleado_cargo_listar](#sp_empleado_cargo_listar)
- [sp_empleado_crear](#sp_empleado_crear)
- [sp_empleado_listar](#sp_empleado_listar)
- [sp_empleado_obtener](#sp_empleado_obtener)
- [sp_evento_listar](#sp_evento_listar)
- [sp_evento_servicio_actualizar](#sp_evento_servicio_actualizar)
- [sp_evento_servicio_crear](#sp_evento_servicio_crear)
- [sp_evento_servicio_listar](#sp_evento_servicio_listar)
- [sp_evento_servicio_obtener](#sp_evento_servicio_obtener)
- [sp_lead_convertir_cliente](#sp_lead_convertir_cliente)
- [sp_metodo_pago_listar](#sp_metodo_pago_listar)
- [sp_pedido_actualizar](#sp_pedido_actualizar)
- [sp_pedido_estado_obtener_ultimo](#sp_pedido_estado_obtener_ultimo)
- [sp_pedido_listar](#sp_pedido_listar)
- [sp_pedido_listar_por_cliente_detalle](#sp_pedido_listar_por_cliente_detalle)
- [sp_pedido_obtener](#sp_pedido_obtener)
- [sp_pedido_obtener_siguiente_id](#sp_pedido_obtener_siguiente_id)
- [sp_pedido_pago_resumen](#sp_pedido_pago_resumen)
- [sp_pedido_saldo_listar_pagados](#sp_pedido_saldo_listar_pagados)
- [sp_pedido_saldo_listar_parciales](#sp_pedido_saldo_listar_parciales)
- [sp_pedido_saldo_listar_pendientes](#sp_pedido_saldo_listar_pendientes)
- [sp_proyecto_actualizar](#sp_proyecto_actualizar)
- [sp_proyecto_crear_desde_pedido](#sp_proyecto_crear_desde_pedido)
- [sp_proyecto_disponibilidad](#sp_proyecto_disponibilidad)
- [sp_proyecto_eliminar](#sp_proyecto_eliminar)
- [sp_proyecto_listar](#sp_proyecto_listar)
- [sp_proyecto_obtener](#sp_proyecto_obtener)
- [sp_servicio_listar](#sp_servicio_listar)
- [sp_voucher_crear](#sp_voucher_crear)
- [sp_voucher_estado_listar](#sp_voucher_estado_listar)
- [sp_voucher_listar_por_pedido](#sp_voucher_listar_por_pedido)
- [sp_voucher_listar_por_pedido_detalle](#sp_voucher_listar_por_pedido_detalle)
- [sp_voucher_listar_ultimos_por_estado](#sp_voucher_listar_ultimos_por_estado)
- [sp_voucher_obtener_por_pedido](#sp_voucher_obtener_por_pedido)

## sp_cliente_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_actualizar"(
  IN pIdCliente INT,
  IN pNombre    VARCHAR(100),
  IN pApellido  VARCHAR(100),
  IN pCorreo    VARCHAR(250),
  IN pCelular   VARCHAR(25),
  IN pDireccion VARCHAR(250),
  IN pRazonSocial VARCHAR(150)
)
BEGIN
  DECLARE vUserId INT;
  DECLARE vTdCodigo VARCHAR(10);

  SELECT c.FK_U_Cod, td.TD_Codigo INTO vUserId, vTdCodigo
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cli_Cod = pIdCliente;

  IF vUserId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe';
  END IF;

  IF vTdCodigo = 'RUC' THEN
    IF pRazonSocial IS NOT NULL AND TRIM(pRazonSocial) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  END IF;

  UPDATE T_Usuario
     SET U_Nombre   = COALESCE(NULLIF(TRIM(pNombre), ''), U_Nombre),
         U_Apellido = COALESCE(NULLIF(TRIM(pApellido), ''), U_Apellido),
         U_Correo   = COALESCE(pCorreo,    U_Correo),
         U_Celular  = COALESCE(pCelular,   U_Celular),
         U_Direccion = COALESCE(pDireccion, U_Direccion)
   WHERE PK_U_Cod = vUserId;

  IF vTdCodigo = 'RUC' THEN
    UPDATE T_Cliente
       SET Cli_RazonSocial = COALESCE(NULLIF(TRIM(pRazonSocial), ''), Cli_RazonSocial)
     WHERE PK_Cli_Cod = pIdCliente;
  END IF;

  SELECT
    c.PK_Cli_Cod                               AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.PK_U_Cod                                 AS idUsuario,
    u.U_Nombre                                 AS nombre,
    u.U_Apellido                               AS apellido,
    u.U_Correo                                 AS correo,
    u.U_Celular                                AS celular,
    u.U_Numero_Documento                       AS doc,
    u.U_Direccion                              AS direccion,
    u.FK_TD_Cod                                AS tipoDocumentoId,
    td.TD_Codigo                               AS tipoDocumentoCodigo,
    td.TD_Nombre                               AS tipoDocumentoNombre,
    c.Cli_RazonSocial                          AS razonSocial,
    c.Cli_Tipo_Cliente                         AS tipoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cli_Cod = pIdCliente;
END
;;
DELIMITER ;
```

## sp_cliente_autocompletar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_autocompletar"(
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
END
;;
DELIMITER ;
```

## sp_cliente_buscar_por_documento

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_buscar_por_documento"(
  IN p_doc VARCHAR(50)  -- número de documento (DNI/RUC)
)
BEGIN
  /*
    Devuelve datos de usuario + (si existe) su fila en T_Cliente enlazada por FK_U_Cod.
    - Si p_doc es NULL devuelve todos (útil para pruebas).
    - Si p_doc no es NULL filtra por U_Numero_Document.
  */

  SELECT
      u.PK_U_Cod               AS idUsuario,
      u.U_Nombre               AS nombre,
      u.U_Apellido             AS apellido,
      u.U_Correo               AS correo,
      u.U_Celular              AS celular,
      u.U_Numero_Documento      AS documento,
      u.U_Direccion            AS direccion,
      c.PK_Cli_Cod             AS idCliente   -- <<< CAMBIA AQUÍ si tu PK se llama distinto
  FROM T_Usuario u
  LEFT JOIN T_Cliente c
         ON c.FK_U_Cod = u.PK_U_Cod
  WHERE (p_doc IS NULL OR u.U_Numero_Documento = p_doc);
END
;;
DELIMITER ;
```

## sp_cliente_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_crear"(
  IN p_nombre        VARCHAR(100),
  IN p_apellido      VARCHAR(100),
  IN p_correo        VARCHAR(120),
  IN p_numDoc        VARCHAR(32),
  IN p_tipo_doc_id   INT,
  IN p_razon_social  VARCHAR(150),
  IN p_celular       VARCHAR(32),
  IN p_direccion     VARCHAR(200),
  IN p_contrasena_hash VARCHAR(255)
)
BEGIN
  DECLARE v_user_id BIGINT;
  DECLARE v_tipo_cliente INT DEFAULT 1;
  DECLARE v_td_codigo VARCHAR(10);

  SELECT TD_Codigo INTO v_td_codigo
  FROM T_TipoDocumento
  WHERE PK_TD_Cod = p_tipo_doc_id
  LIMIT 1;

  IF v_td_codigo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de documento invalido';
  END IF;

  IF v_td_codigo = 'RUC' THEN
    SET v_tipo_cliente = 2;
    IF p_razon_social IS NULL OR TRIM(p_razon_social) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  END IF;

  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), p_contrasena_hash, TRIM(p_celular), TRIM(p_numDoc), p_tipo_doc_id, TRIM(p_direccion));

  SET v_user_id = LAST_INSERT_ID();

  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod, Cli_RazonSocial)
  VALUES (
    v_user_id,
    v_tipo_cliente,
    1,
    CASE WHEN v_td_codigo = 'RUC' THEN TRIM(p_razon_social) ELSE NULL END
  );
END
;;
DELIMITER ;
```

## sp_cliente_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_listar"()
BEGIN
  SELECT
    c.PK_Cli_Cod AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.U_Nombre  AS nombre,
    u.U_Apellido AS apellido,
    u.U_Correo  AS correo,
    u.U_Celular AS celular,
    u.U_Numero_Documento AS doc,
    u.U_Direccion AS direccion,
    u.FK_TD_Cod AS tipoDocumentoId,
    td.TD_Codigo AS tipoDocumentoCodigo,
    td.TD_Nombre AS tipoDocumentoNombre,
    c.Cli_RazonSocial AS razonSocial,
    c.Cli_Tipo_Cliente AS tipoCliente,
    ec.PK_ECli_Cod AS idEstadoCliente,
    ec.ECli_Nombre AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  ORDER BY c.PK_Cli_Cod;
END
;;
DELIMITER ;
```

## sp_cliente_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_obtener"(IN pId INT)
BEGIN
  SELECT
    c.PK_Cli_Cod                               AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.PK_U_Cod                                 AS idUsuario,
    u.U_Nombre                                 AS nombre,
    u.U_Apellido                               AS apellido,
    u.U_Correo                                 AS correo,
    u.U_Celular                                AS celular,
    u.U_Numero_Documento                       AS doc,
    u.U_Direccion                              AS direccion,
    u.FK_TD_Cod                                AS tipoDocumentoId,
    td.TD_Codigo                               AS tipoDocumentoCodigo,
    td.TD_Nombre                               AS tipoDocumentoNombre,
    c.Cli_Tipo_Cliente                         AS tipoCliente,
    c.Cli_RazonSocial                          AS razonSocial,
    ec.PK_ECli_Cod                             AS idEstadoCliente,
    ec.ECli_Nombre                             AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u         ON u.PK_U_Cod     = c.FK_U_Cod
  JOIN T_TipoDocumento td  ON td.PK_TD_Cod   = u.FK_TD_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  WHERE c.PK_Cli_Cod = pId;
END
;;
DELIMITER ;
```

## sp_cotizacion_admin_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_admin_actualizar"(
  IN p_cot_id          INT,
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_dias            SMALLINT,
  IN p_viaticos_monto  DECIMAL(10,2),
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

  -- Validacion existencia
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
  SET Cot_TipoEvento     = COALESCE(p_tipo_evento,    Cot_TipoEvento),
      Cot_IdTipoEvento   = COALESCE(p_id_tipo_evento, Cot_IdTipoEvento),
      Cot_FechaEvento    = COALESCE(p_fecha_evento,   Cot_FechaEvento),
      Cot_Lugar          = COALESCE(p_lugar,          Cot_Lugar),
      Cot_HorasEst       = COALESCE(p_horas_est,      Cot_HorasEst),
      Cot_Dias           = COALESCE(p_dias,           Cot_Dias),
      Cot_ViaticosMonto  = COALESCE(p_viaticos_monto, Cot_ViaticosMonto),
      Cot_Mensaje        = COALESCE(p_mensaje,        Cot_Mensaje),
      FK_ECot_Cod        = COALESCE(v_estado_id,      FK_ECot_Cod)
  WHERE PK_Cot_Cod = p_cot_id;

  -- Reemplazo completo de items si se envia JSON
  IF p_items_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionServicioFecha
    WHERE FK_Cot_Cod = p_cot_id;

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
END
;;
DELIMITER ;
```

## sp_cotizacion_admin_crear_v3

```sql
DELIMITER ;;
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
  IN p_dias            SMALLINT,
  IN p_viaticos_monto  DECIMAL(10,2),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),    -- 'Borrador' | 'Enviada' (opcional)
  IN p_fecha_crea      DATETIME,
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
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cliente no existe';
    END IF;
  ELSE
    IF p_lead_nombre IS NULL OR TRIM(p_lead_nombre) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Se requiere nombre para crear el lead';
    END IF;

    INSERT INTO defaultdb.T_Lead (Lead_Nombre, Lead_Celular, Lead_Origen)
    VALUES (TRIM(p_lead_nombre), TRIM(p_lead_celular), TRIM(p_lead_origen));

    SET v_lead_id = LAST_INSERT_ID();
  END IF;

  /* 2) Estado: usa el enviado o default Borrador */
  SET v_estado_nombre = COALESCE(NULLIF(TRIM(p_estado), ''), 'Borrador');
  SELECT PK_ECot_Cod INTO v_estado_id
  FROM defaultdb.T_Estado_Cotizacion
  WHERE ECot_Nombre = v_estado_nombre
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Estado de cotizacion invalido';
  END IF;

  /* 3) Insert cabecera */
  INSERT INTO defaultdb.T_Cotizacion(
    FK_Lead_Cod,
    FK_Cli_Cod,
    Cot_TipoEvento,
    Cot_IdTipoEvento,
    Cot_FechaEvento,
    Cot_Lugar,
    Cot_HorasEst,
    Cot_Dias,
    Cot_ViaticosMonto,
    Cot_Mensaje,
    Cot_Fecha_Crea,
    FK_ECot_Cod
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
    COALESCE(p_viaticos_monto, 0),
    p_mensaje,
    COALESCE(p_fecha_crea, NOW()),
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  /* 4) Items */
  IF p_items_json IS NOT NULL THEN
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
      v_cot_id,
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

  /* 5) Eventos */
  IF p_eventos_json IS NOT NULL THEN
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

  /* 6) Salida */
  SELECT
    v_cot_id  AS idCotizacion,
    v_cli_id  AS clienteId,
    v_lead_id AS leadId,
    CASE WHEN v_cli_id IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen;
END
;;
DELIMITER ;
```

## sp_cotizacion_convertir_a_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_convertir_a_pedido"(
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
  DECLARE v_viaticos_monto DECIMAL(10,2);
  DECLARE v_horas_est   DECIMAL(4,1);
  DECLARE v_mensaje     VARCHAR(500);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET v_fecha_ref = COALESCE(p_fecha_hoy, CURDATE());

  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar,
         c.Cot_IdTipoEvento, c.Cot_Dias, c.Cot_ViaticosMonto, c.Cot_HorasEst, c.Cot_Mensaje, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,
         v_id_tipo_evento, v_dias, v_viaticos_monto, v_horas_est, v_mensaje, v_estado
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
     FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento, P_Lugar, P_IdTipoEvento, P_Dias, P_ViaticosMonto, P_HorasEst, P_Mensaje)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id),
     p_empleado_id, v_nombre, v_fecha_ev, v_lugar, v_id_tipo_evento, v_dias, COALESCE(v_viaticos_monto, 0), v_horas_est, v_mensaje);

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
END
;;
DELIMITER ;
```

## sp_cotizacion_estado_actualizar

```sql
DELIMITER ;;
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
END
;;
DELIMITER ;
```

## sp_cotizacion_listar_general

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_listar_general"()
BEGIN
  SELECT
      c.PK_Cot_Cod        AS idCotizacion,

      -- Origen
      c.FK_Lead_Cod       AS idLead,
      c.FK_Cli_Cod        AS idCliente,
      CASE WHEN c.FK_Cli_Cod IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen,

      -- Si CLIENTE y es RUC devuelve razon social; si es LEAD usa Lead_Nombre
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
      c.Cot_Dias           AS dias,
      c.Cot_ViaticosMonto  AS viaticosMonto,
      c.Cot_Mensaje        AS mensaje,
      ec.ECot_Nombre       AS estado,
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
      ), 0) + COALESCE(c.Cot_ViaticosMonto, 0) AS total
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u   ON u.PK_U_Cod    = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  ORDER BY c.PK_Cot_Cod DESC;
END
;;
DELIMITER ;
```

## sp_cotizacion_obtener_json

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_obtener_json"(
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
            'id',              cli.PK_Cli_Cod,

            'nombreContacto',  CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            'nombre',          CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            'razonSocial',     cli.Cli_RazonSocial,

            'tipoDocumento',   td.TD_Codigo,
            'numeroDocumento', u.U_Numero_Documento,

            'celular',         u.U_Celular,
            'origen',          'CLIENTE',
            'fechaCrea',       c.Cot_Fecha_Crea
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
        'viaticosMonto',  c.Cot_ViaticosMonto,
        'mensaje',        c.Cot_Mensaje,
        'estado',         ec.ECot_Nombre,
        'fechaCreacion',  c.Cot_Fecha_Crea,

        'total',          COALESCE((
                           SELECT SUM(s.CS_Subtotal)
                           FROM defaultdb.T_CotizacionServicio s
                           WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                         ),0) + COALESCE(c.Cot_ViaticosMonto, 0)
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
      ), JSON_ARRAY()),

      'serviciosFechas', COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'idCotizacionServicio', sf.FK_CotServ_Cod,
            'fecha', sf.CSF_Fecha
          )
        )
        FROM defaultdb.T_CotizacionServicioFecha sf
        WHERE sf.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY())
    ) AS cotizacion_json
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u ON u.PK_U_Cod = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

END
;;
DELIMITER ;
```

## sp_cotizacion_publica_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_publica_crear"(
  IN p_lead_nombre    VARCHAR(80),
  IN p_lead_celular   VARCHAR(30),
  IN p_lead_origen    VARCHAR(40),
  IN p_tipo_evento    VARCHAR(40),
  IN p_id_tipo_evento INT,
  IN p_fecha_evento   DATE,
  IN p_lugar          VARCHAR(150),
  IN p_horas_est      DECIMAL(4,1),
  IN p_dias           SMALLINT,
  IN p_viaticos_monto DECIMAL(10,2),
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
    Cot_Dias,
    Cot_ViaticosMonto,
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
    COALESCE(p_viaticos_monto, 0),
    p_mensaje,
    COALESCE(p_fecha_crea, NOW()),
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END
;;
DELIMITER ;
```

## sp_empleado_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_actualizar"(
  IN p_id       INT,          -- PK_Em_Cod
  IN p_celular  VARCHAR(32),
  IN p_correo   VARCHAR(120),
  IN p_direccion VARCHAR(200),
  IN p_estado   TINYINT       -- 1=SI (autónomo), 0=NO
)
BEGIN
  DECLARE v_user_id INT;

  -- obtener el usuario del empleado
  SELECT FK_U_Cod INTO v_user_id
  FROM T_Empleados
  WHERE PK_Em_Cod = p_id;

  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Empleado no existe';
  END IF;

  -- actualizar datos de contacto del usuario
  UPDATE T_Usuario
  SET U_Celular   = TRIM(p_celular),
      U_Correo    = TRIM(p_correo),
      U_Direccion = TRIM(p_direccion)
  WHERE PK_U_Cod = v_user_id;

  -- actualizar estado de autonomía del empleado (SI/NO)
  UPDATE T_Empleados
  SET Em_Autonomo = IF(p_estado=1,'SI','NO')
  WHERE PK_Em_Cod = p_id;

  -- opcional: devolver filas afectadas
  SELECT ROW_COUNT() AS rowsAffected;
END
;;
DELIMITER ;
```

## sp_empleado_cargo_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_cargo_listar"()
BEGIN
  SELECT
    te.PK_Tipo_Emp_Cod AS idCargo,
    te.TiEm_Cargo     AS cargoNombre,
    te.TiEm_OperativoCampo AS esOperativoCampo
  FROM T_Tipo_Empleado te
  ORDER BY te.TiEm_Cargo;
END
;;
DELIMITER ;
```

## sp_empleado_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_crear"(
  IN p_nombre     VARCHAR(100),
  IN p_apellido   VARCHAR(100),
  IN p_correo     VARCHAR(120),
  IN p_celular    VARCHAR(32),
  IN p_doc        VARCHAR(32),
  IN p_tipo_doc_id INT,
  IN p_direccion  VARCHAR(200),
  IN p_autonomo   TINYINT,
  IN p_cargo      INT
)
BEGIN
  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), NULL, TRIM(p_celular), TRIM(p_doc), p_tipo_doc_id, TRIM(p_direccion));

  SET @v_user_id := LAST_INSERT_ID();

  INSERT INTO T_Empleados (FK_U_Cod, Em_Autonomo, FK_Tipo_Emp_Cod)
  VALUES (@v_user_id, IF(p_autonomo=1,'SI','NO'), p_cargo);

  SELECT @v_user_id AS userId, LAST_INSERT_ID() AS empleadoId;
END
;;
DELIMITER ;
```

## sp_empleado_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_listar"()
BEGIN
  SELECT
    e.PK_Em_Cod                               AS idEmpleado,
    CONCAT('EMP-', LPAD(e.PK_Em_Cod, 6, '0')) AS codigoEmpleado,
    u.PK_U_Cod                                AS idUsuario,
    u.U_Nombre                                AS nombre,
    u.U_Apellido                              AS apellido,
    u.U_Correo                                AS correo,
    u.U_Celular                               AS celular,
    u.U_Numero_Documento                      AS documento,
    u.U_Direccion                             AS direccion,
    e.Em_Autonomo                             AS autonomo,
    e.FK_Tipo_Emp_Cod                         AS idCargo,
    te.TiEm_Cargo                             AS cargo,
    te.TiEm_OperativoCampo                    AS esOperativoCampo,
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u         ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  ORDER BY e.PK_Em_Cod;
END
;;
DELIMITER ;
```

## sp_empleado_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_obtener"(IN p_id INT)
BEGIN
  SELECT
    e.PK_Em_Cod                               AS idEmpleado,
    CONCAT('EMP-', LPAD(e.PK_Em_Cod, 6, '0')) AS codigoEmpleado,
    u.PK_U_Cod                                AS idUsuario,
    u.U_Nombre                                AS nombre,
    u.U_Apellido                              AS apellido,
    u.U_Correo                                AS correo,
    u.U_Celular                               AS celular,
    u.U_Numero_Documento                      AS documento,
    u.U_Direccion                             AS direccion,
    e.Em_Autonomo                             AS autonomo,
    e.FK_Tipo_Emp_Cod                         AS idCargo,
    te.TiEm_Cargo                             AS cargo,
    te.TiEm_OperativoCampo                    AS esOperativoCampo,
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u          ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te   ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  WHERE e.PK_Em_Cod = p_id
  LIMIT 1;
END
;;
DELIMITER ;
```

## sp_evento_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_listar"()
BEGIN
  DECLARE v_table_name VARCHAR(64);

  -- Busca una tabla de eventos con nombre T_Eventos o T_Evento
  SELECT t.table_name
    INTO v_table_name
  FROM information_schema.tables t
  WHERE t.table_schema = DATABASE()
    AND t.table_name IN ('T_Eventos','T_Evento')
  ORDER BY FIELD(t.table_name, 'T_Eventos','T_Evento')  -- preferimos T_Eventos si existen ambas
  LIMIT 1;

  -- Si no hay tabla compatible, avisamos
  IF v_table_name IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No existe una tabla de eventos (T_Eventos o T_Evento) en este schema.';
  ELSE
    -- Selecciona todos los eventos. ORDER BY 1 = por la primera columna (normalmente el PK)
    SET @sql := CONCAT('SELECT * FROM ', v_table_name, ' ORDER BY 1 DESC');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END
;;
DELIMITER ;
```

## sp_evento_servicio_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_actualizar"(
    IN p_id             INT,            -- PK_ExS_Cod
    IN p_servicio       INT,            -- Nuevo FK servicio (nullable)
    IN p_evento         INT,            -- Nuevo FK evento   (nullable)
    IN p_categoria_id   INT,            -- Nuevo FK categoría (nullable)
    IN p_es_addon       TINYINT,        -- 1/0 para marcar complemento
    IN p_precio         DECIMAL(10,2),
    IN p_descripcion    VARCHAR(255),
    IN p_titulo         VARCHAR(255),
    IN p_horas          DECIMAL(4,1),
    IN p_fotos          INT,
    IN p_trailer        INT,
    IN p_film           INT,
    IN p_staff          JSON,           -- Reemplaza si no es NULL
    IN p_equipos        JSON            -- Reemplaza si no es NULL
)
BEGIN
    DECLARE v_servicio INT;
    DECLARE v_evento   INT;
    DECLARE v_categoria INT;
    DECLARE v_titulo   VARCHAR(120);

    IF NOT EXISTS (SELECT 1 FROM T_EventoServicio WHERE PK_ExS_Cod = p_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_SERVICIO_NO_EXISTE';
    END IF;

    SELECT PK_S_Cod, PK_E_Cod, FK_ESC_Cod INTO v_servicio, v_evento, v_categoria
      FROM T_EventoServicio
     WHERE PK_ExS_Cod = p_id
     FOR UPDATE;

    SET v_servicio = COALESCE(p_servicio, v_servicio);
    SET v_evento   = COALESCE(p_evento, v_evento);
    SET v_categoria = COALESCE(p_categoria_id, v_categoria);

    IF NOT EXISTS (SELECT 1 FROM T_Servicios WHERE PK_S_Cod = v_servicio) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SERVICIO_NO_EXISTE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM T_Eventos WHERE PK_E_Cod = v_evento) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_NO_EXISTE';
    END IF;

    IF v_categoria IS NOT NULL AND
       NOT EXISTS (
           SELECT 1
             FROM T_EventoServicioCategoria
            WHERE PK_ESC_Cod = v_categoria
              AND ESC_Activo = 1
       ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CATEGORIA_NO_EXISTE';
    END IF;

    SET v_titulo = COALESCE(NULLIF(TRIM(p_titulo), ''),
                            (SELECT ExS_Titulo FROM T_EventoServicio WHERE PK_ExS_Cod = p_id));

    UPDATE T_EventoServicio
       SET PK_S_Cod        = v_servicio,
           PK_E_Cod        = v_evento,
           FK_ESC_Cod      = v_categoria,
           ExS_EsAddon     = COALESCE(p_es_addon, ExS_EsAddon),
           ExS_Titulo      = v_titulo,
           ExS_Precio      = COALESCE(p_precio, ExS_Precio),
           ExS_Descripcion = COALESCE(NULLIF(TRIM(p_descripcion), ''), ExS_Descripcion),
           ExS_Horas       = COALESCE(p_horas, ExS_Horas),
           ExS_FotosImpresas = COALESCE(p_fotos, ExS_FotosImpresas),
           ExS_TrailerMin  = COALESCE(p_trailer, ExS_TrailerMin),
           ExS_FilmMin     = COALESCE(p_film, ExS_FilmMin)
     WHERE PK_ExS_Cod = p_id;

    IF p_staff IS NOT NULL THEN
        DELETE FROM T_EventoServicioStaff WHERE FK_ExS_Cod = p_id;
        IF JSON_VALID(p_staff) THEN
            INSERT INTO T_EventoServicioStaff (FK_ExS_Cod, Staff_Rol, Staff_Cantidad)
            SELECT p_id,
                   NULLIF(TRIM(js.rol), ''),
                   GREATEST(COALESCE(js.cantidad, 0), 0)
            FROM JSON_TABLE(
                    p_staff,
                    '$[*]' COLUMNS (
                        rol VARCHAR(40) PATH '$.rol',
                        cantidad INT PATH '$.cantidad'
                    )
                 ) js
            WHERE NULLIF(TRIM(js.rol), '') IS NOT NULL;
        END IF;
    END IF;

    IF p_equipos IS NOT NULL THEN
        DELETE FROM T_EventoServicioEquipo WHERE FK_ExS_Cod = p_id;
        IF JSON_VALID(p_equipos) THEN
            INSERT INTO T_EventoServicioEquipo (FK_ExS_Cod, FK_TE_Cod, Cantidad, Notas)
            SELECT p_id,
                   js.tipoEquipoId,
                   GREATEST(COALESCE(js.cantidad, 1), 0),
                   NULLIF(TRIM(js.notas), '')
            FROM JSON_TABLE(
                    p_equipos,
                    '$[*]' COLUMNS (
                        tipoEquipoId INT PATH '$.tipoEquipoId',
                        cantidad INT PATH '$.cantidad',
                        notas VARCHAR(150) PATH '$.notas'
                    )
                 ) js
            WHERE js.tipoEquipoId IS NOT NULL;
        END IF;
    END IF;
END
;;
DELIMITER ;
```

## sp_evento_servicio_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_crear"(
    IN p_servicio      INT,             -- T_Servicios.PK_S_Cod
    IN p_evento        INT,             -- T_Eventos.PK_E_Cod
    IN p_categoria_id  INT,             -- FK -> T_EventoServicioCategoria (nullable)
    IN p_es_addon      TINYINT,         -- 1 si es complemento, 0 en caso contrario
    IN p_precio        DECIMAL(10,2),   -- ExS_Precio
    IN p_descripcion   VARCHAR(255),    -- ExS_Descripcion
    IN p_titulo        VARCHAR(255),    -- ExS_Titulo (requerido, se normaliza)
    IN p_horas         DECIMAL(4,1),    -- ExS_Horas
    IN p_fotos         INT,             -- ExS_FotosImpresas
    IN p_trailer       INT,             -- ExS_TrailerMin
    IN p_film          INT,             -- ExS_FilmMin
    IN p_staff         JSON,            -- Detalle [{rol,cantidad}]
    IN p_equipos       JSON             -- Detalle [{tipoEquipoId,cantidad,notas}]
)
BEGIN
    DECLARE v_titulo VARCHAR(120);
    DECLARE v_id INT;

    -- Validaciones básicas
    IF NOT EXISTS (SELECT 1 FROM T_Eventos WHERE PK_E_Cod = p_evento) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_NO_EXISTE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM T_Servicios WHERE PK_S_Cod = p_servicio) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SERVICIO_NO_EXISTE';
    END IF;

    IF p_categoria_id IS NOT NULL AND
       NOT EXISTS (
           SELECT 1
             FROM T_EventoServicioCategoria
            WHERE PK_ESC_Cod = p_categoria_id
              AND ESC_Activo = 1
       ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CATEGORIA_NO_EXISTE';
    END IF;

    SET v_titulo = NULLIF(TRIM(p_titulo), '');
    IF v_titulo IS NULL THEN
        SELECT CONCAT_WS(' - ', e.E_Nombre, s.S_Nombre)
          INTO v_titulo
        FROM T_Eventos e
        JOIN T_Servicios s
        WHERE e.PK_E_Cod = p_evento AND s.PK_S_Cod = p_servicio;
        IF v_titulo IS NULL THEN
            SET v_titulo = CONCAT('Paquete ', p_evento, '-', p_servicio);
        END IF;
    END IF;

    INSERT INTO T_EventoServicio (
        PK_S_Cod,
        PK_E_Cod,
        FK_ESC_Cod,
        ExS_EsAddon,
        ExS_Titulo,
        ExS_Precio,
        ExS_Descripcion,
        ExS_Horas,
        ExS_FotosImpresas,
        ExS_TrailerMin,
        ExS_FilmMin
    )
    VALUES (
        p_servicio,
        p_evento,
        p_categoria_id,
        IFNULL(p_es_addon, 0),
        v_titulo,
        p_precio,
        NULLIF(TRIM(p_descripcion), ''),
        p_horas,
        p_fotos,
        p_trailer,
        p_film
    );

    SET v_id = LAST_INSERT_ID();

    -- Staff
    IF p_staff IS NOT NULL AND JSON_VALID(p_staff) THEN
        INSERT INTO T_EventoServicioStaff (FK_ExS_Cod, Staff_Rol, Staff_Cantidad)
        SELECT v_id,
               NULLIF(TRIM(js.rol), ''),
               GREATEST(COALESCE(js.cantidad, 0), 0)
        FROM JSON_TABLE(
                p_staff,
                '$[*]' COLUMNS (
                    rol VARCHAR(40) PATH '$.rol',
                    cantidad INT PATH '$.cantidad'
                )
             ) AS js
        WHERE NULLIF(TRIM(js.rol), '') IS NOT NULL;
    END IF;

    -- Equipos
    IF p_equipos IS NOT NULL AND JSON_VALID(p_equipos) THEN
        INSERT INTO T_EventoServicioEquipo (FK_ExS_Cod, FK_TE_Cod, Cantidad, Notas)
        SELECT v_id,
               js.tipoEquipoId,
               GREATEST(COALESCE(js.cantidad, 1), 0),
               NULLIF(TRIM(js.notas), '')
        FROM JSON_TABLE(
                p_equipos,
                '$[*]' COLUMNS (
                    tipoEquipoId INT PATH '$.tipoEquipoId',
                    cantidad INT PATH '$.cantidad',
                    notas VARCHAR(150) PATH '$.notas'
                )
             ) AS js
        WHERE js.tipoEquipoId IS NOT NULL;
    END IF;

    SELECT v_id AS PK_ExS_Cod;
END
;;
DELIMITER ;
```

## sp_evento_servicio_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_listar"(
    IN p_evento INT,
    IN p_serv   INT
  )
BEGIN
    SELECT
        es.PK_ExS_Cod        AS idEventoServicio,
        es.ExS_Titulo        AS titulo,
        es.FK_ESC_Cod        AS categoriaId,
        cat.ESC_Nombre       AS categoriaNombre,
        cat.ESC_Tipo         AS categoriaTipo,
        es.ExS_EsAddon       AS esAddon,
        es.FK_ESE_Cod        AS estadoId,
        est.ESE_Nombre       AS estadoNombre,
        e.PK_E_Cod           AS idEvento,
        e.E_Nombre           AS evento,
        s.PK_S_Cod           AS idServicio,
        s.S_Nombre           AS servicio,
        es.ExS_Precio        AS precio,
        es.ExS_Descripcion   AS descripcion,
        es.ExS_Horas         AS horas,
        es.ExS_FotosImpresas AS fotosImpresas,
        es.ExS_TrailerMin    AS trailerMin,
        es.ExS_FilmMin       AS filmMin,
        (
          SELECT COALESCE(SUM(st.Staff_Cantidad), 0)
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffTotal,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'rol', st.Staff_Rol,
                     'cantidad', st.Staff_Cantidad
                   )
                 )
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffDetalle,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'tipoEquipoId', eq.FK_TE_Cod,
                     'tipoEquipo', te.TE_Nombre,
                     'cantidad', eq.Cantidad,
                     'notas', eq.Notas
                   )
                 )
          FROM T_EventoServicioEquipo eq
          JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
          WHERE eq.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS equipos
    FROM T_EventoServicio es
    JOIN T_Eventos e    ON e.PK_E_Cod = es.PK_E_Cod
    JOIN T_Servicios s  ON s.PK_S_Cod = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    LEFT JOIN T_EventoServicioEstado est    ON est.PK_ESE_Cod = es.FK_ESE_Cod
    WHERE (p_evento IS NULL OR es.PK_E_Cod = p_evento)
      AND (p_serv   IS NULL OR es.PK_S_Cod = p_serv)
    ORDER BY es.PK_ExS_Cod DESC;
  END
;;
DELIMITER ;
```

## sp_evento_servicio_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_obtener"(
    IN p_id INT
  )
BEGIN
    SELECT
        es.PK_ExS_Cod        AS id,
        es.ExS_Titulo        AS titulo,
        es.FK_ESC_Cod        AS categoriaId,
        cat.ESC_Nombre       AS categoriaNombre,
        cat.ESC_Tipo         AS categoriaTipo,
        es.ExS_EsAddon       AS esAddon,
        es.FK_ESE_Cod        AS estadoId,
        est.ESE_Nombre       AS estadoNombre,
        es.PK_E_Cod          AS idEvento,
        e.E_Nombre           AS evento,
        es.PK_S_Cod          AS idServicio,
        s.S_Nombre           AS servicio,
        es.ExS_Precio        AS precio,
        es.ExS_Descripcion   AS descripcion,
        es.ExS_Horas         AS horas,
        es.ExS_FotosImpresas AS fotosImpresas,
        es.ExS_TrailerMin    AS trailerMin,
        es.ExS_FilmMin       AS filmMin,
        (
          SELECT COALESCE(SUM(st.Staff_Cantidad), 0)
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffTotal,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'rol', st.Staff_Rol,
                     'cantidad', st.Staff_Cantidad
                   )
                 )
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffDetalle,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'tipoEquipoId', eq.FK_TE_Cod,
                     'tipoEquipo', te.TE_Nombre,
                     'cantidad', eq.Cantidad,
                     'notas', eq.Notas
                   )
                 )
          FROM T_EventoServicioEquipo eq
          JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
          WHERE eq.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS equipos
    FROM T_EventoServicio es
    JOIN T_Eventos e    ON e.PK_E_Cod = es.PK_E_Cod
    JOIN T_Servicios s  ON s.PK_S_Cod = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    LEFT JOIN T_EventoServicioEstado est    ON est.PK_ESE_Cod = es.FK_ESE_Cod
    WHERE es.PK_ExS_Cod = p_id;
  END
;;
DELIMITER ;
```

## sp_lead_convertir_cliente

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_lead_convertir_cliente"(
  IN  p_lead_id        INT,
  IN  p_correo         VARCHAR(250),   -- obligatorio
  IN  p_celular        VARCHAR(25),    -- si viene vacio se usa el del lead
  IN  p_nombre         VARCHAR(25),    -- opcional
  IN  p_apellido       VARCHAR(25),    -- opcional
  IN  p_num_doc        VARCHAR(11),    -- obligatorio para crear usuario
  IN  p_tipo_doc_id    INT,            -- opcional (si no viene, se infiere por longitud)
  IN  p_razon_social   VARCHAR(150),   -- requerido si es RUC
  IN  p_direccion      VARCHAR(100),
  IN  p_tipo_cliente   INT,            -- puede ser NULL
  IN  p_estado_cliente INT,            -- requerido por FK a T_Estado_Cliente
  OUT o_usuario_id     INT,
  OUT o_cliente_id     INT,
  OUT o_usuario_accion VARCHAR(10),    -- siempre 'CREADO'
  OUT o_cliente_accion VARCHAR(10)     -- siempre 'CREADO'
)
BEGIN
  DECLARE v_lead_nombre   VARCHAR(80);
  DECLARE v_lead_celular  VARCHAR(30);
  DECLARE v_nombre        VARCHAR(25);
  DECLARE v_apellido      VARCHAR(25);
  DECLARE v_celular       VARCHAR(25);
  DECLARE v_tipo_doc_id   INT;
  DECLARE v_td_codigo     VARCHAR(10);
  DECLARE v_tipo_cliente  INT;
  DECLARE v_razon_social  VARCHAR(150);

  DECLARE v_exists_mail   INT;
  DECLARE v_exists_cel    INT;
  DECLARE v_exists_doc    INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  /* 1) Lock y validacion del lead */
  SELECT Lead_Nombre, Lead_Celular
    INTO v_lead_nombre, v_lead_celular
  FROM T_Lead
  WHERE PK_Lead_Cod = p_lead_id
  FOR UPDATE;

  IF v_lead_nombre IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lead no existe';
  END IF;

  /* 2) Resolver/validar datos base */
  SET v_celular = COALESCE(NULLIF(p_celular,''), v_lead_celular);
  IF p_correo IS NULL OR p_correo = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Correo es obligatorio';
  END IF;
  IF v_celular IS NULL OR v_celular = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Celular es obligatorio (no esta en payload ni en el lead)';
  END IF;
  IF p_num_doc IS NULL OR p_num_doc = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Documento obligatorio para crear usuario';
  END IF;
  IF p_estado_cliente IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta p_estado_cliente (FK a T_Estado_Cliente)';
  END IF;

  SET v_nombre   = LEFT(COALESCE(NULLIF(p_nombre,''), v_lead_nombre), 25);
  SET v_apellido = LEFT(
                    COALESCE(
                      NULLIF(p_apellido,''),
                      TRIM(SUBSTRING(v_lead_nombre FROM LOCATE(' ', v_lead_nombre)+1))
                    ), 25
                  );

  /* 3) Resolver tipo de documento */
  SET v_tipo_doc_id = NULL;
  SET v_td_codigo = NULL;

  IF p_tipo_doc_id IS NOT NULL THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE PK_TD_Cod = p_tipo_doc_id
    LIMIT 1;
  ELSEIF CHAR_LENGTH(p_num_doc) = 8 THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE TD_Codigo = 'DNI'
    LIMIT 1;
  ELSEIF CHAR_LENGTH(p_num_doc) = 11 THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE TD_Codigo = 'RUC'
    LIMIT 1;
  END IF;

  IF v_tipo_doc_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de documento invalido';
  END IF;

  IF v_td_codigo = 'RUC' THEN
    SET v_tipo_cliente = 2;
    SET v_razon_social = NULLIF(TRIM(p_razon_social), '');
    IF v_razon_social IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  ELSE
    SET v_tipo_cliente = COALESCE(p_tipo_cliente, 1);
    SET v_razon_social = NULL;
  END IF;

  /* 4) Verificar que NO exista usuario (precondicion de negocio) */
  SELECT COUNT(*) INTO v_exists_mail FROM T_Usuario WHERE U_Correo = p_correo FOR UPDATE;
  IF v_exists_mail > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese correo';
  END IF;

  SELECT COUNT(*) INTO v_exists_cel FROM T_Usuario WHERE U_Celular = v_celular FOR UPDATE;
  IF v_exists_cel > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese celular';
  END IF;

  SELECT COUNT(*) INTO v_exists_doc FROM T_Usuario WHERE U_Numero_Documento = p_num_doc FOR UPDATE;
  IF v_exists_doc > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese documento';
  END IF;

  /* 5) Crear usuario */
  INSERT INTO T_Usuario
      (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
      (v_nombre, v_apellido, p_correo, NULL, v_celular, p_num_doc, v_tipo_doc_id, p_direccion);

  SET o_usuario_id     = LAST_INSERT_ID();
  SET o_usuario_accion = 'CREADO';

  /* 6) Crear cliente */
  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod, Cli_RazonSocial)
  VALUES (o_usuario_id, v_tipo_cliente, p_estado_cliente, v_razon_social);

  SET o_cliente_id     = LAST_INSERT_ID();
  SET o_cliente_accion = 'CREADO';

  /* 7) Migrar cotizaciones del lead */
  UPDATE T_Cotizacion
     SET FK_Cli_Cod  = o_cliente_id,
         FK_Lead_Cod = NULL
   WHERE FK_Lead_Cod = p_lead_id
     AND (FK_Cli_Cod IS NULL OR FK_Cli_Cod = o_cliente_id);

  COMMIT;
END
;;
DELIMITER ;
```

## sp_metodo_pago_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_metodo_pago_listar"()
BEGIN
  SELECT
    mp.PK_MP_Cod AS idMetodoPago,
    mp.MP_Nombre AS nombre
  FROM T_Metodo_Pago mp
  ORDER BY mp.PK_MP_Cod;
END
;;
DELIMITER ;
```

## sp_pedido_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_actualizar"(
  IN p_id          INT,          -- PK del pedido (PK_P_Cod)
  IN p_fk_ep       INT,          -- FK_EP_Cod (estado del pedido)
  IN p_fecha_event DATE,         -- P_Fecha_Evento (YYYY-MM-DD)
  IN p_hora_event  TIME,         -- P_Hora_Evento (HH:mm:ss)
  IN p_lugar       VARCHAR(100), -- P_Lugar
  IN p_fk_emp      INT,          -- FK_Em_Cod (empleado asignado)
  IN p_fk_esp      INT           -- FK_ESP_Cod (estado de pago)
)
BEGIN
  UPDATE T_Pedido
  SET
    FK_EP_Cod      = p_fk_ep,
    P_Fecha_Evento = p_fecha_event,
    P_Hora_Evento  = p_hora_event,
    P_Lugar        = TRIM(p_lugar),
    FK_Em_Cod      = p_fk_emp,
    FK_ESP_Cod     = p_fk_esp
  WHERE PK_P_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END
;;
DELIMITER ;
```

## sp_pedido_estado_obtener_ultimo

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_estado_obtener_ultimo"()
BEGIN
  SELECT 
    PK_EP_Cod  AS idEstadoPedido,
    EP_Nombre  AS nombre
  FROM T_Estado_Pedido
  ORDER BY PK_EP_Cod DESC
  LIMIT 1;
END
;;
DELIMITER ;
```

## sp_pedido_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar"()
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
    p.P_ViaticosMonto                                    AS viaticosMonto,
    p.P_Lugar                                            AS Lugar,

    -- Proximo evento elegido (futuro mas cercano; si no hay, el primero)
    evProx.PE_Fecha                                      AS ProxFecha,
    TIME_FORMAT(evProx.PE_Hora, '%H:%i:%s')              AS ProxHora,
    CASE DAYOFWEEK(evProx.PE_Fecha)
      WHEN 1 THEN 'dom' WHEN 2 THEN 'lun' WHEN 3 THEN 'mar'
      WHEN 4 THEN 'mie' WHEN 5 THEN 'jue' WHEN 6 THEN 'vie'
      WHEN 7 THEN 'sab' ELSE NULL
    END                                                  AS ProxDia,
    evProx.PE_Ubicacion                                  AS Ubicacion,

    -- Tipo de evento (E_Nombre) segun primer item del pedido
    (SELECT e.E_Nombre
       FROM T_PedidoServicio ps
       JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
       JOIN T_Eventos e          ON e.PK_E_Cod     = exs.PK_E_Cod
      WHERE ps.FK_P_Cod = p.PK_P_Cod
      ORDER BY ps.PK_PS_Cod
      LIMIT 1)                                           AS TipoEvento,

    -- Totales por moneda (string listo para tabla)
    (
      SELECT GROUP_CONCAT(
        CONCAT(
          t.moneda,
          ' ',
          FORMAT(t.total + COALESCE(p.P_ViaticosMonto, 0), 2)
        ) SEPARATOR ' | '
      )
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,

    -- Totales por moneda en JSON
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'moneda',
          t.moneda,
          'total',
          t.total + COALESCE(p.P_ViaticosMonto, 0)
        )
      )
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
END
;;
DELIMITER ;
```

## sp_pedido_listar_por_cliente_detalle

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar_por_cliente_detalle"(
  IN p_cliente_id INT
)
BEGIN
  IF p_cliente_id IS NULL OR p_cliente_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cliente_id debe ser mayor que cero';
  END IF;

  SELECT
    p.PK_P_Cod AS pedidoId,
    p.FK_Cli_Cod AS clienteId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.P_Nombre_Pedido AS nombrePedido,
    p.P_Observaciones AS observaciones,
    p.FK_Cot_Cod AS cotizacionId,
    ep.EP_Nombre AS estadoPedido,
    esp.ESP_Nombre AS estadoPago,
    p.FK_Em_Cod AS empleadoId,
    MAX(CONCAT_WS(' ', uEm.U_Nombre, uEm.U_Apellido)) AS empleadoNombre,
    p.P_ViaticosMonto AS viaticosMonto,
    p.P_Lugar AS lugar,
    COALESCE(sal.CostoTotal, it.totalCalculado, 0) AS total,
    COALESCE(sal.MontoAbonado, 0) AS montoAbonado,
    COALESCE(
      sal.SaldoPendiente,
      COALESCE(sal.CostoTotal, it.totalCalculado, 0) - COALESCE(sal.MontoAbonado, 0),
      0
    ) AS saldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    COALESCE(ev.cantidadEventos, 0) AS cantidadEventos,
    COALESCE(it.cantidadItems, 0) AS cantidadItems
  FROM T_Pedido p
  JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
  JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN T_Empleados em ON em.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario uEm ON uEm.PK_U_Cod = em.FK_U_Cod
  LEFT JOIN V_Pedido_Saldos sal ON sal.PedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      MIN(PE_Fecha) AS primerEventoFecha,
      MAX(PE_Fecha) AS ultimoEventoFecha,
      COUNT(*) AS cantidadEventos
    FROM T_PedidoEvento
    GROUP BY FK_P_Cod
  ) ev ON ev.pedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      COUNT(*) AS cantidadItems,
      SUM(
        COALESCE(
          PS_Subtotal,
          (COALESCE(PS_PrecioUnit,0) * COALESCE(PS_Cantidad,1))
          - COALESCE(PS_Descuento,0)
          + COALESCE(PS_Recargo,0)
        )
      ) AS totalCalculado
    FROM T_PedidoServicio
    GROUP BY FK_P_Cod
  ) it ON it.pedidoId = p.PK_P_Cod
  WHERE p.FK_Cli_Cod = p_cliente_id
  GROUP BY
    p.PK_P_Cod,
    p.FK_Cli_Cod,
    p.P_Fecha_Creacion,
    p.P_Nombre_Pedido,
    p.P_Observaciones,
    p.FK_Cot_Cod,
    ep.EP_Nombre,
    esp.ESP_Nombre,
    p.FK_Em_Cod,
    p.P_ViaticosMonto,
    p.P_Lugar,
    sal.CostoTotal,
    sal.MontoAbonado,
    sal.SaldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    ev.cantidadEventos,
    it.cantidadItems,
    it.totalCalculado
  ORDER BY p.P_Fecha_Creacion DESC;
END
;;
DELIMITER ;
```

## sp_pedido_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_obtener"(IN p_pedido_id INT)
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
    p.P_Lugar          AS lugar,
    p.P_IdTipoEvento   AS idTipoEvento,
    p.P_Dias           AS dias,
    p.P_HorasEst       AS horasEstimadas,
    p.P_ViaticosMonto  AS viaticosMonto,
    p.P_Mensaje        AS mensaje,
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

  SELECT
    psf.FK_PedServ_Cod AS idPedidoServicio,
    psf.PSF_Fecha      AS fecha
  FROM T_PedidoServicioFecha psf
  WHERE psf.FK_P_Cod = p_pedido_id
  ORDER BY psf.FK_PedServ_Cod, psf.PSF_Fecha;
END
;;
DELIMITER ;
```

## sp_pedido_obtener_siguiente_id

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_obtener_siguiente_id"()
BEGIN
  DECLARE v_next BIGINT;

  /* Opción preferida: leer el AUTO_INCREMENT real de la tabla */
  SELECT t.AUTO_INCREMENT
    INTO v_next
    FROM information_schema.TABLES t
   WHERE t.TABLE_SCHEMA = DATABASE()
     AND t.TABLE_NAME   = 'T_Pedido'     -- <<< Cambia si tu tabla tiene otro nombre
   LIMIT 1;

  /* Fallback: si por alguna razón no trajo valor, usamos MAX(id)+1 */
  IF v_next IS NULL THEN
    SELECT COALESCE(MAX(PK_Ped_Cod), 0) + 1   -- <<< Cambia PK_Ped_Cod si tu PK tiene otro nombre
      INTO v_next
      FROM T_Pedido;                          -- <<< Cambia el nombre de la tabla si aplica
  END IF;

  SELECT v_next AS nextIndex;
END
;;
DELIMITER ;
```

## sp_pedido_pago_resumen

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_pago_resumen"(IN pPedidoId INT)
BEGIN
  SELECT
    CostoTotal,
    MontoAbonado,
    SaldoPendiente
  FROM V_Pedido_Saldos
  WHERE PedidoId = pPedidoId;
END
;;
DELIMITER ;
```

## sp_pedido_saldo_listar_pagados

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pagados"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 3
  ORDER BY s.PedidoId DESC;
END
;;
DELIMITER ;
```

## sp_pedido_saldo_listar_parciales

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_parciales"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 2
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END
;;
DELIMITER ;
```

## sp_pedido_saldo_listar_pendientes

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pendientes"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 1
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END
;;
DELIMITER ;
```

## sp_proyecto_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_actualizar"(
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
END
;;
DELIMITER ;
```

## sp_proyecto_crear_desde_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_crear_desde_pedido"(
  IN p_pedido_id INT,
  IN p_responsable_id INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255)
)
BEGIN
  DECLARE v_estado_id TINYINT;
  DECLARE v_proyecto_id INT;
  DECLARE v_nombre VARCHAR(50);
  DECLARE v_fecha_inicio DATE;
  DECLARE v_fecha_fin DATE;

  IF p_pedido_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'pedidoId es requerido';
  END IF;

  IF (SELECT COUNT(*) FROM T_Proyecto WHERE FK_P_Cod = p_pedido_id) > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido ya tiene proyecto';
  END IF;

  SELECT COALESCE(NULLIF(TRIM(P_Nombre_Pedido), ''), CONCAT('Pedido ', p_pedido_id))
  INTO v_nombre
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_nombre IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido no existe';
  END IF;

  SELECT PK_EPro_Cod INTO v_estado_id
  FROM T_Estado_Proyecto
  WHERE LOWER(EPro_Nombre) = 'planificado'
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado proyecto Planificado no existe';
  END IF;

  SELECT MIN(PE_Fecha), MAX(PE_Fecha)
  INTO v_fecha_inicio, v_fecha_fin
  FROM T_PedidoEvento
  WHERE FK_P_Cod = p_pedido_id;

  START TRANSACTION;

    INSERT INTO T_Proyecto (
      Pro_Nombre,
      FK_P_Cod,
      Pro_Estado,
      FK_Em_Cod,
      EPro_Fecha_Inicio_Edicion,
      Pro_Fecha_Fin_Edicion,
      Pro_Enlace,
      Pro_Notas,
      Pro_Revision_Multimedia,
      Pro_Revision_Edicion
    ) VALUES (
      v_nombre,
      p_pedido_id,
      v_estado_id,
      p_responsable_id,
      v_fecha_inicio,
      v_fecha_fin,
      NULLIF(TRIM(p_enlace), ''),
      NULLIF(TRIM(p_notas), ''),
      NULL,
      NULL
    );

    SET v_proyecto_id = LAST_INSERT_ID();

    INSERT INTO T_ProyectoDia (FK_Pro_Cod, PD_Fecha)
    SELECT v_proyecto_id, pe.PE_Fecha
    FROM T_PedidoEvento pe
    WHERE pe.FK_P_Cod = p_pedido_id
    GROUP BY pe.PE_Fecha;

    SET @pdb_orden := 0;
    SET @pdb_fecha := NULL;

    INSERT INTO T_ProyectoDiaBloque (FK_PD_Cod, PDB_Hora, PDB_Ubicacion, PDB_Direccion, PDB_Notas, PDB_Orden)
    SELECT
      x.FK_PD_Cod,
      x.PE_Hora,
      x.PE_Ubicacion,
      x.PE_Direccion,
      x.PE_Notas,
      x.PDB_Orden
    FROM (
      SELECT
        pd.PK_PD_Cod AS FK_PD_Cod,
        pe.PE_Fecha,
        pe.PE_Hora,
        pe.PE_Ubicacion,
        pe.PE_Direccion,
        pe.PE_Notas,
        (@pdb_orden := IF(@pdb_fecha = pe.PE_Fecha, @pdb_orden + 1, 1)) AS PDB_Orden,
        (@pdb_fecha := pe.PE_Fecha) AS _set_fecha
      FROM T_PedidoEvento pe
      JOIN T_ProyectoDia pd
        ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = pe.PE_Fecha
      WHERE pe.FK_P_Cod = p_pedido_id
      ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod
    ) x;

    INSERT IGNORE INTO T_ProyectoDiaServicio (FK_PD_Cod, FK_PS_Cod)
    SELECT
      pd.PK_PD_Cod,
      psf.FK_PedServ_Cod
    FROM T_PedidoServicioFecha psf
    JOIN T_ProyectoDia pd
      ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = psf.PSF_Fecha
    WHERE psf.FK_P_Cod = p_pedido_id;

  COMMIT;

  SELECT v_proyecto_id AS proyectoId;
END
;;
DELIMITER ;
```

## sp_proyecto_disponibilidad

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_disponibilidad"(
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE,
  IN p_proyecto_id  INT,
  IN p_tipo_equipo  INT,
  IN p_cargo_id     INT
)
BEGIN
  IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaInicio y fechaFin son requeridos';
  END IF;
  IF p_fecha_fin < p_fecha_inicio THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaFin no puede ser menor a fechaInicio';
  END IF;

  /* Empleados operativos y activos */
  SELECT
    em.PK_Em_Cod           AS empleadoId,
    u.PK_U_Cod             AS usuarioId,
    u.U_Nombre             AS nombre,
    u.U_Apellido           AS apellido,
    te.PK_Tipo_Emp_Cod     AS cargoId,
    te.TiEm_Cargo          AS cargo,
    em.FK_Estado_Emp_Cod   AS estadoId,
    ee.EsEm_Nombre         AS estado,
    te.TiEm_OperativoCampo AS operativoCampo,
    IF(conf.conflictos IS NULL, 1, 0)                 AS disponible,
    COALESCE(conf.conflictos, JSON_ARRAY())           AS conflictos
  FROM T_Empleados em
  JOIN T_Usuario u            ON u.PK_U_Cod         = em.FK_U_Cod
  JOIN T_Tipo_Empleado te     ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
  LEFT JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = em.FK_Estado_Emp_Cod
  LEFT JOIN (
    SELECT
      pde.FK_Em_Cod AS empleadoId,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'proyectoId',  pd.FK_Pro_Cod,
          'fecha',       pd.PD_Fecha,
          'estado',      pde.PDE_Estado
        )
      ) AS conflictos
    FROM T_ProyectoDiaEmpleado pde
    JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
    WHERE (pde.PDE_Estado IS NULL OR pde.PDE_Estado NOT IN ('Cancelado', 'Anulado'))
      AND pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)
    GROUP BY pde.FK_Em_Cod
  ) conf ON conf.empleadoId = em.PK_Em_Cod
  WHERE te.TiEm_OperativoCampo = 1
    AND em.FK_Estado_Emp_Cod = 1
    AND (p_cargo_id IS NULL OR te.PK_Tipo_Emp_Cod = p_cargo_id)
  ORDER BY disponible DESC, te.TiEm_Cargo, u.U_Nombre, u.U_Apellido;

  /* Equipos */
  SELECT
    eq.PK_Eq_Cod     AS idEquipo,
    eq.Eq_Fecha_Ingreso AS fechaIngreso,
    eq.Eq_Serie      AS serie,
    mo.PK_IMo_Cod    AS idModelo,
    mo.NMo_Nombre    AS nombreModelo,
    ma.PK_IMa_Cod    AS idMarca,
    ma.NMa_Nombre    AS nombreMarca,
    teq.PK_TE_Cod    AS idTipoEquipo,
    teq.TE_Nombre    AS nombreTipoEquipo,
    eq.FK_EE_Cod     AS idEstado,
    eeq.EE_Nombre    AS nombreEstado,
    IF(confEq.conflictos IS NULL, 1, 0)       AS disponible,
    COALESCE(confEq.conflictos, JSON_ARRAY()) AS conflictos
  FROM T_Equipo eq
  JOIN T_Modelo mo       ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Marca  ma       ON ma.PK_IMa_Cod = mo.FK_IMa_Cod
  JOIN T_Tipo_Equipo teq ON teq.PK_TE_Cod = mo.FK_TE_Cod
  JOIN T_Estado_Equipo eeq ON eeq.PK_EE_Cod = eq.FK_EE_Cod
  LEFT JOIN (
    SELECT
      pdq.FK_Eq_Cod AS equipoId,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'proyectoId',  pd.FK_Pro_Cod,
          'fecha',       pd.PD_Fecha,
          'estado',      pdq.PDQ_Estado
        )
      ) AS conflictos
    FROM T_ProyectoDiaEquipo pdq
    JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
    WHERE (pdq.PDQ_Estado IS NULL OR pdq.PDQ_Estado NOT IN ('Cancelado', 'Anulado'))
      AND pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)
    GROUP BY pdq.FK_Eq_Cod
  ) confEq ON confEq.equipoId = eq.PK_Eq_Cod
  WHERE eeq.EE_Nombre = 'Disponible'
    AND (p_tipo_equipo IS NULL OR teq.PK_TE_Cod = p_tipo_equipo)
  ORDER BY disponible DESC, teq.TE_Nombre, mo.NMo_Nombre, eq.PK_Eq_Cod;
END
;;
DELIMITER ;
```

## sp_proyecto_eliminar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_eliminar"(IN p_id INT)
BEGIN
  DELETE FROM T_Proyecto WHERE PK_Pro_Cod = p_id;
  SELECT ROW_COUNT() AS rowsAffected;
END
;;
DELIMITER ;
```

## sp_proyecto_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_listar"()
BEGIN
  SELECT
    pr.PK_Pro_Cod              AS proyectoId,
    pr.Pro_Nombre              AS proyectoNombre,
    pr.FK_P_Cod                AS pedidoId,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion   AS fechaFinEdicion,
    pr.Pro_Estado              AS estadoId,
    ep.EPro_Nombre             AS estadoNombre,
    pr.FK_Em_Cod               AS responsableId,
    pr.Pro_Notas               AS notas,
    pr.Pro_Enlace              AS enlace,
    pr.Pro_Revision_Multimedia AS multimedia,
    pr.Pro_Revision_Edicion    AS edicion,
    pr.created_at              AS createdAt,
    pr.updated_at              AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  ORDER BY pr.PK_Pro_Cod DESC;
END
;;
DELIMITER ;
```

## sp_proyecto_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_obtener"(IN p_id INT)
BEGIN
  -- 1) Proyecto (cabecera)
  SELECT
    pr.PK_Pro_Cod              AS proyectoId,
    pr.Pro_Nombre              AS proyectoNombre,
    pr.FK_P_Cod                AS pedidoId,
    pr.Pro_Estado              AS estadoId,
    ep.EPro_Nombre             AS estadoNombre,
    pr.FK_Em_Cod               AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion   AS fechaFinEdicion,
    pr.Pro_Revision_Edicion    AS edicion,
    pr.Pro_Revision_Multimedia AS multimedia,
    pr.Pro_Enlace              AS enlace,
    pr.Pro_Notas               AS notas,
    pr.created_at              AS createdAt,
    pr.updated_at              AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  LEFT JOIN T_Empleados em       ON em.PK_Em_Cod   = pr.FK_Em_Cod
  LEFT JOIN T_Usuario u          ON u.PK_U_Cod     = em.FK_U_Cod
  WHERE pr.PK_Pro_Cod = p_id;

  -- 2) Dias del proyecto (con estado)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.FK_Pro_Cod AS proyectoId,
    pd.PD_Fecha AS fecha,
    pd.FK_EPD_Cod AS estadoDiaId,
    epd.EPD_Nombre AS estadoDiaNombre
  FROM T_ProyectoDia pd
  LEFT JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pd.PK_PD_Cod;

  -- 3) Bloques (locaciones/horas) por dia
  SELECT
    pdb.PK_PDB_Cod AS bloqueId,
    pdb.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdb.PDB_Hora AS hora,
    pdb.PDB_Ubicacion AS ubicacion,
    pdb.PDB_Direccion AS direccion,
    pdb.PDB_Notas AS notas,
    pdb.PDB_Orden AS orden
  FROM T_ProyectoDiaBloque pdb
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdb.FK_PD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdb.PDB_Orden, pdb.PK_PDB_Cod;

  -- 4) Servicios por dia
  SELECT
    pds.PK_PDS_Cod AS id,
    pds.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ps.PK_PS_Cod AS pedidoServicioId,
    ps.FK_ExS_Cod AS eventoServicioId,
    ps.PS_Nombre AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad AS cantidad,
    ps.PS_Descuento AS descuento,
    ps.PS_Recargo AS recargo,
    ps.PS_Subtotal AS subtotal
  FROM T_ProyectoDiaServicio pds
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pds.FK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, ps.PS_Nombre, ps.PK_PS_Cod;

  -- 5) Empleados asignados por dia
  SELECT
    pde.PK_PDE_Cod AS asignacionId,
    pde.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pde.FK_Em_Cod AS empleadoId,
    CONCAT(u2.U_Nombre, ' ', u2.U_Apellido) AS empleadoNombre,
    pde.PDE_Estado AS estado,
    pde.PDE_Notas AS notas
  FROM T_ProyectoDiaEmpleado pde
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
  JOIN T_Empleados em2 ON em2.PK_Em_Cod = pde.FK_Em_Cod
  JOIN T_Usuario u2 ON u2.PK_U_Cod = em2.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pde.PK_PDE_Cod;

  -- 6) Equipos asignados por dia (con responsable opcional)
  SELECT
    pdq.PK_PDQ_Cod AS asignacionId,
    pdq.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdq.FK_Eq_Cod AS equipoId,
    eq.Eq_Serie AS equipoSerie,
    mo.NMo_Nombre AS modelo,
    te.TE_Nombre AS tipoEquipo,
    eq.FK_EE_Cod AS estadoEquipoId,
    pdq.FK_Em_Cod AS responsableId,
    CONCAT(u3.U_Nombre, ' ', u3.U_Apellido) AS responsableNombre,
    pdq.PDQ_Estado AS estado,
    pdq.PDQ_Notas AS notas,
    pdq.PDQ_Devuelto AS devuelto,
    pdq.PDQ_Fecha_Devolucion AS fechaDevolucion,
    pdq.PDQ_Estado_Devolucion AS estadoDevolucion,
    pdq.PDQ_Notas_Devolucion AS notasDevolucion,
    pdq.PDQ_Usuario_Devolucion AS usuarioDevolucion
  FROM T_ProyectoDiaEquipo pdq
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
  JOIN T_Equipo eq ON eq.PK_Eq_Cod = pdq.FK_Eq_Cod
  JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
  LEFT JOIN T_Empleados em3 ON em3.PK_Em_Cod = pdq.FK_Em_Cod
  LEFT JOIN T_Usuario u3 ON u3.PK_U_Cod = em3.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdq.PK_PDQ_Cod;

  -- 7) Requerimientos de personal por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ess.Staff_Rol AS rol,
    SUM(ess.Staff_Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioStaff ess ON ess.FK_ExS_Cod = exs.PK_ExS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, ess.Staff_Rol
  ORDER BY pd.PD_Fecha, ess.Staff_Rol;

  -- 8) Requerimientos de equipo por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    te.PK_TE_Cod AS tipoEquipoId,
    te.TE_Nombre AS tipoEquipoNombre,
    SUM(ese.Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioEquipo ese ON ese.FK_ExS_Cod = exs.PK_ExS_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = ese.FK_TE_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, te.PK_TE_Cod, te.TE_Nombre
  ORDER BY pd.PD_Fecha, te.TE_Nombre;
END
;;
DELIMITER ;
```

## sp_servicio_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_servicio_listar"()
BEGIN
  /* Ajusta los nombres de columnas si difieren en tu DB */
  SELECT 
    s.PK_S_Cod   AS id,
    s.S_Nombre   AS nombre
  FROM T_Servicios s
  ORDER BY s.S_Nombre;
END
;;
DELIMITER ;
```

## sp_voucher_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_crear"(
  IN p_monto         DECIMAL(10,2),
  IN p_metodoPago    INT,
  IN p_estadoVoucher INT,
  IN p_imagen        LONGBLOB,
  IN p_idPedido      INT,
  IN p_fecha         DATETIME,
  IN p_mime          VARCHAR(100),
  IN p_nombre        VARCHAR(255),
  IN p_size          INT
)
BEGIN
  INSERT INTO T_Voucher(
    Pa_Monto_Depositado,
    FK_MP_Cod,
    FK_EV_Cod,
    Pa_Imagen_Voucher,
    FK_P_Cod,
    Pa_Fecha,
    Pa_Imagen_Mime,
    Pa_Imagen_NombreOriginal,
    Pa_Imagen_Size
  )
  VALUES (
    p_monto,
    p_metodoPago,
    p_estadoVoucher,
    p_imagen,
    p_idPedido,
    p_fecha,
    p_mime,
    p_nombre,
    p_size
  );

  SELECT LAST_INSERT_ID() AS idVoucher;
END
;;
DELIMITER ;
```

## sp_voucher_estado_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_estado_listar"()
BEGIN
  SELECT
    v.PK_Pa_Cod   AS idVoucher,
    ev.PK_EV_Cod  AS idEstado,
    ev.EV_Nombre  AS nombre
  FROM T_Voucher v
  INNER JOIN T_Estado_voucher ev
          ON ev.PK_EV_Cod = v.FK_EV_Cod
  ORDER BY v.PK_Pa_Cod ASC;
END
;;
DELIMITER ;
```

## sp_voucher_listar_por_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_por_pedido"(IN p_idPedido INT)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS idVoucher,
    v.FK_P_Cod             AS idPedido,
    v.Pa_Monto_Depositado  AS monto,
    v.FK_MP_Cod            AS idMetodoPago,
    mp.MP_Nombre           AS metodoPago,
    v.FK_EV_Cod            AS idEstado,
    ev.EV_Nombre           AS estado,
    v.Pa_Imagen_Voucher    AS imagen
  FROM T_Voucher v
  LEFT JOIN T_Metodo_Pago     mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher  ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = p_idPedido
  ORDER BY v.PK_Pa_Cod DESC;
END
;;
DELIMITER ;
```

## sp_voucher_listar_por_pedido_detalle

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_por_pedido_detalle"(
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
END
;;
DELIMITER ;
```

## sp_voucher_listar_ultimos_por_estado

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_ultimos_por_estado"(IN p_idEstado INT)
BEGIN
  /* último voucher por pedido */
  WITH ult AS (
    SELECT
      v.FK_P_Cod              AS idPedido,
      MAX(v.PK_Pa_Cod)        AS idVoucherUlt
    FROM T_Voucher v
    GROUP BY v.FK_P_Cod
  )
  SELECT
    p.PK_P_Cod               AS idPedido,
    v.PK_Pa_Cod              AS idVoucher,
    v.Pa_Monto_Depositado    AS monto,
    v.FK_MP_Cod              AS idMetodoPago,
    mp.MP_Nombre             AS metodoPago,
    v.FK_EV_Cod              AS idEstado,
    ev.EV_Nombre             AS estado
  FROM ult
  JOIN T_Voucher v           ON v.PK_Pa_Cod = ult.idVoucherUlt
  JOIN T_Pedido  p           ON p.PK_P_Cod  = ult.idPedido
  LEFT JOIN T_Metodo_Pago mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_EV_Cod = p_idEstado
  ORDER BY p.PK_P_Cod DESC;
END
;;
DELIMITER ;
```

## sp_voucher_obtener_por_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_obtener_por_pedido"(IN p_idPedido INT)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS idVoucher,
    v.FK_P_Cod             AS idPedido,
    v.Pa_Monto_Depositado  AS monto,
    v.FK_MP_Cod            AS idMetodoPago,
    mp.MP_Nombre           AS metodoPago,
    v.FK_EV_Cod            AS idEstado,
    ev.EV_Nombre           AS estado,
    v.Pa_Imagen_Voucher    AS imagen
  FROM T_Voucher v
  LEFT JOIN T_Metodo_Pago     mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher  ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = p_idPedido
    AND v.PK_Pa_Cod = (
      SELECT MAX(v2.PK_Pa_Cod) FROM T_Voucher v2 WHERE v2.FK_P_Cod = p_idPedido
    );
END
;;
DELIMITER ;
```

