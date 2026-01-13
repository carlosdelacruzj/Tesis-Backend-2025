/**
 * @swagger
 * components:
 *   schemas:
 *     # ===================== ITEMS (estructura cruda del SP) =====================
 *     CotizacionItemSP:
 *       type: object
 *       description: "Salida directa del SP; incluye CS_EventoId y CS_ServicioId como referencias opcionales."
 *       properties:
 *         idCotizacionServicio: { type: integer, example: 2 }
 *         idEventoServicio:     { type: integer, example: 13 }
 *         eventoId:             { type: integer, nullable: true, example: 1, description: "ID del evento referenciado (solo informativo)" }
 *         servicioId:           { type: integer, nullable: true, example: 7, description: "ID del servicio referenciado (solo informativo)" }
 *         nombre:               { type: string, example: "Video Trailer" }
 *         descripcion:          { type: string, nullable: true, example: "Trailer cinematogrÃ¡fico" }
 *         moneda:               { type: string, example: "USD" }
 *         precioUnit:           { type: number, format: float, example: 350.0 }
 *         cantidad:             { type: number, format: float, example: 1.0 }
 *         descuento:            { type: number, format: float, example: 0.0 }
 *         recargo:              { type: number, format: float, example: 0.0 }
 *         subtotal:             { type: number, format: float, example: 350.0 }
 *         notas:                { type: string, nullable: true, example: null }
 *         horas:                { type: number, format: float, nullable: true, example: 2.0 }
 *         personal:             { type: integer, nullable: true, example: 1 }
 *         fotosImpresas:        { type: integer, nullable: true, example: null }
 *         trailerMin:           { type: integer, nullable: true, example: 2 }
 *         filmMin:              { type: integer, nullable: true, example: 0 }
 *         eventoServicio:
 *           type: object
 *           nullable: true
 *           properties:
 *             id:             { type: integer, example: 13 }
 *             servicioId:     { type: integer, example: 3 }
 *             servicioNombre: { type: string, example: "Fotografía Premium" }
 *             eventoId:       { type: integer, example: 1 }
 *             eventoNombre:   { type: string, example: "Boda" }
 *             categoriaId:    { type: integer, nullable: true, example: 2 }
*             categoriaNombre: { type: string, nullable: true, example: "Paquetes Deluxe" }
 *             categoriaTipo:  { type: string, nullable: true, example: "PAQUETE" }
 *             titulo:         { type: string, example: "Cobertura Completa" }
 *             esAddon:        { type: integer, enum: [0,1], example: 0 }
 *             precio:         { type: number, format: float, nullable: true, example: 1200.0 }
 *             descripcion:    { type: string, nullable: true, example: "Incluye álbum." }
 *             horas:          { type: number, format: float, nullable: true, example: 8.0 }
 *             fotosImpresas:  { type: integer, nullable: true, example: 30 }
 *             trailerMin:     { type: integer, nullable: true, example: 2 }
 *             filmMin:        { type: integer, nullable: true, example: 0 }
 *             staff:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rol:      { type: string, example: "Fotógrafo" }
 *                   cantidad: { type: integer, example: 2 }
 *             equipos:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipoEquipoId: { type: integer, example: 3 }
 *                   tipoEquipo:   { type: string, example: "Cámara DSLR" }
 *                   cantidad:     { type: integer, example: 2 }
 *                   notas:        { type: string, nullable: true, example: "Baterías extra" }
 *
 *     CotizacionEventoInput:
 *       type: object
 *       required: [fecha]
 *       description: Fecha y ubicaciÃ³n opcional asociada a la cotizaciÃ³n.
 *       properties:
 *         fecha:      { type: string, format: date, example: "2025-11-15" }
 *         hora:       { type: string, format: time, nullable: true, example: "18:00:00" }
 *         ubicacion:  { type: string, nullable: true, example: "Hotel Central" }
 *         direccion:  { type: string, nullable: true, example: "Av. Principal 123" }
 *         notas:      { type: string, nullable: true, example: "Ingreso por lobby" }
 *
 *     # ===================== DETALLE (estructura cruda del SP) =====================
 *     CotizacionDetailSP:
 *       type: object
 *       properties:
 *         idCotizacion: { type: integer, example: 1 }
 *         lead:
 *           type: object
 *           properties:
 *             idlead:    { type: integer, example: 1 }
 *             nombre:    { type: string, example: "carlos" }
 *             celular:   { type: string, example: "999663047" }
 *             origen:    { type: string, example: "Tiktok" }
 *             fechaCrea: { type: string, format: date, example: "2025-10-10" }
 *         cotizacion:
 *           type: object
 *           properties:
 *             tipoEvento:     { type: string, example: "Boda" }
 *             idTipoEvento:   { type: integer, example: 1 }
 *             fechaEvento:    { type: string, format: date, example: "2025-10-20" }
 *             lugar:          { type: string, example: "Cusco - Catedral" }
 *             horasEstimadas: { type: number, format: float, example: 8.0 }
 *             mensaje:        { type: string, example: "Agregar paquete premium" }
*             estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada, Expirada], example: "Enviada" }
 *             total:          { type: number, format: float, example: 1150.0 }
 *             fechaCreacion:  { type: string, format: date, example: "2025-10-10" }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/CotizacionItemSP' }
 *         eventos:
 *           type: array
 *           description: "Fechas y ubicaciones calendarizadas para la cotizaciÃ³n."
 *           items:
 *             type: object
 *             properties:
 *               id:        { type: integer, example: 5 }
 *               fecha:     { type: string, format: date, example: "2025-11-15" }
 *               hora:      { type: string, format: time, nullable: true, example: "18:00:00" }
 *               ubicacion: { type: string, nullable: true, example: "Hotel Central" }
 *               direccion: { type: string, nullable: true, example: "Av. Principal 123" }
 *               notas:     { type: string, nullable: true, example: "Ingreso por lobby" }
 *       example:
 *         idCotizacion: 1
 *         lead:
 *           idlead: 1
 *           nombre: "carlos"
 *           origen: "Tiktok"
 *           celular: "999663047"
 *           fechaCrea: "2025-10-10"
 *         cotizacion:
 *           tipoEvento: "Boda"
 *           idTipoEvento: 1
 *           fechaEvento: "2025-10-20"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: 8.0
 *           mensaje: "Agregar paquete premium"
 *           estado: "Enviada"
 *           total: 1150.0
 *           fechaCreacion: "2025-10-10"
 *         items:
 *           - idCotizacionServicio: 1
 *             idEventoServicio: 11
 *             eventoId: 1
 *             servicioId: 7
 *             nombre: "Cobertura Fotografía"
 *             descripcion: "SesiÃ³n completa con Ã¡lbum"
 *             moneda: "USD"
 *             precioUnit: 800.0
 *             cantidad: 1.0
 *             descuento: 0.0
 *             recargo: 0.0
 *             subtotal: 800.0
 *             notas: "Incluye sesiÃ³n pre-boda"
 *             horas: 6.0
 *             personal: 2
 *             fotosImpresas: 20
 *             trailerMin: 0
 *             filmMin: 0
 *             eventoServicio:
 *               id: 11
 *               servicioNombre: "Fotografía Premium"
 *               eventoNombre: "Boda"
 *               categoriaNombre: "Paquetes Deluxe"
 *               staff:
 *                 - rol: "Fotógrafo"
 *                   cantidad: 2
 *               equipos:
 *                 - tipoEquipo: "Cámara DSLR"
 *                   cantidad: 2
 *           - idCotizacionServicio: 2
 *             idEventoServicio: 13
 *             eventoId: 2
 *             servicioId: 8
 *             nombre: "Video Trailer"
 *             descripcion: "Trailer cinematogrÃ¡fico"
 *             moneda: "USD"
 *             precioUnit: 350.0
 *             cantidad: 1.0
 *             descuento: 0.0
 *             recargo: 0.0
 *             subtotal: 350.0
 *             notas: null
 *             horas: 2.0
 *             personal: 1
 *             fotosImpresas: null
 *             trailerMin: 2
 *             filmMin: 0
 *         eventos:
 *           - id: 9
 *             fecha: "2025-11-15"
 *             hora: "18:00:00"
 *             ubicacion: "Hotel Central"
 *             direccion: "Av. Principal 123"
 *             notas: "Ingreso por lobby"
 *           - id: 10
 *             fecha: "2025-11-16"
 *             hora: "12:00:00"
 *             ubicacion: "Sesion en estudio"
 *             direccion: "Calle 5 #222"
 *             notas: null
 *
 *     # ===================== LISTADO (ACTUALIZADO SOLO LO NECESARIO) =====================
 *     CotizacionListItem:
 *       type: object
 *       properties:
 *         id:             { type: integer, description: "ID unificado de cotizaciÃ³n (mapeado desde idCotizacion)" }
*         estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada, Expirada] }
 *         fechaCreacion:  { type: string, format: date-time, description: "YYYY-MM-DD HH:mm:ss" }
 *         eventoId:       { type: integer, nullable: true, example: 1, description: "Mapeado desde idTipoEvento" }
 *         tipoEvento:     { type: string }
 *         fechaEvento:    { type: string, format: date, nullable: true }
 *         lugar:          { type: string, nullable: true }
 *         horasEstimadas: { type: number, format: float, nullable: true }
 *         mensaje:        { type: string, nullable: true }
 *         total:          { type: number, format: float, nullable: true, example: 1150 }
 *         contacto:
 *           type: object
 *           properties:
 *             id:      { type: integer, nullable: true, description: "Si CLIENTE: clienteId; si LEAD: leadId" }
 *             origen:  { type: string, enum: [CLIENTE, LEAD] }
 *             nombre:  { type: string, nullable: true }
 *             celular: { type: string, nullable: true }
 *
*     CotizacionList:
*       type: array
*       items: { $ref: '#/components/schemas/CotizacionListItem' }
*       example:
*         - id: 42
*           estado: "Borrador"
*           fechaCreacion: "2025-10-12 09:30:00"
*           eventoId: 1
*           tipoEvento: "Boda"
*           fechaEvento: "2025-10-20"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: 8
 *           mensaje: "Paquete premium"
 *           total: 1150
 *           contacto:
 *             id: 101
 *             origen: "CLIENTE"
 *             nombre: "Ana PÃ©rez"
 *             celular: "999888777"
*         - id: 41
*           estado: "Enviada"
*           fechaCreacion: "2025-10-11 14:15:00"
*           eventoId: 2
*           tipoEvento: "CumpleaÃ±os"
*           fechaEvento: "2025-10-25"
 *           lugar: "Miraflores"
 *           horasEstimadas: 6
 *           mensaje: "Agregar trailer"
 *           total: 4600
 *           contacto:
 *             id: 55
 *             origen: "LEAD"
 *             nombre: "Carlos"
*             celular: "999663047"
*
 *     # ===================== MIGRACIÃ“N A PEDIDO =====================
 *     CotizacionMigrarPedidoRequest:
 *       type: object
 *       required: [empleadoId]
 *       properties:
 *         empleadoId:   { type: integer, example: 7 }
 *         nombrePedido: { type: string, nullable: true, example: "Boda Ana & Luis" }
 *
 *     CotizacionMigrarPedidoResponse:
 *       type: object
 *       properties:
 *         pedidoId:
 *           type: integer
 *           nullable: true
 *           example: 120
 *           description: "ID del pedido generado por el SP"
 *
*     # ===================== REQUESTS (public/admin) =====================
*     CotizacionCreatePublic:
 *       type: object
 *       required: [lead, cotizacion]
 *       properties:
 *         lead:
 *           type: object
 *           required: [nombre]
 *           properties:
 *             nombre:  { type: string, example: "Ana" }
 *             celular: { type: string, example: "999888777" }
 *             origen:  { type: string, example: "Web" }
 *         cotizacion:
 *           type: object
 *           required: [tipoEvento]
 *           properties:
 *             idTipoEvento:   { type: integer, nullable: true, example: 1 }
 *             tipoEvento:     { type: string, example: "Boda" }
 *             fechaEvento:    { type: string, format: date, example: "2025-10-20" }
 *             lugar:          { type: string, example: "Cusco" }
 *             horasEstimadas: { type: number, format: float, example: 8 }
 *             mensaje:        { type: string, example: "Cobertura bÃ¡sica" }
 *
 *     # ===================== (ACTUALIZADO) CREATE ADMIN (v3 compatible) =====================
 *     CotizacionCreateAdmin:
 *       type: object
 *       required: [cotizacion]
 *       description: |
 *         Prioriza **cliente**: si `cliente.id > 0`, no se crea lead.
 *         Si no se envÃ­a `cliente.id`, se crearÃ¡ un **lead** con los datos de `lead`.
 *         Nuevo: en cada item puedes enviar opcionalmente `eventoId` y `servicioId`; se guardan solo como referencia.
 *       properties:
 *         cliente:
 *           type: object
 *           properties:
 *             id: { type: integer, nullable: true, example: 101 }
 *         lead:
 *           type: object
 *           properties:
 *             nombre:  { type: string, nullable: true, example: "Carlos" }
 *             celular: { type: string, nullable: true, example: "999663047" }
 *             origen:  { type: string, nullable: true, example: "Backoffice" }
 *         cotizacion:
 *           type: object
 *           required: [tipoEvento]
 *           properties:
 *             idTipoEvento:   { type: integer, nullable: true, example: 1 }
 *             tipoEvento:     { type: string, example: "Boda" }
 *             fechaEvento:    { type: string, format: date, example: "2025-10-20" }
 *             lugar:          { type: string, example: "Cusco - Catedral" }
 *             horasEstimadas: { type: number, format: float, example: 8 }
 *             mensaje:        { type: string, example: "Paquete premium" }
 *             estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada], example: "Borrador" }
 *         items:
 *           type: array
 *           description: "Ãtems con claves en UI; el backend los normaliza al JSON del SP"
 *           items:
 *             type: object
 *             properties:
 *               idEventoServicio: { type: integer, nullable: true, example: 11 }
 *               eventoId:         { type: integer, nullable: true, example: 1, description: "ID del evento asociado (solo informativo)" }
 *               servicioId:       { type: integer, nullable: true, example: 7, description: "ID del servicio asociado (solo informativo)" }
 *               titulo:           { type: string, example: "Cobertura FotografÃ­a" }
 *               descripcion:      { type: string, nullable: true, example: "SesiÃ³n completa con Ã¡lbum" }
 *               moneda:           { type: string, example: "USD" }
 *               precioUnitario:   { type: number, format: float, example: 800 }
 *               cantidad:         { type: number, format: float, example: 1 }
 *               notas:            { type: string, nullable: true, example: "Incluye preboda" }
 *               horas:            { type: number, format: float, nullable: true, example: 6 }
 *               personal:         { type: integer, nullable: true, example: 2 }
 *               fotosImpresas:    { type: integer, nullable: true, example: 20 }
 *               trailerMin:       { type: integer, nullable: true, example: 0 }
 *               filmMin:          { type: integer, nullable: true, example: 0 }
 *         eventos:
 *           type: array
 *           description: "Fechas y ubicaciones asociadas a la cotizaciÃ³n."
 *           items: { $ref: '#/components/schemas/CotizacionEventoInput' }
 *           example:
 *             - fecha: "2025-11-15"
 *               hora: "18:00:00"
 *               ubicacion: "Hotel Central"
 *               direccion: "Av. Principal 123"
 *               notas: "Ingreso por lobby"
 *             - fecha: "2025-11-16"
 *               hora: "12:00:00"
 *               ubicacion: "Sesion en estudio"
 *               direccion: "Calle 5 #222"
 *               notas: null
 *
 *     # ===================== (NUEVO) RESPUESTA CREATE ADMIN V3 =====================
 *     CotizacionCreateAdminResponse:
 *       type: object
 *       required: [idCotizacion, origen]
 *       properties:
 *         idCotizacion: { type: integer, example: 42 }
 *         clienteId:    { type: integer, nullable: true, example: 101 }
 *         leadId:       { type: integer, nullable: true, example: 55 }
 *         origen:
 *           type: string
 *           enum: [CLIENTE, LEAD]
 *           example: CLIENTE
 *
 *     CotizacionUpdate:
 *       type: object
 *       properties:
 *         cotizacion:
 *           type: object
 *           properties:
 *             idTipoEvento:   { type: integer, nullable: true }
 *             tipoEvento:     { type: string }
 *             fechaEvento:    { type: string, format: date }
 *             lugar:          { type: string }
 *             horasEstimadas: { type: number, format: float }
 *             mensaje:        { type: string }
 *             estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 *         items:
 *           type: array
 *           description: "Reemplaza TODO el set de items. Enviar [] para dejarlos vacios. Omitir 'items' para no tocarlos."
 *           items:
 *             type: object
 *             properties:
 *               idEventoServicio: { type: integer, nullable: true, example: 11 }
 *               eventoId:         { type: integer, nullable: true, example: 1, description: "ID del evento asociado (solo informativo)" }
 *               servicioId:       { type: integer, nullable: true, example: 7, description: "ID del servicio asociado (solo informativo)" }
 *               titulo:           { type: string, example: "Cobertura FotografÃ­a" }
 *               descripcion:      { type: string, nullable: true, example: "SesiÃ³n completa" }
 *               moneda:           { type: string, example: "USD" }
 *               precioUnitario:   { type: number, format: float, example: 800 }
 *               cantidad:         { type: number, format: float, example: 1 }
 *               notas:            { type: string, nullable: true, example: "Incluye preboda" }
 *               horas:            { type: number, format: float, nullable: true, example: 6 }
 *               personal:         { type: integer, nullable: true, example: 2 }
 *               fotosImpresas:    { type: integer, nullable: true, example: 20 }
 *               trailerMin:       { type: integer, nullable: true, example: 0 }
 *               filmMin:          { type: integer, nullable: true, example: 0 }
 *         eventos:
 *           type: array
 *           description: "Reemplaza todas las fechas asociadas. Omitir 'eventos' para dejarlas sin cambios."
 *           items: { $ref: '#/components/schemas/CotizacionEventoInput' }
 *       example:
 *         cotizacion:
 *           idTipoEvento: 1
 *           tipoEvento: "Boda"
 *           fechaEvento: "2025-10-20"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: 8
 *           mensaje: "Paquete premium actualizado"
 *           estado: "Enviada"
 *         items:
 *           - idEventoServicio: 11
 *             eventoId: 1
 *             servicioId: 7
 *             titulo: "Cobertura FotografÃ­a"
 *             descripcion: "SesiÃ³n completa con Ã¡lbum + preboda"
 *             moneda: "USD"
 *             precioUnitario: 900
 *             cantidad: 1
 *             notas: "Incluye preboda"
 *             horas: 6
 *             personal: 2
 *             fotosImpresas: 20
 *             trailerMin: 0
 *             filmMin: 0
 *         eventos:
 *           - fecha: "2025-11-15"
 *             hora: "18:00:00"
 *             ubicacion: "Hotel Central"
 *             direccion: "Av. Principal 123"
 *             notas: "Ingreso por lobby"
 *
 *     # ===================== (NUEVO) CAMBIO DE ESTADO CON CONCURRENCIA =====================
 *     CotizacionEstadoUpdateOptimista:
 *       type: object
 *       required: [estadoNuevo, estadoEsperado]
 *       properties:
 *         estadoNuevo:
 *           type: string
 *           enum: [Borrador, Enviada, Aceptada, Rechazada]
 *           example: Enviada
 *         estadoEsperado:
 *           type: string
 *           description: Estado que el cliente leyo antes de intentar cambiar (concurrencia optimista)
 *           enum: [Borrador, Enviada, Aceptada, Rechazada]
 *           example: Borrador
 *
 *     # ===================== (NUEVO) RESPUESTA DEL CAMBIO DE ESTADO =====================
 *     CotizacionEstadoUpdateResponse:
 *       type: object
 *       properties:
 *         Status: { type: string, example: "Estado actualizado" }
 *         id:     { type: integer, example: 6 }
*         estado: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada, Expirada], example: "Enviada" }
 *         detalle:
 *           $ref: '#/components/schemas/CotizacionListItem'
 *       example:
 *         Status: "Estado actualizado"
 *         estado: "Enviada"
 *         detalle:
 *           id: 6
 *           estado: "Enviada"
 *           fechaCreacion: "2025-10-11"
 *           eventoId: 1
 *           tipoEvento: "Boda"
 *           fechaEvento: "2025-10-20"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: "8.0"
 *           mensaje: "Agregar paquete premium"
 *           total: "4600.00"
 *           lead:
 *             id: 1
 *             nombre: "carlos"
 *             celular: "999663047"
 *             origen: "Tiktok"
 *             fechaCreacion: "2025-10-10"
 */

module.exports = {};
