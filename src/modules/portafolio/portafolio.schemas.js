/**
 * @swagger
 * components:
 *   schemas:
 *     PortafolioEvento:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nombre: { type: string }
 *         iconUrl: { type: string, nullable: true }
 *         mostrarPortafolio: { type: integer, enum: [0, 1] }
 *       example:
 *         id: 1
 *         nombre: "Boda"
 *         iconUrl: "/uploads/icons/boda.png"
 *         mostrarPortafolio: 1
 *
 *     PortafolioImagen:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         eventoId: { type: integer }
 *         url: { type: string }
 *         titulo: { type: string, nullable: true }
 *         descripcion: { type: string, nullable: true }
 *         orden: { type: integer }
 *         fechaCreacion: { type: string, format: date-time }
 *       example:
 *         id: 10
 *         eventoId: 1
 *         url: "/uploads/portafolio/pf_1700000000_123456.jpg"
 *         titulo: "Boda en Lima"
 *         descripcion: "Sesion de exteriores"
 *         orden: 1
 *         fechaCreacion: "2026-01-25T10:30:00.000Z"
 *
 *     PortafolioImagenCreate:
 *       type: object
 *       required: [eventoId, files]
 *       properties:
 *         eventoId: { type: integer }
 *         tituloBase: { type: string, description: "Se numera automaticamente (opcional)" }
 *         descripcion: { type: string }
 *         ordenBase: { type: integer, description: "Orden inicial (opcional)" }
 *         files:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *
 *     PortafolioImagenUpdate:
 *       type: object
 *       properties:
 *         eventoId: { type: integer }
 *         titulo: { type: string }
 *         descripcion: { type: string }
 *         orden: { type: integer }
 *         file:
 *           type: string
 *           format: binary
 *
 *     PortafolioPublico:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         nombre: { type: string }
 *         iconUrl: { type: string, nullable: true }
 *         mostrarPortafolio: { type: integer, enum: [0, 1] }
 *         imagenes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PortafolioImagen'
 */
module.exports = {};
