// src/modules/eventos_servicios/eventos_servicios.schemas.js
/**
 * @swagger
 * components:
 *   schemas:
 *     EventoServicio:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: PK_ExS_Cod
 *         servicio:
 *           type: integer
 *           description: PK_S_Cod
 *         evento:
 *           type: integer
 *         precio:
 *           type: number
 *           format: float
 *           nullable: true
 *         descripcion:
 *           type: string
 *           nullable: true
 *           description: ExS_Descripcion
 *         titulo:
 *           type: string
 *           nullable: true
 *       example:
 *         id: 1
 *         servicio: 2
 *         evento: 5
 *         precio: 199.99
 *         descripcion: Cobertura extendida con álbum
 *         titulo: Pack Premium
 *
 *     EventoServicioCreate:
 *       type: object
 *       required: [servicio, evento]
 *       properties:
 *         servicio:
 *           type: integer
 *           description: FK -> PK_S_Cod
 *         evento:
 *           type: integer
 *         precio:
 *           type: number
 *           format: float
 *           nullable: true
 *         descripcion:
 *           type: string
 *           nullable: true
 *         titulo:
 *           type: string
 *           nullable: true
 *       example:
 *         servicio: 2
 *         evento: 5
 *         precio: 150.0
 *         descripcion: Cobertura básica
 *         titulo: Pack Básico
 *
 *     EventoServicioUpdate:
 *       type: object
 *       description: Campos opcionales; al menos uno requerido.
 *       properties:
 *         servicio:
 *           type: integer
 *         precio:
 *           type: number
 *           format: float
 *         concepto:
 *           type: string
 *           description: ExS_Descripcion
 *       anyOf:
 *         - required: [servicio]
 *         - required: [precio]
 *         - required: [concepto]
 *       example:
 *         precio: 220.5
 *         concepto: Actualización de precio y concepto
 */
module.exports = {};
