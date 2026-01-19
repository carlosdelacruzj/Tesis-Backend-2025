-- Fase 21: ajustar conversion de lead a cliente (tipo documento + razon social)
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_lead_convertir_cliente`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_lead_convertir_cliente`(
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
END ;;
DELIMITER ;
