// src/modules/eventos_servicios/eventos_servicios.schemas.js
/**
 * @swagger
 * components:
 *   schemas:
 *     EventoServicioStaffItem:
 *       type: object
 *       properties:
 *         rol:
 *           type: string
 *           example: Fotógrafo
 *         cantidad:
 *           type: integer
 *           example: 2
 *
 *     EventoServicioEquipoItem:
 *       type: object
 *       properties:
 *         tipoEquipoId:
 *           type: integer
 *           example: 3
 *         tipoEquipo:
 *           type: string
 *           example: Cámara DSLR
 *         cantidad:
 *           type: integer
 *           example: 2
 *         notas:
 *           type: string
 *           nullable: true
 *           example: Con baterías adicionales
 *
 *     EventoServicio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: PK_ExS_Cod
 *         titulo:
 *           type: string
 *           description: Nombre comercial del paquete
 *         categoria:
 *           type: string
 *           nullable: true
 *           description: Agrupador opcional (p. ej. Básico, Premium)
 *         evento:
 *           type: object
 *           properties:
 *             id: { type: integer, description: PK_E_Cod }
 *             nombre: { type: string, nullable: true }
 *         servicio:
 *           type: object
 *           properties:
 *             id: { type: integer, description: PK_S_Cod }
 *             nombre: { type: string, nullable: true }
 *         precio:
 *           type: number
 *           format: float
 *           nullable: true
 *         descripcion:
 *           type: string
 *           nullable: true
 *         horas:
 *           type: number
 *           format: float
 *           nullable: true
 *         fotosImpresas:
 *           type: integer
 *           nullable: true
 *         trailerMin:
 *           type: integer
 *           nullable: true
 *         filmMin:
 *           type: integer
 *           nullable: true
 *         staff:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             detalle:
 *               type: array
 *               items: { $ref: '#/components/schemas/EventoServicioStaffItem' }
 *         equipos:
 *           type: array
 *           items: { $ref: '#/components/schemas/EventoServicioEquipoItem' }
 *       example:
 *         id: 17
 *         titulo: Cobertura Fotografía Premium
 *         categoria: Premium
 *         evento: { id: 5, nombre: "Boda" }
 *         servicio: { id: 2, nombre: "Fotografía" }
 *         precio: 1200
 *         descripcion: Cobertura completa con álbum y preboda
 *         horas: 10
 *         fotosImpresas: 40
 *         trailerMin: 0
 *         filmMin: 0
 *         staff:
 *           total: 3
 *           detalle:
 *             - { rol: "Fotógrafo", cantidad: 2 }
 *             - { rol: "Asistente", cantidad: 1 }
 *         equipos:
 *           - { tipoEquipoId: 3, tipoEquipo: "Cámara DSLR", cantidad: 2 }
 *           - { tipoEquipoId: 7, tipoEquipo: "Dron", cantidad: 1, notas: "Operador certificado" }
 *
 *     EventoServicioCreate:
 *       type: object
 *       required: [servicio, evento, staff, equipos]
 *       properties:
 *         servicio:
 *           type: integer
 *           description: FK -> PK_S_Cod
 *         evento:
 *           type: integer
 *         titulo:
 *           type: string
 *           nullable: true
 *         categoria:
 *           type: string
 *           nullable: true
 *         precio:
 *           type: number
 *           format: float
 *           nullable: true
 *         descripcion:
 *           type: string
 *           nullable: true
 *         horas:
 *           type: number
 *           format: float
 *           nullable: true
 *         fotosImpresas:
 *           type: integer
 *           nullable: true
 *         trailerMin:
 *           type: integer
 *           nullable: true
 *         filmMin:
 *           type: integer
 *           nullable: true
 *         staff:
 *           type: array
 *           minItems: 1
 *           description: Distribución del personal requerido
 *           items: { $ref: '#/components/schemas/EventoServicioStaffItem' }
 *         equipos:
 *           type: array
 *           minItems: 1
 *           description: Equipos necesarios por tipo
 *           items: { $ref: '#/components/schemas/EventoServicioEquipoItem' }
 *       example:
 *         servicio: 2
 *         evento: 5
 *         titulo: Cobertura Fotografía Básica
 *         categoria: Standard
 *         precio: 850
 *         descripcion: Cobertura de ceremonia y recepción
 *         horas: 6
 *         staff:
 *           - { rol: "Fotógrafo", cantidad: 1 }
 *           - { rol: "Asistente", cantidad: 1 }
 *         equipos:
 *           - { tipoEquipoId: 3, cantidad: 1 }
 *
 *     EventoServicioUpdate:
 *       type: object
 *       description: Enviar solo los campos que se desean modificar.
 *       properties:
 *         servicio: { type: integer }
 *         evento: { type: integer }
 *         titulo: { type: string, nullable: true }
 *         categoria: { type: string, nullable: true }
 *         precio: { type: number, format: float, nullable: true }
 *         descripcion: { type: string, nullable: true }
 *         horas: { type: number, format: float, nullable: true }
 *         fotosImpresas: { type: integer, nullable: true }
 *         trailerMin: { type: integer, nullable: true }
 *         filmMin: { type: integer, nullable: true }
 *         staff:
 *           type: array
 *           minItems: 1
 *           description: Reemplaza la distribución completa; se requiere al menos un elemento.
 *           items: { $ref: '#/components/schemas/EventoServicioStaffItem' }
 *         equipos:
 *           type: array
 *           minItems: 1
 *           description: Reemplaza los equipos asociados; se requiere al menos un elemento.
 *           items: { $ref: '#/components/schemas/EventoServicioEquipoItem' }
 *       example:
 *         titulo: Cobertura Fotografía Premium
 *         precio: 1250
 *         staff:
 *           - { rol: "Fotógrafo", cantidad: 2 }
 *           - { rol: "Asistente", cantidad: 2 }
 *         equipos: []
 */
module.exports = {};
