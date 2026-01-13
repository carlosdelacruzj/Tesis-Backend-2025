-- Fase 11: actualizar SPs de cliente para razon social y tipoDocumentoId
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_cliente_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cliente_crear`(
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
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cliente_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cliente_listar`()
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
    c.Cli_RazonSocial AS razonSocial,
    c.Cli_Tipo_Cliente AS tipoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  ORDER BY c.PK_Cli_Cod;
END ;;
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_cliente_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cliente_obtener`(IN pId INT)
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
    c.Cli_RazonSocial                          AS razonSocial,
    ec.ECli_Nombre                             AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u         ON u.PK_U_Cod     = c.FK_U_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  WHERE c.PK_Cli_Cod = pId;
END ;;
DELIMITER ;
