-- Actualiza SP para incluir serviciosFechas en el JSON de detalle
DELIMITER $$
DROP PROCEDURE IF EXISTS `sp_cotizacion_obtener_json`$$
CREATE DEFINER=`avnadmin`@`%` PROCEDURE `sp_cotizacion_obtener_json`(
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

            -- Persona contacto (usuario)
            'nombreContacto',  CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            -- (compatibilidad) si aún usas "contacto.nombre" en frontend/otros
            'nombre',          CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            -- Empresa
            'razonSocial',     cli.Cli_RazonSocial,

            -- Documento (para decidir si es RUC)
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
        'mensaje',        c.Cot_Mensaje,
        'estado',         ec.ECot_Nombre,
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
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u   ON u.PK_U_Cod = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

END$$
DELIMITER ;
