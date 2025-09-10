// src/routes/validacionCorreo.js
const { Router } = require("express");
const router = Router();
const nodemailer = require("nodemailer");

async function handler(req, res) {
  try {
    const { email, fechaActual } = req.body || {};
    if (!email)
      return res.status(400).json({ success: false, message: "Falta email" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || "r.k.villanueva.laurente@gmail.com",
        pass: process.env.GMAIL_PASS || "nhrzmbjbptbnwezg",
      },
    });

    const mailOptions = {
      from: `"Fotografia y Video De La Cruz" <${
        process.env.GMAIL_USER || "r.k.villanueva.laurente@gmail.com"
      }>`,
      to: email,
      subject: "Código de validación",
      text: "TU CODIGO DE VALIDACION ES 888888",
      html: `<p>Tu código de validación es <strong>888888</strong>${
        fechaActual ? ` (generado: ${fechaActual})` : ""
      }</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "Correo de validación enviado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Compatibilidad: ambos paths apuntan al mismo handler
router.post("/usuario/consulta/envioCorreoValidacion", handler);
router.post("/validacionCorreo", handler);

module.exports = router;
