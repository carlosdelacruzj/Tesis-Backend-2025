-- Fase 24: pedido obtener devuelve razon social si cliente es RUC
-- Ejecuta este script una sola vez en la BD.

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
