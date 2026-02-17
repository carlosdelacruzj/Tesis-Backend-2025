const { Router } = require("express");
const ctrl = require("./lead.controller");
const requireProfile = require("../../middlewares/require-profile");
const router = Router();

router.use(requireProfile("ADMIN", "VENTAS"));

/**
 * @swagger
 * /leads/{id}/convertir-a-cliente:
 *   post:
 *     tags: [lead]
 *     summary: Convierte un lead en cliente usando el SP sp_lead_convertir_cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Identificador del lead a convertir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LeadConvertRequest' }
 *     responses:
 *       '200':
 *         description: Conversion exitosa
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LeadConvertResponse' }
 *       '400': { description: Datos invalidos }
 *       '404': { description: Lead no encontrado }
 *       '409': { description: Conflicto al crear cliente } 
 */
router.post("/:id/convertir-a-cliente", ctrl.postConvertirACliente);

module.exports = router;
