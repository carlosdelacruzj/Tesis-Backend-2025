// src/routes/mail.js
const { Router } = require("express");
const router = Router();

const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const multer = require("multer");

// subidas temporales a /uploads
const upload = multer({ dest: "uploads/" });

// POST /send-email (pública según tu whitelist)
router.post("/send-email", upload.single("file"), async (req, res) => {
  try {
    const { subject, email, message } = req.body;
    const { path, originalname } = req.file;

    // leer adjunto
    const reader = await fs.readFile(path);

    // leer HTML de presentación (tal como lo tenías)
    const contentHTML = await fs.readFile("presentacion.html");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "r.k.villanueva.laurente@gmail.com",
        pass: "nhrzmbjbptbnwezg",
      },
    });

    const mailOptions = {
      from: '"Fotografia y Video De La Cruz" <r.k.villanueva.laurente@gmail.com>',
      to: email,
      subject: subject,
      text: message,
      html: contentHTML,
      attachments: [
        {
          filename: originalname,
          content: reader,
        },
      ],
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      try {
        // borra el archivo temporal pase lo que pase
        await fs.unlink(path).catch(() => {});
      } finally {
        if (error) {
          console.log(error);
          return res.status(500).send(error.message);
        }
        console.log("Email enviado");
        return res.status(200).json(info);
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
