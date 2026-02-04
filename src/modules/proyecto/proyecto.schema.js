/**
 * @swagger
 * components:
 *   schemas:
 *     Proyecto:
 *       type: object
 *       properties:
 *         proyectoId:          { type: integer }
 *         proyectoNombre:      { type: string }
 *         pedidoId:            { type: integer }
 *         pedidoCodigo:        { type: string, nullable: true }
 *         fechaInicioEdicion:  { type: string, format: date }
 *         fechaFinEdicion:     { type: string, format: date, nullable: true }
 *         estadoId:            { type: integer }
 *         estadoNombre:        { type: string, nullable: true }
 *         estadoPedidoId:      { type: integer, nullable: true }
 *         estadoPedidoNombre:  { type: string, nullable: true }
 *         estadoPagoId:        { type: integer, nullable: true }
 *         estadoPagoNombre:    { type: string, nullable: true }
 *         montoAbonado:        { type: number, format: double, nullable: true }
 *         saldoPendiente:      { type: number, format: double, nullable: true }
 *         pedidoServicios:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pedidoServicioId: { type: integer }
 *               eventoServicioId: { type: integer, nullable: true }
 *               nombre:           { type: string, nullable: true }
 *               cantidad:         { type: number, format: double, nullable: true }
 *               precioUnit:       { type: number, format: double, nullable: true }
 *               subtotal:         { type: number, format: double, nullable: true }
 *               descripcion:      { type: string, nullable: true }
 *         personalRequerido:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               eventoServicioId: { type: integer, nullable: true }
 *               rol:              { type: string, nullable: true }
 *               cantidad:         { type: integer, nullable: true }
 *         equiposRequeridos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               eventoServicioId:  { type: integer, nullable: true }
 *               tipoEquipoId:      { type: integer, nullable: true }
 *               tipoEquipoNombre:  { type: string, nullable: true }
 *               cantidad:          { type: integer, nullable: true }
 *               notas:             { type: string, nullable: true }
 *         responsableId:       { type: integer, nullable: true }
 *         notas:               { type: string, nullable: true }
 *         enlace:              { type: string, nullable: true }
 *
 *     ProyectoEdicion:
 *       type: object
 *       properties:
 *         proyecto:
 *           $ref: '#/components/schemas/Proyecto'
 *         dias:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDia' }
 *         bloquesDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaBloque' }
 *         serviciosDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaServicio' }
 *         empleadosDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEmpleado' }
 *         equiposDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEquipo' }
 *         requerimientosPersonalDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/RequerimientoPersonalDia' }
 *         requerimientosEquipoDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/RequerimientoEquipoDia' }
 *         incidenciasDia:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaIncidencia' }
 *
 *     ProyectoDia:
 *       type: object
 *       properties:
 *         diaId:      { type: integer }
 *         proyectoId: { type: integer }
 *         fecha:      { type: string, format: date }
 *         estadoDiaId: { type: integer }
 *         estadoDiaNombre: { type: string }
 *
 *     ProyectoDiaBloque:
 *       type: object
 *       properties:
 *         bloqueId:   { type: integer }
 *         diaId:      { type: integer }
 *         fecha:      { type: string, format: date }
 *         hora:       { type: string, format: time, nullable: true }
 *         ubicacion:  { type: string, nullable: true }
 *         direccion:  { type: string, nullable: true }
 *         notas:      { type: string, nullable: true }
 *         orden:      { type: integer }
 *
 *     ProyectoDiaServicio:
 *       type: object
 *       properties:
 *         id:               { type: integer }
 *         diaId:            { type: integer }
 *         fecha:            { type: string, format: date }
 *         pedidoServicioId: { type: integer }
 *         eventoServicioId: { type: integer, nullable: true }
 *         nombre:           { type: string }
 *         descripcion:      { type: string, nullable: true }
 *         moneda:           { type: string }
 *         precioUnit:       { type: number, format: double }
 *         cantidad:         { type: number, format: double }
 *         descuento:        { type: number, format: double }
 *         recargo:          { type: number, format: double }
 *         subtotal:         { type: number, format: double }
 *
 *     ProyectoDiaEmpleado:
 *       type: object
 *       properties:
 *         asignacionId:   { type: integer }
 *         diaId:          { type: integer }
 *         fecha:          { type: string, format: date }
 *         empleadoId:     { type: integer }
 *         empleadoNombre: { type: string }
 *         cargoId:        { type: integer, nullable: true }
 *         cargo:          { type: string, nullable: true }
 *         notas:          { type: string, nullable: true }
 *
 *     ProyectoDiaEquipo:
 *       type: object
 *       properties:
 *         asignacionId:      { type: integer }
 *         diaId:             { type: integer }
 *         fecha:             { type: string, format: date }
 *         equipoId:          { type: integer }
 *         equipoSerie:       { type: string, nullable: true }
 *         modelo:            { type: string, nullable: true }
 *         tipoEquipo:        { type: string, nullable: true }
 *         estadoEquipoId:    { type: integer, nullable: true }
 *         responsableId:     { type: integer, nullable: true }
 *         responsableNombre: { type: string, nullable: true }
 *         notas:             { type: string, nullable: true }
 *         devuelto:          { type: integer, nullable: true }
 *         fechaDevolucion:   { type: string, format: date-time, nullable: true }
 *         estadoDevolucion:  { type: string, nullable: true }
 *         notasDevolucion:   { type: string, nullable: true }
 *         usuarioDevolucion: { type: integer, nullable: true }
 *
 *     ProyectoDiaEquipoDevolucion:
 *       type: object
 *       required: [devuelto]
 *       properties:
 *         devuelto:           { type: integer, enum: [0,1] }
 *         estadoDevolucion:
 *           type: string
 *           nullable: true
 *           enum: [DEVUELTO, DANADO, PERDIDO, ROBADO]
 *         notasDevolucion:    { type: string, nullable: true }
 *         fechaDevolucion:    { type: string, format: date-time, nullable: true, description: "Si se omite o 'auto', usa NOW()" }
 *         usuarioId:          { type: integer, nullable: true }
 *
 *     ProyectoDiaEquipoDevolucionItem:
 *       type: object
 *       required: [equipoId, devuelto]
 *       properties:
 *         equipoId:           { type: integer }
 *         devuelto:           { type: integer, enum: [0,1] }
 *         estadoDevolucion:
 *           type: string
 *           nullable: true
 *           enum: [DEVUELTO, DANADO, PERDIDO, ROBADO]
 *         notasDevolucion:    { type: string, nullable: true }
 *         fechaDevolucion:    { type: string, format: date-time, nullable: true, description: "Si se omite o 'auto', usa NOW()" }
 *
 *     ProyectoDiaDevolucion:
 *       type: object
 *       required: [equipos]
 *       properties:
 *         equipos:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEquipoDevolucionItem' }
 *         usuarioId: { type: integer, nullable: true }
 *         fechaDevolucion:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: "Fecha por defecto para los items; cada item puede override con su propia fecha"
 *
 *     RequerimientoPersonalDia:
 *       type: object
 *       properties:
 *         diaId:    { type: integer }
 *         fecha:    { type: string, format: date }
 *         rol:      { type: string }
 *         cantidad: { type: integer }
 *
 *     RequerimientoEquipoDia:
 *       type: object
 *       properties:
 *         diaId:           { type: integer }
 *         fecha:           { type: string, format: date }
 *         tipoEquipoId:    { type: integer }
 *         tipoEquipoNombre: { type: string }
 *         cantidad:        { type: integer }
 *
 *     ProyectoDiaIncidencia:
 *       type: object
 *       properties:
 *         incidenciaId:        { type: integer }
 *         diaId:               { type: integer }
 *         fecha:               { type: string, format: date }
 *         tipo:                { type: string }
 *         descripcion:         { type: string }
 *         empleadoId:          { type: integer, nullable: true }
 *         empleadoNombre:      { type: string, nullable: true }
 *         empleadoCargoId:     { type: integer, nullable: true }
 *         empleadoCargo:       { type: string, nullable: true }
 *         empleadoReemplazoId: { type: integer, nullable: true }
 *         empleadoReemplazoNombre: { type: string, nullable: true }
 *         empleadoReemplazoCargoId: { type: integer, nullable: true }
 *         empleadoReemplazoCargo: { type: string, nullable: true }
 *         equipoId:            { type: integer, nullable: true }
 *         equipoSerie:         { type: string, nullable: true }
 *         equipoModelo:        { type: string, nullable: true }
 *         equipoTipo:          { type: string, nullable: true }
 *         equipoReemplazoId:   { type: integer, nullable: true }
 *         equipoReemplazoSerie:   { type: string, nullable: true }
 *         equipoReemplazoModelo:  { type: string, nullable: true }
 *         equipoReemplazoTipo:    { type: string, nullable: true }
 *         usuarioId:           { type: integer, nullable: true }
 *         usuarioNombre:       { type: string, nullable: true }
 *         proyectoId:          { type: integer, nullable: true }
 *         createdAt:           { type: string, format: date-time }
 *
 *     EstadoProyecto:
 *       type: object
 *       properties:
 *         estadoId:     { type: integer }
 *         estadoNombre: { type: string }
 *         orden:        { type: integer }
 *         activo:       { type: integer, enum: [0,1] }
 *       example:
 *         estadoId: 2
 *         estadoNombre: "En ejecucion"
 *         orden: 2
 *         activo: 1
 *
 *     EstadoProyectoDia:
 *       type: object
 *       properties:
 *         estadoDiaId:     { type: integer }
 *         estadoDiaNombre: { type: string }
 *         orden:           { type: integer }
 *         activo:          { type: integer, enum: [0,1] }
 *       example:
 *         estadoDiaId: 1
 *         estadoDiaNombre: "Pendiente"
 *         orden: 1
 *         activo: 1
 *
 *     ProyectoDiaEstadoUpdate:
 *       type: object
 *       required: [estadoDiaId]
 *       properties:
 *         estadoDiaId: { type: integer }
 *       example:
 *         estadoDiaId: 2
 *
 *     ProyectoDiaEmpleadoUpsert:
 *       type: object
 *       required: [empleadoId]
 *       properties:
 *         empleadoId: { type: integer }
 *         notas: { type: string, nullable: true }
 *
 *     ProyectoDiaEquipoUpsert:
 *       type: object
 *       required: [equipoId]
 *       properties:
 *         equipoId: { type: integer }
 *         responsableId:
 *           type: integer
 *           nullable: true
 *           description: Debe existir en la lista de empleados del mismo dia. Si no, se guarda null (reserva).
 *         notas: { type: string, nullable: true }
 *
 *     ProyectoDiaAsignacionesUpsert:
 *       type: object
 *       required: [empleados, equipos]
 *       properties:
 *         empleados:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEmpleadoUpsert' }
 *         equipos:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEquipoUpsert' }
 *       example:
 *         empleados:
 *           - empleadoId: 12
 *             notas: "Equipo A"
 *           - empleadoId: 15
 *         equipos:
 *           - equipoId: 101
 *             responsableId: 12
 *             notas: "Camara principal"
 *           - equipoId: 102
 *             responsableId: 15
 *
 *     ProyectoAsignacionesDiaUpsert:
 *       type: object
 *       required: [diaId, empleados, equipos]
 *       properties:
 *         diaId: { type: integer }
 *         empleados:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEmpleadoUpsert' }
 *         equipos:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDiaEquipoUpsert' }
 *       description: Reemplaza asignaciones del dia indicado. Use [] para limpiar.
 *
 *     ProyectoAsignacionesUpsert:
 *       type: object
 *       required: [proyectoId, dias]
 *       properties:
 *         proyectoId: { type: integer }
 *         dias:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoAsignacionesDiaUpsert' }
 *       description: |
 *         Reemplaza asignaciones solo de los dias enviados.
 *         Los dias no enviados NO se modifican.
 *         Para limpiar un dia, enviar empleados: [] y equipos: [].
 *       example:
 *         proyectoId: 7
 *         dias:
 *           - diaId: 31
 *             empleados:
 *               - empleadoId: 12
 *             equipos:
 *               - equipoId: 101
 *                 responsableId: 12
 *           - diaId: 32
 *             empleados: []
 *             equipos:
 *               - equipoId: 102
 *                 responsableId: null
 *
 *     ProyectoDisponibilidadEmpleado:
 *       type: object
 *       properties:
 *         empleadoId: { type: integer }
 *         usuarioId:  { type: integer }
 *         nombre:     { type: string }
 *         apellido:   { type: string }
 *         cargoId:    { type: integer }
 *         cargo:      { type: string }
 *
 *     ProyectoDisponibilidadEquipo:
 *       type: object
 *       properties:
 *         equipoId:         { type: integer }
 *         serie:            { type: string, nullable: true }
 *         idModelo:         { type: integer }
 *         nombreModelo:     { type: string }
 *         idTipoEquipo:     { type: integer }
 *         nombreTipoEquipo: { type: string }
 *
 *     ProyectoAsignacionesDisponibles:
 *       type: object
 *       properties:
 *         empleados:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDisponibilidadEmpleado' }
 *         equipos:
 *           type: array
 *           items: { $ref: '#/components/schemas/ProyectoDisponibilidadEquipo' }
 *       description: Listas filtradas solo con disponibles para la(s) fecha(s) consultada(s).
 *
 *     ProyectoDiaIncidenciaCreate:
 *       type: object
 *       required: [tipo, descripcion]
 *       properties:
 *         tipo:
 *           type: string
 *           description: PERSONAL_NO_ASISTE | EQUIPO_FALLA_EN_EVENTO | EQUIPO_ROBO_PERDIDA | OTROS
 *         descripcion:
 *           type: string
 *         empleadoId:
 *           type: integer
 *           nullable: true
 *         empleadoReemplazoId:
 *           type: integer
 *           nullable: true
 *         equipoId:
 *           type: integer
 *           nullable: true
 *         equipoReemplazoId:
 *           type: integer
 *           nullable: true
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *       example:
 *         tipo: "PERSONAL_NO_ASISTE"
 *         descripcion: "No asistio por enfermedad. Se reemplazo."
 *         empleadoId: 45
 *         empleadoReemplazoId: 98
 *
 *     ProyectoCreate:
 *       type: object
 *       required: [pedidoId]
 *       properties:
 *         pedidoId:
 *           type: integer
 *           description: Pedido origen del proyecto
 *         responsableId:
 *           type: integer
 *           nullable: true
 *           description: FK a T_Empleados
 *         notas:
 *           type: string
 *           nullable: true
 *         enlace:
 *           type: string
 *           nullable: true
 *       example:
 *         pedidoId: 2
 *         responsableId: 3
 *         notas: "Crear proyecto desde pedido"
 *         enlace: "https://drive.com/entrega"
 *
 *     ProyectoUpdate:
 *       type: object
 *       properties:
 *         proyectoNombre:       { type: string }
 *         fechaInicioEdicion:   { type: string, format: date }
 *         fechaFinEdicion:      { type: string, format: date }
 *         estadoId:             { type: integer }
 *         responsableId:        { type: integer }
 *         notas:                { type: string }
 *         enlace:               { type: string }
 *         multimedia:           { type: integer }
 *         edicion:              { type: integer }
 *       required: []
 *       example:
 *         proyectoNombre: "Evento corporativo"
 *         fechaInicioEdicion: "2025-09-09"
 *         fechaFinEdicion: "2025-10-01"
 *         estadoId: 2
 *         responsableId: 4
 *         notas: "Cambiar locación a parque"
 *         enlace: "https://link.com/drive"
 *         multimedia: 1
 *         edicion: 1
 */

module.exports = {};
