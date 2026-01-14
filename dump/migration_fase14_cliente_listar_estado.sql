-- Fase 14: agregar estado en listado de clientes
-- Ejecuta este script una sola vez en la BD.

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
END ;;
DELIMITER ;
