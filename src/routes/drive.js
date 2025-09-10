// src/routes/drive.js
const { Router } = require("express");
const router = Router();

const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oath2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oath2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oath2Client });

/**
 * POST /upload-file
 * multipart/form-data con campo: file
 * Respuesta: { link: "<fileId>" }
 */
router.post("/upload-file", upload.single("file"), async (req, res, next) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: "Falta archivo (file)" });

  const { path, originalname, mimetype } = file;

  try {
    const response = await drive.files.create({
      requestBody: { name: originalname, mimeType: mimetype },
      media: { mimeType: mimetype, body: fs.createReadStream(path) },
    });

    return res.status(200).json({ link: response.data.id.toString() });
  } catch (error) {
    return next(error);
  } finally {
    try { fs.unlinkSync(path); } catch (_) {}
  }
});

module.exports = router;
