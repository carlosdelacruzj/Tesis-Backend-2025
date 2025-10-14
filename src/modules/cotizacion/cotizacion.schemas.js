/**
 * @swagger
 * components:
 *   schemas:
 *     # ===================== ITEMS (estructura cruda del SP) =====================
 *     CotizacionItemSP:
 *       type: object
 *       properties:
 *         idCotizacionServicio: { type: integer, example: 2 }
 *         idEventoServicio:     { type: integer, example: 13 }
 *         nombre:               { type: string, example: "Video Trailer" }
 *         descripcion:          { type: string, nullable: true, example: "Trailer cinematográfico" }
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
 *             fechaCrea: { type: string, example: "2025-10-10 14:43:59.000000" }
 *         cotizacion:
 *           type: object
 *           properties:
 *             tipoEvento:     { type: string, example: "Boda" }
 *             idTipoEvento:   { type: integer, example: 1 }
 *             fechaEvento:    { type: string, example: "2025-10-20" }
 *             lugar:          { type: string, example: "Cusco - Catedral" }
 *             horasEstimadas: { type: number, format: float, example: 8.0 }
 *             mensaje:        { type: string, example: "Agregar paquete premium" }
 *             estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada], example: "Enviada" }
 *             total:          { type: number, format: float, example: 1150.0 }
 *             fechaCreacion:  { type: string, example: "2025-10-10 14:43:59.000000" }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/CotizacionItemSP' }
 *       example:
 *         idCotizacion: 1
 *         lead:
 *           idlead: 1
 *           nombre: "carlos"
 *           origen: "Tiktok"
 *           celular: "999663047"
 *           fechaCrea: "2025-10-10 14:43:59.000000"
 *         cotizacion:
 *           tipoEvento: "Boda"
 *           idTipoEvento: 1
 *           fechaEvento: "2025-10-20"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: 8.0
 *           mensaje: "Agregar paquete premium"
 *           estado: "Enviada"
 *           total: 1150.0
 *           fechaCreacion: "2025-10-10 14:43:59.000000"
 *         items:
 *           - idCotizacionServicio: 1
 *             idEventoServicio: 11
 *             nombre: "Cobertura Fotografía"
 *             descripcion: "Sesión completa con álbum"
 *             moneda: "USD"
 *             precioUnit: 800.0
 *             cantidad: 1.0
 *             descuento: 0.0
 *             recargo: 0.0
 *             subtotal: 800.0
 *             notas: "Incluye sesión pre-boda"
 *             horas: 6.0
 *             personal: 2
 *             fotosImpresas: 20
 *             trailerMin: 0
 *             filmMin: 0
 *           - idCotizacionServicio: 2
 *             idEventoServicio: 13
 *             nombre: "Video Trailer"
 *             descripcion: "Trailer cinematográfico"
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
 *
 *     # ===================== LISTADO (puedes seguir usando tu salida actual) =====================
 *     CotizacionListItem:
 *       type: object
 *       properties:
 *         id:             { type: integer }
 *         estado:         { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada] }
 *         fechaCreacion:  { type: string, format: date-time }
 *         eventoId:       { type: integer, nullable: true, example: 1 }
 *         tipoEvento:     { type: string }
 *         fechaEvento:    { type: string, format: date, nullable: true }
 *         lugar:          { type: string, nullable: true }
 *         horasEstimadas: { type: number, format: float, nullable: true }
 *         mensaje:        { type: string, nullable: true }
 *         total:          { type: number, format: float, nullable: true, example: 1150 }
 *         lead:
 *           type: object
 *           properties:
 *             id:             { type: integer }
 *             nombre:         { type: string }
 *             celular:        { type: string, nullable: true }
 *             origen:         { type: string, nullable: true }
 *             fechaCreacion:  { type: string, format: date-time }
 *
 *     CotizacionList:
 *       type: array
 *       items: { $ref: '#/components/schemas/CotizacionListItem' }
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
 *             mensaje:        { type: string, example: "Cobertura básica" }
 *
 *     CotizacionCreateAdmin:
 *       type: object
 *       required: [cotizacion]
 *       properties:
 *         lead:
 *           type: object
 *           properties:
 *             id:      { type: integer, nullable: true, example: 55 }
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
 *           description: "Ítems con claves en UI; el backend los normaliza al JSON del SP"
 *           items:
 *             type: object
 *             properties:
 *               idEventoServicio: { type: integer, nullable: true, example: 11 }
 *               titulo:           { type: string, example: "Cobertura Fotografía" }
 *               descripcion:      { type: string, nullable: true, example: "Sesión completa con álbum" }
 *               moneda:           { type: string, example: "USD" }
 *               precioUnitario:   { type: number, format: float, example: 800 }
 *               cantidad:         { type: number, format: float, example: 1 }
 *               notas:            { type: string, nullable: true, example: "Incluye preboda" }
 *               horas:            { type: number, format: float, nullable: true, example: 6 }
 *               personal:         { type: integer, nullable: true, example: 2 }
 *               fotosImpresas:    { type: integer, nullable: true, example: 20 }
 *               trailerMin:       { type: integer, nullable: true, example: 0 }
 *               filmMin:          { type: integer, nullable: true, example: 0 }
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
 *           description: "Reemplaza TODO el set de ítems. Enviar [] para dejarlos vacíos. Omitir 'items' para no tocarlos."
 *           items:
 *             type: object
 *             properties:
 *               idEventoServicio: { type: integer, nullable: true, example: 11 }
 *               titulo:           { type: string, example: "Cobertura Fotografía" }
 *               descripcion:      { type: string, nullable: true, example: "Sesión completa" }
 *               moneda:           { type: string, example: "USD" }
 *               precioUnitario:   { type: number, format: float, example: 800 }
 *               cantidad:         { type: number, format: float, example: 1 }
 *               notas:            { type: string, nullable: true, example: "Incluye preboda" }
 *               horas:            { type: number, format: float, nullable: true, example: 6 }
 *               personal:         { type: integer, nullable: true, example: 2 }
 *               fotosImpresas:    { type: integer, nullable: true, example: 20 }
 *               trailerMin:       { type: integer, nullable: true, example: 0 }
 *               filmMin:          { type: integer, nullable: true, example: 0 }
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
 *             titulo: "Cobertura Fotografía"
 *             descripcion: "Sesión completa con álbum + preboda"
 *             moneda: "USD"
 *             precioUnitario: 900
 *             cantidad: 1
 *             notas: "Incluye preboda"
 *             horas: 6
 *             personal: 2
 *             fotosImpresas: 20
 *             trailerMin: 0
 *             filmMin: 0
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
 *         estado: { type: string, enum: [Borrador, Enviada, Aceptada, Rechazada], example: "Enviada" }
 *         detalle:
 *           $ref: '#/components/schemas/CotizacionListItem'
 *       example:
 *         Status: "Estado actualizado"
 *         estado: "Enviada"
 *         detalle:
 *           id: 6
 *           estado: "Enviada"
 *           fechaCreacion: "2025-10-11T10:19:21.000Z"
 *           eventoId: 1
 *           tipoEvento: "Boda"
 *           fechaEvento: "2025-10-20T05:00:00.000Z"
 *           lugar: "Cusco - Catedral"
 *           horasEstimadas: "8.0"
 *           mensaje: "Agregar paquete premium"
 *           total: "4600.00"
 *           lead:
 *             id: 1
 *             nombre: "carlos"
 *             celular: "999663047"
 *             origen: "Tiktok"
 *             fechaCreacion: "2025-10-10T19:43:59.000Z"
 */

module.exports = {};
