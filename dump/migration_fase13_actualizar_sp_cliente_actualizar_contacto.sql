-- Fase 13: actualizar SP de cliente para editar contacto y razon social
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_cliente_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_cliente_actualizar`(
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
END ;;
DELIMITER ;
