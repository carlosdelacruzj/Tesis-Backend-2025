# Stored Procedures en uso

## 1. sp_proyecto_asignacion_personal_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_asignacion_personal_crear"(
  IN p_proyecto INT,       -- FK_Pro_Cod
  IN p_empleado INT,       -- FK_Em_Cod
  IN p_equipo   VARCHAR(10) -- FK_Eq_Cod (PK de T_Equipo es VARCHAR(10))
)
BEGIN
  -- Validaciones para devolver errores claros
  IF NOT EXISTS (SELECT 1 FROM T_Proyecto WHERE PK_Pro_Cod = p_proyecto) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Proyecto no existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM T_Empleados WHERE PK_Em_Cod = p_empleado) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM T_Equipo WHERE PK_Eq_Cod = TRIM(p_equipo)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipo no existe';
  END IF;

  INSERT INTO T_RecursosxProyecto (FK_Pro_Cod, FK_Em_Cod, FK_Eq_Cod)
  VALUES (p_proyecto, p_empleado, TRIM(p_equipo));

  SELECT LAST_INSERT_ID() AS asignacionId;
END ;;
DELIMITER ;
```

## 2. sp_cliente_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_crear"(
  IN p_nombre    VARCHAR(100),
  IN p_apellido  VARCHAR(100),
  IN p_correo    VARCHAR(120),
  IN p_numDoc    VARCHAR(32),
  IN p_celular   VARCHAR(32),
  IN p_direccion VARCHAR(200),
  IN p_contrasena_hash VARCHAR(255) -- bcrypt/argon2 ya generado
)
BEGIN
  DECLARE v_user_id BIGINT;

  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), p_contrasena_hash, TRIM(p_celular), TRIM(p_numDoc), TRIM(p_direccion));

  SET v_user_id = LAST_INSERT_ID();

  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod)
  VALUES (v_user_id, 1, 1);
END ;;
DELIMITER ;
```

## 3. sp_empleado_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_crear"(
  IN p_nombre     VARCHAR(100),
  IN p_apellido   VARCHAR(100),
  IN p_correo     VARCHAR(120),
  IN p_celular    VARCHAR(32),
  IN p_doc        VARCHAR(32),
  IN p_direccion  VARCHAR(200),
  IN p_autonomo   TINYINT,  -- 1=SI, 0=NO (lo mapeamos a VARCHAR)
  IN p_cargo      INT       -- FK_Tipo_Emp_Cod (1..N en T_Tipo_Empleado)
)
BEGIN
  -- 1) Crear usuario base
  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), NULL, TRIM(p_celular), TRIM(p_doc), TRIM(p_direccion));

  SET @v_user_id := LAST_INSERT_ID();

  -- 2) Crear empleado (mapear 0/1 -> 'NO'/'SI')
  INSERT INTO T_Empleados (FK_U_Cod, Em_Autonomo, FK_Tipo_Emp_Cod)
  VALUES (@v_user_id, IF(p_autonomo=1,'SI','NO'), p_cargo);

  -- (Opcional) devolver los IDs creados
  SELECT @v_user_id AS userId, LAST_INSERT_ID() AS empleadoId;
END ;;
DELIMITER ;
```

## 4. sp_evento_servicio_crear

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

    IF EXISTS (
        SELECT 1
        FROM T_EventoServicio
        WHERE PK_E_Cod = p_evento
          AND PK_S_Cod = p_servicio
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_SERVICIO_DUPLICADO';
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
END ;;
DELIMITER ;
```

## 5. sp_proyecto_crear

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_crear"(
  IN p_nombre VARCHAR(50),
  IN p_fk_pedido INT,
  IN p_fecha_inicio DATE     -- YYYY-MM-DD
)
BEGIN
  INSERT INTO T_Proyecto (Pro_Nombre, FK_P_Cod, EPro_Fecha_Inicio_Edicion)
  VALUES (TRIM(p_nombre), p_fk_pedido, p_fecha_inicio);

  SELECT LAST_INSERT_ID() AS proyectoId;
END ;;
DELIMITER ;
```

## 6. sp_voucher_crear

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
END ;;
DELIMITER ;
```

## 7. sp_proyecto_asignacion_personal_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_asignacion_personal_actualizar"(
  IN p_id       INT,          -- PK_RxP_Cod
  IN p_empleado INT,          -- FK_Em_Cod
  IN p_equipo   VARCHAR(10)   -- FK_Eq_Cod
)
BEGIN
  DECLARE v_equipo VARCHAR(10);
  SET v_equipo = TRIM(p_equipo);

  IF NOT EXISTS (SELECT 1 FROM T_RecursosxProyecto WHERE PK_RxP_Cod = p_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Asignación no existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM T_Empleados WHERE PK_Em_Cod = p_empleado) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Empleado no existe';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM T_Equipo WHERE PK_Eq_Cod = v_equipo) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipo no existe';
  END IF;

  UPDATE T_RecursosxProyecto
  SET FK_Em_Cod = p_empleado,
      FK_Eq_Cod = v_equipo
  WHERE PK_RxP_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END ;;
DELIMITER ;
```

## 8. sp_evento_servicio_actualizar

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

    IF EXISTS (
        SELECT 1
        FROM T_EventoServicio
        WHERE PK_E_Cod = v_evento
          AND PK_S_Cod = v_servicio
          AND PK_ExS_Cod <> p_id
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_SERVICIO_DUPLICADO';
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
END ;;
DELIMITER ;
```

## 9. sp_pedido_actualizar

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
END ;;
DELIMITER ;
```

## 10. sp_cliente_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_actualizar"(
  IN pIdCliente INT,
  IN pCorreo    VARCHAR(25),
  IN pCelular   VARCHAR(25),
  IN pDireccion VARCHAR(100)
)
BEGIN
  DECLARE vUserId INT;

  SELECT FK_U_Cod INTO vUserId
  FROM T_Cliente
  WHERE PK_Cli_Cod = pIdCliente;

  IF vUserId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe';
  END IF;

  UPDATE T_Usuario
     SET U_Correo    = COALESCE(pCorreo,    U_Correo),
         U_Celular   = COALESCE(pCelular,   U_Celular),
         U_Direccion = COALESCE(pDireccion, U_Direccion)
   WHERE PK_U_Cod = vUserId;

  -- Devuelve el cliente actualizado
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
    c.Cli_Tipo_Cliente                         AS tipoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  WHERE c.PK_Cli_Cod = pIdCliente;
END ;;
DELIMITER ;
```

## 11. sp_empleado_actualizar

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
END ;;
DELIMITER ;
```

## 12. sp_proyecto_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_actualizar"(
  IN p_finFecha   VARCHAR(32),   -- acepto ISO o 'YYYY-MM-DD'
  IN p_multimedia INT,
  IN p_edicion    INT,
  IN p_enlace     VARCHAR(255),
  IN p_id         INT
)
BEGIN
  UPDATE T_Proyecto
  SET
    Pro_Fecha_Fin_Edicion   = STR_TO_DATE(LEFT(p_finFecha,10), '%Y-%m-%d'),
    Pro_Revision_Multimedia = p_multimedia,
    Pro_Revision_Edicion    = p_edicion,
    Pro_Enlace              = TRIM(p_enlace)
  WHERE PK_Pro_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END ;;
DELIMITER ;
```

## 13. sp_pedido_listar_contratados

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar_contratados"()
BEGIN
  SELECT
    p.PK_P_Cod           AS pedidoId,
    ep.EP_Nombre         AS estadoPedido,      -- debería ser "Contratado"
    es.ExS_Descripcion   AS eventoServicio,
    p.FK_Cli_Cod         AS clienteId,
    u.U_Nombre           AS clienteNombre,
    u.U_Apellido         AS clienteApellido,
    pag.ESP_Nombre       AS estadoPago,
    p.P_Fecha_Creacion   AS fechaCreacion,
    p.P_Fecha_Evento     AS fechaEvento,
    p.P_Hora_Evento      AS horaEvento,
    p.FK_Em_Cod          AS empleadoId,
    ue.U_Nombre          AS empleadoNombre,
    p.P_Lugar            AS lugar
  FROM T_Pedido p
  JOIN T_Estado_Pedido    ep  ON ep.PK_EP_Cod    = p.FK_EP_Cod
  JOIN T_EventoServicio   es  ON es.PK_ExS_Cod   = p.FK_ExS_Cod
  JOIN T_Cliente          c   ON c.PK_Cli_Cod    = p.FK_Cli_Cod
  JOIN T_Usuario          u   ON u.PK_U_Cod      = c.FK_U_Cod
  JOIN T_Estado_Pago      pag ON pag.PK_ESP_Cod  = p.FK_ESP_Cod
  JOIN T_Empleados        e   ON e.PK_Em_Cod     = p.FK_Em_Cod
  JOIN T_Usuario          ue  ON ue.PK_U_Cod     = e.FK_U_Cod
  WHERE ep.EP_Nombre = 'Contratado'
  ORDER BY p.PK_P_Cod DESC;
END ;;
DELIMITER ;
```

## 14. sp_voucher_listar_ultimos_por_estado

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
END ;;
DELIMITER ;
```

## 15. sp_proyecto_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_listar"()
BEGIN
  SELECT
    p.PK_Pro_Cod  AS proyectoId,
    p.Pro_Nombre  AS nombre,
    p.FK_P_Cod    AS pedidoId,
    p.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    p.Pro_Fecha_Fin_Edicion     AS fechaFinEdicion,
    p.Pro_Revision_Edicion      AS revisionEdicion,
    p.Pro_Revision_Multimedia   AS revisionMultimedia,
    p.Pro_Enlace AS enlace
  FROM T_Proyecto p
  ORDER BY p.PK_Pro_Cod DESC;
END ;;
DELIMITER ;
```

## 16. sp_servicio_listar

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
END ;;
DELIMITER ;
```

## 17. sp_evento_servicio_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_listar"(
    IN p_evento INT,    -- NULL => sin filtro por evento
    IN p_serv   INT     -- NULL => sin filtro por servicio
)
BEGIN
    SELECT
        es.PK_ExS_Cod        AS idEventoServicio,
        es.ExS_Titulo        AS titulo,
        es.FK_ESC_Cod        AS categoriaId,
        cat.ESC_Nombre       AS categoriaNombre,
        es.ExS_EsAddon       AS esAddon,
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
    JOIN T_Eventos   e ON e.PK_E_Cod = es.PK_E_Cod
    JOIN T_Servicios s ON s.PK_S_Cod = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat
           ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    WHERE (p_evento IS NULL OR es.PK_E_Cod = p_evento)
      AND (p_serv   IS NULL OR es.PK_S_Cod = p_serv)
    ORDER BY e.PK_E_Cod, s.PK_S_Cod;
END ;;
DELIMITER ;
```

## 18. sp_voucher_listar_por_pedido

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
END ;;
DELIMITER ;
```

## 19. sp_proyecto_asignacion_personal_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_asignacion_personal_obtener"(IN p_proyecto_id INT)
BEGIN
  SELECT
    rxp.PK_RxP_Cod          AS asignacionId,
    rxp.FK_Pro_Cod          AS proyectoId,
    pr.Pro_Nombre           AS proyecto,
    rxp.FK_Em_Cod           AS empleadoId,
    u.U_Nombre              AS empleadoNombre,
    rxp.FK_Eq_Cod           AS equipoId
  FROM T_RecursosxProyecto rxp
  JOIN T_Proyecto  pr ON pr.PK_Pro_Cod = rxp.FK_Pro_Cod
  JOIN T_Empleados em ON em.PK_Em_Cod = rxp.FK_Em_Cod
  JOIN T_Usuario   u  ON u.PK_U_Cod   = em.FK_U_Cod
  WHERE rxp.FK_Pro_Cod = p_proyecto_id
  ORDER BY rxp.PK_RxP_Cod DESC;
END ;;
DELIMITER ;
```

## 20. sp_cliente_obtener

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
    c.Cli_Tipo_Cliente                         AS tipoCliente,
    ec.ECli_Nombre                             AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u         ON u.PK_U_Cod     = c.FK_U_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  WHERE c.PK_Cli_Cod = pId;
END ;;
DELIMITER ;
```

## 21. sp_pedido_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_obtener"(IN p_pedido_id INT)
BEGIN
  /*
    Devuelve 3 result sets:
      #1 Cabecera del pedido (con datos de cliente y empleado)
      #2 Eventos del pedido (T_PedidoEvento)
      #3 Items/paquetes (T_PedidoServicio con snapshot)
  */

  DECLARE v_exists INT DEFAULT 0;

  -- Validar existencia
  SELECT COUNT(*) INTO v_exists
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pedido no encontrado';
  END IF;

  /* =======================
     #1 CABECERA DEL PEDIDO
     ======================= */
  SELECT
    p.PK_P_Cod         AS id,
    p.FK_Cli_Cod       AS clienteId,
    p.FK_Em_Cod        AS empleadoId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.FK_EP_Cod        AS estadoPedidoId,
    p.FK_ESP_Cod       AS estadoPagoId,
    p.P_FechaEvento    AS fechaEvento,
    /* Si tienes observaciones/nota en T_Pedido cámbialo aquí */
    p.P_Observaciones               AS observaciones,
	p.P_Nombre_Pedido   AS nombrePedido,
    /* Datos del cliente (usuario del cliente) */
    u.U_Numero_Documento AS clienteDocumento,
    u.U_Nombre           AS clienteNombres,
    u.U_Apellido         AS clienteApellidos,
    u.U_Celular           AS clienteCelular,
    u.U_Correo            AS clienteCorreo,
    u.U_Direccion         AS clienteDireccion,

    /* Datos del empleado (si aplica) */
    ue.U_Nombre        AS empleadoNombres,
    ue.U_Apellido      AS empleadoApellidos
  FROM T_Pedido p
  JOIN T_Cliente c   ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u   ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_Empleados e ON e.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario  ue ON ue.PK_U_Cod = e.FK_U_Cod
  WHERE p.PK_P_Cod = p_pedido_id;

  /* =======================
     #2 EVENTOS DEL PEDIDO
     ======================= */
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

  /* =======================
     #3 ITEMS / PAQUETES
     ======================= */
  SELECT
    ps.PK_PS_Cod     AS id,
    ps.FK_P_Cod      AS pedidoId,
    ps.FK_PE_Cod     AS eventoCodigo,
    ps.FK_ExS_Cod    AS exsId,
    ps.PS_Nombre     AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda     AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad   AS cantidad,
    ps.PS_Descuento  AS descuento,
    ps.PS_Recargo    AS recargo,
    ps.PS_Notas      AS notas
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = p_pedido_id
  ORDER BY ps.PK_PS_Cod;
END ;;
DELIMITER ;
```

## 22. sp_proyecto_obtener

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_obtener"(IN p_id INT)
BEGIN
  /* Básico: solo datos del proyecto */
  SELECT
    pr.PK_Pro_Cod                AS proyectoId,
    pr.Pro_Nombre                AS nombre,
    pr.FK_P_Cod                  AS pedidoId,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion     AS fechaFinEdicion,
    pr.Pro_Revision_Edicion      AS revisionEdicion,
    pr.Pro_Revision_Multimedia   AS revisionMultimedia,
    pr.Pro_Enlace                AS enlace
  FROM T_Proyecto pr
  WHERE pr.PK_Pro_Cod = p_id;

END ;;
DELIMITER ;
```

## 23. sp_cliente_buscar_por_documento

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
END ;;
DELIMITER ;
```

## 24. sp_empleado_obtener

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
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u          ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te   ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  WHERE e.PK_Em_Cod = p_id
  LIMIT 1;
END ;;
DELIMITER ;
```

## 25. sp_evento_servicio_obtener

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
        es.ExS_EsAddon       AS esAddon,
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
    JOIN T_Eventos   e ON e.PK_E_Cod  = es.PK_E_Cod
    JOIN T_Servicios s ON s.PK_S_Cod  = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat
           ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    WHERE es.PK_ExS_Cod = p_id;
END ;;
DELIMITER ;
```

## 26. sp_pedido_obtener_siguiente_id

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
END ;;
DELIMITER ;
```

## 27. sp_pedido_estado_obtener_ultimo

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
END ;;
DELIMITER ;
```

## 28. sp_pedido_saldo_listar_pagados

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pagados"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 3           -- Pagado
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;
```

## 29. sp_pedido_saldo_listar_parciales

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_parciales"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 2           -- Parcial
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;
```



## 30. sp_pedido_saldo_listar_pendientes

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pendientes"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 1           -- Pendiente
    AND s.EstadoPedidoId <> 6        -- no Cancelado (opcional)
  ORDER BY s.PedidoId DESC;
END ;;
DELIMITER ;
```

## 31. sp_pedido_pago_resumen

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
END ;;
DELIMITER ;
```

## 32. sp_voucher_obtener_por_pedido

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
END ;;
DELIMITER ;
```

## 33. sp_voucher_listar_por_pedido_detalle

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_por_pedido_detalle"(IN pPedidoId INT)
BEGIN
  SELECT 
    v.PK_Pa_Cod            AS Codigo,
    IFNULL(v.Pa_Fecha, NOW()) AS Fecha,       -- Agrega Pa_Fecha si no la tienes
    v.Pa_Monto_Depositado  AS Monto,
    mp.MP_Nombre           AS MetodoPago,
    v.Pa_Imagen_Voucher    AS Link
  FROM T_Voucher v
  JOIN T_Metodo_Pago mp    ON mp.PK_MP_Cod = v.FK_MP_Cod
  JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = pPedidoId
  ORDER BY v.PK_Pa_Cod DESC;
END ;;
DELIMITER ;
```

## 34. sp_lead_convertir_cliente

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_lead_convertir_cliente"(
  IN  p_lead_id        INT,
  IN  p_correo         VARCHAR(250),   -- obligatorio
  IN  p_celular        VARCHAR(25),    -- si viene vacío se usa el del lead
  IN  p_nombre         VARCHAR(25),    -- opcional
  IN  p_apellido       VARCHAR(25),    -- opcional
  IN  p_num_doc        VARCHAR(11),    -- OBLIGATORIO (8 u 11 dígitos) para crear usuario
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

  DECLARE v_exists_mail   INT;
  DECLARE v_exists_cel    INT;
  DECLARE v_exists_doc    INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  /* 1) Lock y validación del lead */
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
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Celular es obligatorio (no está en payload ni en el lead)';
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

  /* 3) Verificar que NO exista usuario (esta es precondición de negocio) */
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

  /* 4) Crear usuario (siempre) */
  INSERT INTO T_Usuario
      (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, U_Direccion)
  VALUES
      (v_nombre, v_apellido, p_correo, NULL, v_celular, p_num_doc, p_direccion);

  SET o_usuario_id     = LAST_INSERT_ID();
  SET o_usuario_accion = 'CREADO';

  /* 5) Crear cliente (siempre) */
  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod)
  VALUES (o_usuario_id, p_tipo_cliente, p_estado_cliente);

  SET o_cliente_id     = LAST_INSERT_ID();
  SET o_cliente_accion = 'CREADO';

  /* 6) Migrar cotizaciones de ese lead al nuevo cliente */
  UPDATE T_Cotizacion
     SET FK_Cli_Cod  = o_cliente_id,
         FK_Lead_Cod = NULL
   WHERE FK_Lead_Cod = p_lead_id
     AND (FK_Cli_Cod IS NULL OR FK_Cli_Cod = o_cliente_id);

  COMMIT;
END ;;
DELIMITER ;
```

## 35. sp_pedido_listar_por_cliente_detalle

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
    sal.CostoTotal,
    sal.MontoAbonado,
    sal.SaldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    ev.cantidadEventos,
    it.cantidadItems,
    it.totalCalculado
  ORDER BY p.P_Fecha_Creacion DESC;
END ;;
DELIMITER ;
```

## 36. sp_cliente_autocompletar

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

  -- token1 = primera palabra; token2 = resto (todo lo que viene después de la 1ra palabra)
  SET v_t1 = NULL;
  SET v_t2 = NULL;
  IF v_q_norm IS NOT NULL THEN
    SET v_t1 = NULLIF(TRIM(SUBSTRING_INDEX(v_q_norm, ' ', 1)), '');
    SET v_t2 = NULLIF(TRIM(SUBSTRING(v_q_norm, LENGTH(SUBSTRING_INDEX(v_q_norm, ' ', 1)) + 2)), '');
  END IF;

  -- Límite seguro
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
      CAST(NULL AS CHAR)   AS direccion
    WHERE 1=0;

  ELSEIF v_t2 IS NOT NULL THEN
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      u.U_Nombre   AS nombre,
      u.U_Apellido AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      90 AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    WHERE
      (u.U_Nombre  LIKE CONCAT(v_t1, '%')
       AND u.U_Apellido LIKE CONCAT(v_t2, '%'))
      -- Si quisieras permitir también el concatenado explícito (equivalente):
      -- OR CONCAT(u.U_Nombre, ' ', u.U_Apellido) LIKE CONCAT(v_t1, ' ', v_t2, '%')
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;

  ELSE
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      u.U_Nombre   AS nombre,
      u.U_Apellido AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      (CASE
         WHEN u.U_Numero_Documento = v_q_norm OR u.U_Correo = v_q_norm OR u.U_Celular = v_q_norm THEN 100
         WHEN u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR u.U_Celular LIKE CONCAT(v_t1, '%') THEN 70
         WHEN u.U_Nombre LIKE CONCAT(v_t1, '%') OR u.U_Apellido LIKE CONCAT(v_t1, '%') THEN 55
         ELSE 0
       END) AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    WHERE
      u.U_Numero_Documento = v_q_norm OR
      u.U_Correo = v_q_norm OR
      u.U_Celular = v_q_norm OR
      u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR
      u.U_Celular          LIKE CONCAT(v_t1, '%') OR
      u.U_Nombre           LIKE CONCAT(v_t1, '%') OR
      u.U_Apellido         LIKE CONCAT(v_t1, '%')
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;
  END IF;
END ;;
DELIMITER ;
```

## 37. sp_cotizacion_admin_actualizar

```sql
DELIMITER ;;
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

  -- Update parcial de cabecera
  UPDATE defaultdb.T_Cotizacion
  SET Cot_TipoEvento   = COALESCE(p_tipo_evento,    Cot_TipoEvento),
      Cot_IdTipoEvento = COALESCE(p_id_tipo_evento, Cot_IdTipoEvento),
      Cot_FechaEvento  = COALESCE(p_fecha_evento,   Cot_FechaEvento),
      Cot_Lugar        = COALESCE(p_lugar,          Cot_Lugar),
      Cot_HorasEst     = COALESCE(p_horas_est,      Cot_HorasEst),
      Cot_Mensaje      = COALESCE(p_mensaje,        Cot_Mensaje),
      Cot_Estado       = COALESCE(p_estado,         Cot_Estado)
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
END ;;
DELIMITER ;
```

## 38. sp_cotizacion_estado_actualizar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_estado_actualizar"(
  IN p_cot_id           INT,
  IN p_estado_nuevo     VARCHAR(20),   -- Borrador|Enviada|Aceptada|Rechazada
  IN p_estado_esperado  VARCHAR(20)    -- NULL = sin concurrencia optimista
)
BEGIN
  DECLARE v_estado_actual VARCHAR(20);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- leer + lock
  SELECT Cot_Estado INTO v_estado_actual
  FROM defaultdb.T_Cotizacion
  WHERE PK_Cot_Cod = p_cot_id
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

  -- update
  UPDATE defaultdb.T_Cotizacion
  SET Cot_Estado = p_estado_nuevo
  WHERE PK_Cot_Cod = p_cot_id;

  -- devolver JSON de detalle (lead o cliente)
  SELECT JSON_OBJECT(
    'id',              c.PK_Cot_Cod,
    'estado',          c.Cot_Estado,
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
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli  ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u    ON u.PK_U_Cod = cli.FK_U_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

  COMMIT;
END ;;
DELIMITER ;
```

## 39. sp_cotizacion_admin_crear_v3

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
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),    -- 'Borrador' | 'Enviada' (opcional)

  IN p_items_json      JSON,           -- array de ítems
  IN p_eventos_json    JSON            -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }
)
BEGIN
  DECLARE v_lead_id INT DEFAULT NULL;
  DECLARE v_cli_id  INT DEFAULT NULL;
  DECLARE v_cot_id  INT DEFAULT NULL;

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

  /* 2) Cabecera */
  INSERT INTO defaultdb.T_Cotizacion(
    FK_Lead_Cod, FK_Cli_Cod,
    Cot_TipoEvento, Cot_IdTipoEvento, Cot_FechaEvento,
    Cot_Lugar, Cot_HorasEst, Cot_Mensaje, Cot_Estado
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
    COALESCE(p_estado, 'Borrador')
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
END ;;
DELIMITER ;
```

## 40. sp_cotizacion_publica_crear

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
  IN p_mensaje        VARCHAR(500)
)
BEGIN
  DECLARE v_lead_id INT;
  DECLARE v_cot_id  INT;

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

  CALL defaultdb.sp_int_cotizacion_insertar(
    v_lead_id, p_tipo_evento, p_id_tipo_evento, p_fecha_evento,
    p_lugar, p_horas_est, p_mensaje, 'Borrador', v_cot_id
  );

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END ;;
DELIMITER ;
```

## 41. sp_cotizacion_listar_general

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
      c.Cot_Estado         AS estado,
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
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u   ON u.PK_U_Cod    = cli.FK_U_Cod
  ORDER BY c.PK_Cot_Cod DESC;
END ;;
DELIMITER ;
```

## 42. sp_cotizacion_convertir_a_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_convertir_a_pedido"(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,    -- FK_Em_Cod responsable del pedido
  IN  p_nombre_pedido VARCHAR(225),  -- opcional; si NULL se autogenera
  OUT o_pedido_id     INT
)
BEGIN
  DECLARE v_fk_cli      INT;
  DECLARE v_fk_lead     INT;
  DECLARE v_tipo_evento VARCHAR(40);
  DECLARE v_fecha_ev    DATE;
  DECLARE v_lugar       VARCHAR(150);
  DECLARE v_estado      VARCHAR(20);
  DECLARE v_nombre      VARCHAR(225);
  DECLARE v_exists_mig  INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- 1) Leer cotización y bloquearla
  SELECT FK_Cli_Cod, Cot_TipoEvento, Cot_FechaEvento, Cot_Lugar, Cot_Estado
    INTO v_fk_cli,   v_tipo_evento, v_fecha_ev,    v_lugar,   v_estado
  FROM T_Cotizacion
  WHERE PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotización no encontrada';
  END IF;

  -- 2) Validar estado
  IF v_estado <> 'Aceptada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden migrar cotizaciones en estado Aceptada';
  END IF;

  -- 3) Resolver cliente (si viene de lead)
  IF v_fk_cli IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotización no tiene cliente ni lead asociado';
  END IF;

  -- 4) Nombre de pedido
  SET v_nombre = COALESCE(p_nombre_pedido,
                          CONCAT(COALESCE(v_tipo_evento,'Evento'),
                                 ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, CURDATE()), '%Y-%m-%d'),
                                 COALESCE(CONCAT(' - ', v_lugar), '')
                          ));

  -- 5) Insertar Pedido
  INSERT INTO T_Pedido
    (FK_EP_Cod,FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones, FK_Em_Cod, P_Nombre_Pedido,P_FechaEvento)
  VALUES
    (1,  p_cot_id, v_fk_cli,   1,   CURDATE(),        CONCAT('Origen: Cotización #', p_cot_id), p_empleado_id, v_nombre,v_fecha_ev);

  SET o_pedido_id = LAST_INSERT_ID();

  /* ==========================================================
     6) Insertar líneas 
  */
  INSERT INTO T_PedidoServicio
    (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_Nombre, PS_Descripcion, PS_Moneda, PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas)
  SELECT
    o_pedido_id,
    cs.FK_ExS_Cod,
    NULL,
    cs.cs_Nombre,
    cs.cs_Descripcion,
    cs.cs_Moneda,
    cs.cs_PrecioUnit,
    cs.cs_Cantidad,
	cs.cs_Descuento,
    cs.cs_Recargo,
    cs.cs_Notas
  FROM T_CotizacionServicio cs
  WHERE cs.FK_Cot_Cod = p_cot_id;



  COMMIT;
END ;;
DELIMITER ;
```

## 43. sp_cotizacion_obtener_json

```sql
DELIMITER ;;
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
        'estado',         c.Cot_Estado,
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
                   'filmMin',              s.CS_FilmMin
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
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli  ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u    ON u.PK_U_Cod = cli.FK_U_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;
END ;;
DELIMITER ;
```

## 44. sp_proyecto_asignacion_personal_eliminar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_asignacion_personal_eliminar"(IN p_id INT)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM T_RecursosxProyecto WHERE PK_RxP_Cod = p_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Asignación no existe';
  END IF;

  DELETE FROM T_RecursosxProyecto
  WHERE PK_RxP_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END ;;
DELIMITER ;
```

## 45. sp_proyecto_asignacion_personal_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_asignacion_personal_listar"()
BEGIN
  SELECT
    rxp.PK_RxP_Cod          AS asignacionId,
    rxp.FK_Pro_Cod          AS proyectoId,
    pr.Pro_Nombre           AS proyecto,
    rxp.FK_Em_Cod           AS empleadoId,
    u.U_Nombre              AS empleadoNombre,
    rxp.FK_Eq_Cod           AS equipoId,
    te.PK_Eq_Cod            AS equipoCodigo
  FROM T_RecursosxProyecto rxp
  JOIN T_Proyecto   pr  ON pr.PK_Pro_Cod  = rxp.FK_Pro_Cod     -- Proyecto  
  JOIN T_Empleados  em  ON em.PK_Em_Cod  = rxp.FK_Em_Cod      -- Empleado  
  JOIN T_Usuario    u   ON u.PK_U_Cod    = em.FK_U_Cod         -- Nombre del empleado  
  JOIN T_Equipo     te  ON te.PK_Eq_Cod  = rxp.FK_Eq_Cod       -- Equipo    
  ORDER BY rxp.PK_RxP_Cod DESC;
END ;;
DELIMITER ;
```

## 46. sp_empleado_cargo_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_cargo_listar"()
BEGIN
  SELECT
    te.PK_Tipo_Emp_Cod AS idCargo,
    te.TiEm_Cargo     AS cargoNombre
  FROM T_Tipo_Empleado te
  ORDER BY te.TiEm_Cargo;
END ;;
DELIMITER ;
```

## 47. sp_cliente_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_listar"()
BEGIN
  -- ajusta tu sp_cliente_listar
SELECT
  c.PK_Cli_Cod AS idCliente,                           -- usar en rutas/trackBy
  CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,  -- mostrar si quieres
  u.U_Nombre  AS nombre,
  u.U_Apellido AS apellido,
  u.U_Correo  AS correo,
  u.U_Celular AS celular,
  u.U_Numero_Documento AS doc,
  u.U_Direccion AS direccion
FROM T_Cliente c
JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
ORDER BY c.PK_Cli_Cod;

END ;;
DELIMITER ;
```

## 48. sp_contrato_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_contrato_listar"()
BEGIN
  SELECT
    c.* 
    -- Si luego quieres enriquecer con joins, algo como:
    -- , cli.U_Nombre  AS clienteNombre
    -- , pro.P_Nombre  AS proyectoNombre
  FROM T_Contrato c
  -- LEFT JOIN T_Cliente  cli ON cli.PK_Cl_Cod = c.FK_Cl_Cod
  -- LEFT JOIN T_Proyecto pro ON pro.PK_Pro_Cod = c.FK_Pro_Cod
  ORDER BY c.PK_Cont_Cod ASC;   -- Ajusta la PK si tu esquema usa otro nombre
END ;;
DELIMITER ;
```

## 49. sp_contrato_listar_por_pedido

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_contrato_listar_por_pedido"(
  IN p_pedido INT  -- ID del pedido
)
BEGIN
  /* Devuelve todos los contratos asociados al pedido indicado */
  SELECT
    c.*
  FROM T_Contrato c
  WHERE c.FK_P_Cod = p_pedido
  ORDER BY c.PK_Cont_Cod DESC;  -- ajusta si tu PK/orden es distinto
END ;;
DELIMITER ;
```

## 50. sp_empleado_listar

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
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u         ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  ORDER BY e.PK_Em_Cod;
END ;;
DELIMITER ;
```

## 51. sp_empleado_listar_disponibles

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_listar_disponibles"(IN p_idProyecto INT)
BEGIN
  /* Empleados que NO están asignados al proyecto p_idProyecto */
  SELECT
    e.PK_Em_Cod              AS idEmpleado,
    u.PK_U_Cod               AS idUsuario,
    u.U_Nombre               AS nombre,
    u.U_Apellido             AS apellido,
    u.U_Celular              AS celular,
    e.Em_Autonomo            AS autonomo,
    e.FK_Tipo_Emp_Cod        AS idTipoEmpleado
  FROM T_Empleados e
  JOIN T_Usuario   u ON u.PK_U_Cod = e.FK_U_Cod
  WHERE NOT EXISTS (
    SELECT 1
    FROM T_RecursosxProyecto rxp
    WHERE rxp.FK_Pro_Cod = p_idProyecto
      AND rxp.FK_Em_Cod  = e.PK_Em_Cod
  )
  ORDER BY u.U_Nombre, u.U_Apellido;
END ;;
DELIMITER ;
```

## 52. sp_empleado_listar_catalogo

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_listar_catalogo"()
BEGIN
  SELECT
    e.PK_Em_Cod      AS idEmpleado,
    u.PK_U_Cod       AS idUsuario,
    u.U_Nombre       AS nombre,
    u.U_Apellido     AS apellido,
    u.U_Correo       AS correo,
    u.U_Celular      AS celular,
    u.U_Numero_Documento AS documento,
    u.U_Direccion    AS direccion,
    e.Em_Autonomo    AS autonomo,          -- 'SI' / 'NO'
    e.FK_Tipo_Emp_Cod AS idCargo
  FROM T_Empleados e
  JOIN T_Usuario   u ON u.PK_U_Cod = e.FK_U_Cod
  ORDER BY e.PK_Em_Cod;
END ;;
DELIMITER ;
```

## 53. sp_equipo_listar_filtrados

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_equipo_listar_filtrados"(
  IN p_fecha DATE,        -- opcional (por ahora no se usa)
  IN p_proyecto INT,      -- opcional: si llega, trae solo equipos asignados a ese proyecto
  IN p_idTipoEquipo INT   -- opcional: filtra por tipo de equipo
)
BEGIN
  SELECT
    eq.PK_Eq_Cod    AS equipoCodigo,   -- código del equipo (VARCHAR)
    eq.FK_TE_Cod    AS tipoId,         -- FK al tipo (INT)
    te.TE_Nombre    AS tipoNombre,
    mo.NMo_Nombre   AS modelo,
    ma.NMa_Nombre   AS marca
  FROM T_Equipo eq
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
  JOIN T_Modelo      mo ON mo.PK_IMo_Cod  = te.FK_IMo_Cod
  JOIN T_Marca       ma ON ma.PK_IMA_Cod = mo.FK_IMA_Cod
  WHERE (p_idTipoEquipo IS NULL OR eq.FK_TE_Cod = p_idTipoEquipo)
    AND (
      p_proyecto IS NULL
      OR EXISTS (
          SELECT 1
          FROM T_RecursosxProyecto rxp
          WHERE rxp.FK_Pro_Cod = p_proyecto
            AND rxp.FK_Eq_Cod  = eq.PK_Eq_Cod
      )
    )
  ORDER BY eq.PK_Eq_Cod;
END ;;
DELIMITER ;
```

## 54. sp_voucher_estado_listar

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
END ;;
DELIMITER ;
```

## 55. sp_evento_listar

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
END ;;
DELIMITER ;
```

## 56. sp_proyecto_evento_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_evento_listar"(IN p_proyecto INT)
BEGIN
  /*
    Devuelve el evento/servicio asociado al proyecto
    p_proyecto = PK_Pro_Cod (T_Proyecto)
  */
  SELECT
      pr.PK_Pro_Cod                        AS proyectoId,
      pr.Pro_Nombre                        AS proyectoNombre,
      p.PK_P_Cod                           AS pedidoId,
      es.PK_ExS_Cod                        AS eventoServicioId,
      ev.E_Nombre                          AS evento,
      sv.S_Nombre                          AS servicio,
      es.ExS_Precio                        AS precio,
      es.ExS_Descripcion                   AS descripcion
  FROM T_Proyecto         pr
  JOIN T_Pedido           p   ON p.PK_P_Cod    = pr.FK_P_Cod
  JOIN T_EventoServicio   es  ON es.PK_ExS_Cod = p.FK_ExS_Cod
  JOIN T_Eventos          ev  ON ev.PK_E_Cod   = es.PK_E_Cod
  JOIN T_Servicios        sv  ON sv.PK_S_Cod   = es.PK_S_Cod
  WHERE pr.PK_Pro_Cod = p_proyecto;
END ;;
DELIMITER ;
```

## 57. sp_metodo_pago_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_metodo_pago_listar"()
BEGIN
  SELECT
    mp.PK_MP_Cod AS idMetodoPago,
    mp.MP_Nombre AS nombre
  FROM T_Metodo_Pago mp
  ORDER BY mp.PK_MP_Cod;
END ;;
DELIMITER ;
```

## 58. sp_pedido_listar

```sql
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar"()
BEGIN
  /*
    Lista de pedidos para vista de gestión.
    - ID: PK del pedido
    - Cliente / Documento: desde T_Usuario/T_Cliente
    - Creado: fecha de creación del pedido
    - Próximo evento (si hay futuro >= NOW(); si no, el primero por fecha/hora):
        ProxFecha, ProxHora (HH:mm:ss), ProxDia (lun, mar, ...)
      Si el pedido no tiene eventos, quedan NULL.
    - Ubicacion: del próximo evento (si existe)
    - Eventos: cantidad total de eventos
    - Servicio: primer ítem (si existe) como referencia
    - TotalLabel: totales por moneda "PEN 3,500.00 | USD 200.00"
    - TotalesJSON: misma info en JSON (por si lo usas luego)
    - Estado / Pago: nombres (si existen tablas de catálogo)
    - ResponsableId: ID del empleado (puedes mostrarlo o mapearlo a nombre aparte)
  */

  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)             AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,

    -- Próximo evento elegido (futuro más cercano; si no hay, el primero)
    evProx.PE_Fecha                                      AS ProxFecha,
    TIME_FORMAT(evProx.PE_Hora, '%H:%i:%s')              AS ProxHora,
    CASE DAYOFWEEK(evProx.PE_Fecha)
      WHEN 1 THEN 'dom' WHEN 2 THEN 'lun' WHEN 3 THEN 'mar'
      WHEN 4 THEN 'mié' WHEN 5 THEN 'jue' WHEN 6 THEN 'vie'
      WHEN 7 THEN 'sáb' ELSE NULL
    END                                                  AS ProxDia,
    evProx.PE_Ubicacion                                  AS Ubicacion,
    -- Tipo de evento (E_Nombre) segun primer ítem del pedido
    (SELECT e.E_Nombre
       FROM T_PedidoServicio ps
       JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
       JOIN T_Eventos e          ON e.PK_E_Cod     = exs.PK_E_Cod
      WHERE ps.FK_P_Cod = p.PK_P_Cod
      ORDER BY ps.PK_PS_Cod
      LIMIT 1)                                           AS TipoEvento,

    -- Totales por moneda (string listo para tabla)
    (
      SELECT GROUP_CONCAT(CONCAT(t.moneda, ' ', FORMAT(t.total, 2)) SEPARATOR ' | ')
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,

    -- Totales por moneda en JSON (útil si luego quieres chips por moneda)
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
  LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod  = p.FK_EP_Cod     -- <- quítalo si no existe
  LEFT JOIN T_Estado_Pago  esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod   -- <- quítalo si no existe

  -- Elegir el "próximo" evento por PK (subselects correlacionados)
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
```
