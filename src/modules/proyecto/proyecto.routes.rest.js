// src/modules/proyecto/proyecto.routes.rest.js
const { Router } = require("express");
const ctrl = require("./proyecto.controller");
const requireProfile = require("../../middlewares/require-profile");
const router = Router();

router.use(requireProfile("ADMIN", "OPERACIONES"));

/**
 * @swagger
 * /proyecto:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar proyectos
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProyectoListadoItem' }
 */
router.get("/", ctrl.getAllProyecto);

/**
 * @swagger
 * /proyecto:
 *   post:
 *     tags: [proyecto]
 *     summary: Crear proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoCreate' }
 *     responses: { '201': { description: Creado } }
 */
router.post("/", ctrl.postProyecto);

/**
 * @swagger
 * /proyecto/asignaciones/disponibles:
 *   get:
 *     tags: [proyecto]
 *     summary: Listas disponibles para asignaciones (solo disponibles)
 *     description: |
 *       Devuelve solo empleados/equipos disponibles para la(s) fecha(s) consultada(s),
 *       listo para usar en el post de asignaciones.
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: false
 *         schema: { type: string, format: date }
 *         description: Fecha unica (si se envia, no requiere fechaInicio/fechaFin).
 *       - in: query
 *         name: fechaInicio
 *         required: false
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: fechaFin
 *         required: false
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: proyectoId
 *         required: false
 *         schema: { type: integer }
 *         description: Se excluyen las asignaciones de este proyecto (util al editar)
 *       - in: query
 *         name: tipoEquipoId
 *         required: false
 *         schema: { type: integer }
 *       - in: query
 *         name: cargoId
 *         required: false
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProyectoAsignacionesDisponibles' }
 *       '400':
 *         description: Datos invalidos
 */
router.get("/asignaciones/disponibles", ctrl.getDisponibilidadAsignaciones);

/**
 * @swagger
 * /proyecto/estados:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar estados de proyecto
 *     responses: { '200': { description: OK } }
 */
router.get("/estados", ctrl.getEstados);

/**
 * @swagger
 * /proyecto/dias/estados:
 *   get:
 *     tags: [proyecto]
 *     summary: Listar estados por dia de proyecto
 *     responses: { '200': { description: OK } }
 */
router.get("/dias/estados", ctrl.getEstadosDia);

/**
 * @swagger
 * /proyecto/asignaciones:
 *   post:
 *     tags: [proyecto]
 *     summary: Upsert de asignaciones por proyecto (bulk por dia)
 *     description: |
 *       Reemplaza completamente las asignaciones de los dias enviados.
 *       Los dias no enviados NO se modifican.
 *       Para limpiar un dia, enviar empleados: [] y equipos: [].
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoAsignacionesUpsert' }
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Datos invalidos
 *       '404':
 *         description: Proyecto o dia no encontrado
 */
router.post("/asignaciones", ctrl.postProyectoAsignacionesUpsert);

/**
 * @swagger
 * /proyecto/dias/{diaId}/incidencias:
 *   post:
 *     tags: [proyecto]
 *     summary: Registrar incidencia por dia (con reemplazo automatico)
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDiaIncidenciaCreate' }
 *     responses:
 *       '201': { description: Creado }
 *       '400': { description: Datos invalidos }
 *       '404': { description: Dia no encontrado }
 */
router.post("/dias/:diaId(\\d+)/incidencias", ctrl.postProyectoDiaIncidencia);

/**
 * @swagger
 * /proyecto/dias/{diaId}/equipos/devolucion:
 *   post:
 *     tags: [proyecto]
 *     summary: Registrar devolucion de equipos de un dia (batch)
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDiaDevolucion' }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: Datos invalidos }
 *       '404': { description: Dia o equipo no encontrado }
 */
router.post("/dias/:diaId(\\d+)/equipos/devolucion", ctrl.postProyectoDiaDevolucion);

/**
 * @swagger
 * /proyecto/dias/{diaId}/equipos/devolucion/async:
 *   post:
 *     tags: [proyecto]
 *     summary: Registrar devolucion de equipos de un dia en segundo plano (job async)
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDiaDevolucion' }
 *     responses:
 *       '202': { description: Aceptado }
 *       '400': { description: Datos invalidos }
 */
router.post("/dias/:diaId(\\d+)/equipos/devolucion/async", ctrl.postProyectoDiaDevolucionAsync);

/**
 * @swagger
 * /proyecto/equipos/devolucion/preview:
 *   post:
 *     tags: [proyecto]
 *     summary: Simular impacto de devolucion de equipo(s) (sin escritura)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDevolucionPreviewRequest' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProyectoDevolucionPreviewResponse' }
 *       '400': { description: Datos invalidos }
 *       '404': { description: Equipo no encontrado }
 */
router.post("/equipos/devolucion/preview", ctrl.postProyectoEquipoDevolucionPreview);

/**
 * @swagger
 * /proyecto/devoluciones/jobs/{jobId}:
 *   get:
 *     tags: [proyecto]
 *     summary: Consultar estado de job de devolucion async
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK }
 *       '404': { description: Job no encontrado }
 */
router.get("/devoluciones/jobs/:jobId", ctrl.getProyectoDevolucionJob);

/**
 * @swagger
 * /proyecto/dias/{diaId}/equipos/{equipoId}/devolucion:
 *   patch:
 *     tags: [proyecto]
 *     summary: Registrar devolucion de un equipo puntual de un dia
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: equipoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDiaEquipoDevolucion' }
 *     responses:
 *       '200': { description: OK }
 *       '400': { description: Datos invalidos }
 *       '404': { description: Dia o equipo no encontrado }
 */
router.patch(
  "/dias/:diaId(\\d+)/equipos/:equipoId(\\d+)/devolucion",
  ctrl.patchProyectoDiaEquipoDevolucion
);

/**
 * @swagger
 * /proyecto/dias/{diaId}/estado:
 *   patch:
 *     tags: [proyecto]
 *     summary: Actualizar estado de un dia del proyecto
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoDiaEstadoUpdate' }
 *     responses: { '200': { description: OK } }
 */
router.patch("/dias/:diaId(\\d+)/estado", ctrl.patchProyectoDiaEstado);

/**
 * @swagger
 * /proyecto/dias/{diaId}/cancelar:
 *   post:
 *     tags: [proyecto]
 *     summary: Cancelar un dia de proyecto con metadatos de responsabilidad
 *     parameters:
 *       - in: path
 *         name: diaId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [responsable, motivo]
 *             properties:
 *               responsable: { type: string, enum: [CLIENTE, INTERNO] }
 *               motivo:
 *                 type: string
 *                 enum: [DESISTE_EVENTO, FUERZA_MAYOR_CLIENTE, OTRO_CLIENTE, FUERZA_MAYOR_INTERNA, OTRO_INTERNO]
 *               notas: { type: string, nullable: true }
 *     responses: { '200': { description: OK } }
 */
router.post("/dias/:diaId(\\d+)/cancelar", ctrl.postProyectoDiaCancelar);

/**
 * @swagger
 * /proyecto/{proyectoId}/cancelar-global:
 *   post:
 *     tags: [proyecto]
 *     summary: Cancelar globalmente un proyecto (dias + proyecto + pedido)
 *     description: |
 *       Solo permitido cuando no existe ningun dia Terminado y todos los dias estan en
 *       Pendiente, En curso o Cancelado. Si responsable = INTERNO se genera una sola NC
 *       por el monto total de los dias cancelados en la operacion.
 *     parameters:
 *       - in: path
 *         name: proyectoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [responsable, motivo]
 *             properties:
 *               responsable: { type: string, enum: [CLIENTE, INTERNO] }
 *               motivo:
 *                 type: string
 *                 enum: [DESISTE_EVENTO, FUERZA_MAYOR_CLIENTE, OTRO_CLIENTE, FUERZA_MAYOR_INTERNA, OTRO_INTERNO]
 *               notas: { type: string, nullable: true }
 *     responses: { '200': { description: OK } }
 */
router.post("/:proyectoId(\\d+)/cancelar-global", ctrl.postProyectoCancelarGlobal);

/**
 * @swagger
 * /proyecto/{id}/postproduccion:
 *   patch:
 *     tags: [proyecto]
 *     summary: Actualizar postproduccion de un proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoPostproduccionUpdate' }
 *     responses: { '200': { description: OK } }
 */
router.patch("/:id(\\d+)/postproduccion", ctrl.patchProyectoPostproduccion);

/**
 * @swagger
 * /proyecto/{id}:
 *   put:
 *     tags: [proyecto]
 *     summary: Actualizar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProyectoUpdate' }
 *     responses: { '200': { description: Actualizado } }
 */
router.put("/:id(\\d+)", ctrl.putProyecto);

/**
 * @swagger
 * /proyecto/{id}:
 *   delete:
 *     tags: [proyecto]
 *     summary: Eliminar proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses: { '200': { description: Eliminado } }
 */
router.delete("/:id(\\d+)", ctrl.deleteProyecto);

/**
 * @swagger
 * /proyecto/{id}:
 *   patch:
 *     tags: [proyecto]
 *     summary: Actualizacion parcial de proyecto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proyectoNombre: { type: string }
 *               fechaInicioEdicion: { type: string, format: date }
 *               fechaFinEdicion: { type: string, format: date }
 *               preEntregaEnlace: { type: string }
 *               preEntregaTipo: { type: string }
 *               preEntregaFeedback: { type: string }
 *               preEntregaFecha: { type: string, format: date }
 *               respaldoUbicacion: { type: string }
 *               respaldoNotas: { type: string }
 *               entregaFinalEnlace: { type: string }
 *               entregaFinalFecha: { type: string, format: date }
 *               responsableId: { type: integer, nullable: true }
 *               notas: { type: string }
 *               enlace: { type: string }
 *             example:
 *               notas: "Actualizando metadatos del proyecto"
 *     responses: { '200': { description: Actualizacion parcial exitosa } }
 */
router.patch("/:id(\\d+)", ctrl.patchProyecto);

/**
 * @swagger
 * /proyecto/{id}:
 *   get:
 *     tags: [proyecto]
 *     summary: Obtener proyecto por ID (edicion + postproduccion)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ProyectoEdicion' }
 *       '404': { description: No encontrado }
 */
router.get("/:id(\\d+)", ctrl.getByIdProyecto);

module.exports = router;
