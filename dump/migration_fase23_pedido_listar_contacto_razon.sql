-- Fase 23: pedidos listar devuelve razon social si el cliente es RUC
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_pedido_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE `sp_pedido_listar`()
BEGIN
  /*
    Lista de pedidos para vista de gestion.
    - ID: PK del pedido
    - Cliente / Documento: desde T_Usuario/T_Cliente
    - Creado: fecha de creacion del pedido
    - Proximo evento (si hay futuro >= NOW(); si no, el primero por fecha/hora):
        ProxFecha, ProxHora (HH:mm:ss), ProxDia (lun, mar, ...)
      Si el pedido no tiene eventos, quedan NULL.
    - Ubicacion: del proximo evento (si existe)
    - Eventos: cantidad total de eventos
    - Servicio: primer item (si existe) como referencia
    - TotalLabel: totales por moneda "PEN 3,500.00 | USD 200.00"
    - TotalesJSON: misma info en JSON (por si lo usas luego)
    - Estado / Pago: nombres (si existen tablas de catalogo)
    - ResponsableId: ID del empleado (puedes mostrarlo o mapearlo a nombre aparte)
  */

  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)
    END                                                  AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,

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
      SELECT GROUP_CONCAT(CONCAT(t.moneda, ' ', FORMAT(t.total, 2)) SEPARATOR ' | ')
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,

    -- Totales por moneda en JSON (util si luego quieres chips por moneda)
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

  -- Elegir el "proximo" evento por PK (subselects correlacionados)
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
