-- Fase 22: cotizaciones listar devuelve razon social si el cliente es RUC
-- Ejecuta este script una sola vez en la BD.

DROP PROCEDURE IF EXISTS `sp_cotizacion_listar_general`;
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
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod

  ORDER BY c.PK_Cot_Cod DESC;

END ;;
DELIMITER ;
