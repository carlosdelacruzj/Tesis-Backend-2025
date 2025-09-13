const { Router } = require("express");
const jwt = require("jsonwebtoken");

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: auth
 *     description: Autenticación (desarrollo)
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Login de prueba (dev)
 *     description: Emite un JWT de prueba (solo para desarrollo).
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: integer, example: 1 }
 *               email:  { type: string, example: "demo@example.com" }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 */
router.post("/login", (req, res) => {
  const { userId = 1, email = "demo@example.com" } = req.body || {};
  const payload = { sub: userId, email };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "my_secret_key", { expiresIn: "8h" });
  res.json({ token });
});

module.exports = router;
