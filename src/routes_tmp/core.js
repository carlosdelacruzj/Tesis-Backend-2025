const express = require("express");

const router = express.Router();

const pool = require("../database");

const jwt = require("jsonwebtoken");

var { google } = require("googleapis");
var request = require("request");

var MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
var SCOPES = [MESSAGING_SCOPE];

const multer = require("multer");

const { sendEmail } = require("./mail");

const { driveService } = require("./drive");

const { validacionCorreo } = require("./validacionCorreo");

const fs = require("fs");
//const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oath2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oath2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oath2Client });

const upload = multer({ dest: "uploads/" });

/*
EN ESE DOCUMENTO IRA TODO LO RELACIONADO CON ACCIONES DE SEGURIDAD, NOPTIFICACIONES Y ETC 
*/

router.post("/postEmpleado2", upload.single("file"), async (req, res, next) => {
  const { nombre, apellido, correo, celular, doc, direccion, autonomo, cargo } =
    req.body;

  const { path, originalname, mimetype } = req.file;

  try {
    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: fs.createReadStream(path),
      },
    });

    var idImagen = response.data.id.toString();

    var link = "https://drive.google.com/uc?export=view&id=" + idImagen;

    await drive.permissions.create({
      fileId: idImagen,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    console.log("hola");
    const result = await drive.files.get({
      fileId: idImagen,
      fields: "webViewLink, webContentLink",
    });
    console.log(result);

    const query = "call SP_postEmpleado2(?,?,?,?,?,?,?,?,?)";

    pool.query(
      query,
      [
        nombre,
        apellido,
        correo,
        celular,
        doc,
        direccion,
        autonomo,
        cargo,
        link,
      ],
      (err, _rows, fields) => {
        if (!err) {
          res.status(201).json({ Status: "Registro exitoso" });
        } else {
          res.json(err);
        }
      }
    );
  } catch (error) {
    next(error);
  } finally {
    fs.unlinkSync(path);
  }
});

router.post(
  "/postVerificarllegada",
  upload.single("file"),
  async (req, res, next) => {
    const { id, fecha, hora, proyecto } = req.body;

    const { path, originalname, mimetype } = req.file;

    try {
      const response = await drive.files.create({
        requestBody: {
          name: originalname,
          mimeType: mimetype,
        },
        media: {
          mimeType: mimetype,
          body: fs.createReadStream(path),
        },
      });

      var idImagen = response.data.id.toString();

      var link = "https://drive.google.com/uc?export=view&id=" + idImagen;

      await drive.permissions.create({
        fileId: idImagen,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });
      console.log("hola");
      const result = await drive.files.get({
        fileId: idImagen,
        fields: "webViewLink, webContentLink",
      });
      console.log(result);

      const query = "call SP_postVerificarllegada(?,?,?,?,?)";

      pool.query(
        query,
        [id, fecha, hora, proyecto, link],
        (err, _rows, fields) => {
          if (!err) {
            res.status(201).json({ Status: "Registro exitoso" });
          } else {
            res.json(err);
          }
        }
      );
    } catch (error) {
      next(error);
    } finally {
      fs.unlinkSync(path);
    }
  }
);

router.post("/postVoucher", upload.single("file"), async (req, res, next) => {
  const { monto, metodoPago, estadoVoucher, idPedido, fechaRegistro } =
    req.body;

  const { path, originalname, mimetype } = req.file;

  try {
    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: fs.createReadStream(path),
      },
    });
    var idImagen = response.data.id.toString();
    var imagen = "https://drive.google.com/uc?export=view&id=" + idImagen;

    await drive.permissions.create({
      fileId: idImagen,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: idImagen,
      fields: "webViewLink, webContentLink",
    });
    console.log(result);

    const query = "call SP_postVoucher(?,?,?,?,?,?)";

    pool.query(
      query,
      [monto, metodoPago, estadoVoucher, imagen, idPedido, fechaRegistro],
      (err, _rows, fields) => {
        if (!err) {
          res.status(201).json({ Status: "Registro exitoso" });
        } else {
          res.json(err);
        }
      }
    );
  } catch (error) {
    next(error);
    //res.status(500).send(error.message);
  } finally {
    fs.unlinkSync(path);
  }
});

router.post("/postContrato", upload.single("file"), async (req, res, next) => {
  const { pedido, fecha } = req.body;

  const { path, originalname, mimetype } = req.file;

  try {
    const response = await drive.files.create({
      requestBody: {
        name: originalname,
        mimeType: mimetype,
      },
      media: {
        mimeType: mimetype,
        body: fs.createReadStream(path),
      },
    });

    var idImagen = response.data.id.toString();

    var link = "https://drive.google.com/uc?export=view&id=" + idImagen;

    await drive.permissions.create({
      fileId: idImagen,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: idImagen,
      fields: "webViewLink, webContentLink",
    });
    console.log(result);

    const query = "call SP_postContrato(?,?,?)";

    pool.query(query, [link, pedido, fecha], (err, _rows, fields) => {
      if (!err) {
        res.status(201).json({ Status: "Registro exitoso" });
      } else {
        res.json(err);
      }
    });
  } catch (error) {
    next(error);
  } finally {
    fs.unlinkSync(path);
  }
});

/**
 * @swagger
 * /loginTrabajador:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: login
 *      description: login
 *      schema:
 *        type: object
 *        required:
 *          - correo
 *        properties:
 *          correo:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/loginTrabajador", async (req, res, next) => {
  const { correo, password } = req.body;

  await pool.query(
    "SELECT * FROM t_empleados INNER JOIN t_usuario on FK_U_Cod = PK_U_Cod INNER JOIN t_cargo ON FK_Car_Cod = PK_Car_Cod WHERE U_Correo = ?",
    [correo],
    async (err, rows, fields) => {
      if (err) {
        res.sendStatus(404);
      } else {
        const datos = rows[0];
        console.log(rows[0]);
        if (rows[0] === undefined) {
          res.json({ Status: "El correo es inválido" });
        } else {
          await pool.query(
            "select U_Numero_Documento , U_Correo, U_Contrasena from t_empleados INNER JOIN t_usuario on FK_U_Cod = PK_U_Cod  where U_Correo=? and U_Contrasena=?",
            [correo, password],
            (err, rows, fields) => {
              if (rows[0] === undefined) {
                res.json({ Status: "La contraseña es inválida" });
              } else {
                const user = rows[0];
                let token;
                token = jwt.sign({ user }, "my_secret_key", {
                  expiresIn: 60 * 60 * 24,
                });
                console.log(datos.tipoUsuarioId);
                res.json({
                  datos,
                  token,
                });
                next();
              }
            }
          );
        }
      }
    }
  );
});

/**
 * @swagger
 * /loginAdmin:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: login
 *      description: login
 *      schema:
 *        type: object
 *        required:
 *          - correo
 *        properties:
 *          correo:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/loginAdmin", async (req, res, next) => {
  const { correo, password } = req.body;

  await pool.query(
    " SELECT * FROM t_permisos INNER JOIN t_usuario on FK_U_Cod = PK_U_Cod INNER JOIN t_rol ON FK_Rol_Cod = PK_Rol_Cod WHERE U_Correo = ?  ",
    [correo],
    async (err, rows, fields) => {
      if (err) {
        res.sendStatus(404);
      } else {
        const datos = rows[0];
        console.log(rows[0]);
        if (rows[0] === undefined) {
          res.json({ Status: "El correo es inválido" });
        } else {
          await pool.query(
            "select U_Numero_Documento , U_Correo, U_Contrasena from t_permisos INNER JOIN t_usuario on FK_U_Cod = PK_U_Cod  where U_Correo=? and U_Contrasena=?",
            [correo, password],
            (err, rows, fields) => {
              if (rows[0] === undefined) {
                res.json({ Status: "La contraseña es inválida" });
              } else {
                const user = rows[0];
                let token;
                token = jwt.sign({ user }, "my_secret_key", {
                  expiresIn: 60 * 60 * 24,
                });
                console.log(datos.tipoUsuarioId);
                res.json({
                  datos,
                  token,
                });
                next();
              }
            }
          );
        }
      }
    }
  );
});

/**
 * @swagger
 * /enviarNotificacion:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: header
 *      name: Authorization
 *      type: string
 *      required: true
 *    - in: body
 *      name: notificacion
 *      description: enviar notificacion
 *      schema:
 *        type: object
 *        required:
 *          - token
 *        properties:
 *          title:
 *            type: string
 *          body:
 *            type: string
 *          token:
 *            type: string
 *          data:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/enviarNotificacion", function (req, res) {
  getAccesToken().then(function (access_token) {
    var title = req.body.title;
    var body = req.body.body;
    var token = req.body.token;

    var data = req.body.data;
    request.post(
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
        url: "https://fcm.googleapis.com/v1/projects/tp2021-services/messages:send",
        body: JSON.stringify({
          message: {
            token: token,
            notification: {
              body: body,
              title: title,
            },

            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              data: data,
            },
          },
        }),
      },
      function (error, response, body) {
        res.end(body);
        console.log(body);
      }
    );
  });
});

/**
 * @swagger
 * /refrescartokenEmpleado:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: refrescartoken
 *      description: refresca el token
 *      schema:
 *        type: object
 *        required:
 *          - token
 *        properties:
 *          token:
 *            type: string
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/refrescartokenEmpleado", async (req, res, next) => {
  const { token } = req.body;
  const querypasao = "select * from t_empleado where Em_token=?";
  const query =
    "select PK_Em_Cod , U_Correo , U_Contrasena from t_empleados inner join t_usuario on FK_U_Cod = PK_U_Cod where Em_token = ? ";

  await pool.query(querypasao, [token], async (err, rows, fields) => {
    const datos = rows[0];
    if (!err) {
      await pool.query(query, [token], async (err, rows, fields) => {
        if (!err) {
          if (rows[0] === undefined) {
            res.json({ Status: "El token no existe" });
          } else {
            const user = rows[0];
            console.log(rows[0]);
            let newtoken;

            newtoken = jwt.sign({ user }, "my_secret_key", {
              expiresIn: 60 * 60 * 24,
            });

            const id = rows[0].empleado_dni;
            const query2 =
              "CALL registrartoken(" + newtoken + "," + rows[0].FK_U_Cod + ")";
            res.json({
              newtoken,
              id,
            });
            next();
          }
        } else {
          res.json(err);
        }
      });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /registrartokenCell:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: registrartokenCell
 *      description: registra el token
 *      schema:
 *        type: object
 *        required:
 *          - tokenCell
 *        properties:
 *          tokenCell:
 *            type: string
 *          id:
 *            type: integer
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/registrartokenCell", async (req, res) => {
  const { tokenCell, id } = req.body;
  const query = "CALL registrartokenCell(?,?)";

  await pool.query(query, [tokenCell, id], (err, rows, fields) => {
    if (!err) {
      res.json({ Status: "Actualizacion exitosa" });
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /token/{id}:
 *  get:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: header
 *      name: Authorization
 *      type: string
 *      required: true
 *    - in: path
 *      name: id
 *      required: false
 *      type: string
 *    description: Use to request all prueba
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.get("/token/:id", async (req, res) => {
  const { id } = req.params;

  const query = "CALL obtenerToken(?)";
  await pool.query(query, [id], (err, rows, fields) => {
    if (!err) {
      res.json(rows[0]);
    } else {
      res.json(err);
    }
  });
});

/**
 * @swagger
 * /registrartokenEmpleado:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: tokens
 *      description: actualizar token usuario
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          newtoken:
 *            type: string
 *          id:
 *            type: string
 *    responses:
 *      '202':
 *        description: Accepted
 */
router.put("/registrartokenEmpleado", async (req, res) => {
  const { newtoken, id } = req.body;
  const query = "CALL registrarToken(?,?)";
  await pool.query(query, [newtoken, id], (err, rows, fields) => {
    if (!err) {
      res.sendStatus(202);
    } else {
      console.log(err);
    }
  });
});

/**
 * @swagger
 * /registrartokenAdmin:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: tokens
 *      description: actualizar token usuario
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          newtoken:
 *            type: string
 *          id:
 *            type: string
 *    responses:
 *      '202':
 *        description: Accepted
 */
router.put("/registrartokenAdmin", async (req, res) => {
  const { newtoken, id } = req.body;
  const query = "CALL registrarTokenAdmin(?,?)";
  await pool.query(query, [newtoken, id], (err, rows, fields) => {
    if (!err) {
      res.sendStatus(202);
    } else {
      console.log(err);
    }
  });
});

//////////////////// CELULAR ///////////////////////////////////////////////////////

/**
 * @swagger
 * /actualizartokenEmpleado:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: tokens
 *      description: actualizar token usuario
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          newtoken:
 *            type: string
 *          id:
 *            type: string
 *    responses:
 *      '202':
 *        description: Accepted
 */
router.put("/actualizartokenEmpleado", async (req, res) => {
  const { newtoken, id } = req.body;
  const query = "CALL actualizartokenEmpleado(?,?)";
  await pool.query(query, [newtoken, id], (err, rows, fields) => {
    if (!err) {
      res.sendStatus(202);
    } else {
      console.log(err);
    }
  });
});

/**
 * @swagger
 * /actualizartokenAdmin:
 *  put:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: tokens
 *      description: actualizar token usuario
 *      schema:
 *        type: object
 *        required:
 *          - id
 *        properties:
 *          newtoken:
 *            type: string
 *          id:
 *            type: string
 *    responses:
 *      '202':
 *        description: Accepted
 */
router.put("/actualizartokenAdmin", async (req, res) => {
  const { newtoken, id } = req.body;
  const query = "CALL actualizartokenAdmin(?,?)";
  await pool.query(query, [newtoken, id], (err, rows, fields) => {
    if (!err) {
      res.sendStatus(202);
    } else {
      console.log(err);
    }
  });
});

/**
 * @swagger
 * /validacionCorreo:
 *  post:
 *    consumes:
 *     - application/json
 *    tags:
 *    - core
 *    parameters:
 *    - in: body
 *      name: registratoken
 *      description: registra el token
 *      schema:
 *        type: object
 *        required:
 *          - email
 *        properties:
 *          email:
 *            type: string
 *            format: email
 *          fechaActual:
 *            type: stromg
 *            format: date-time
 *    responses:
 *      '201':
 *        description: Created
 */
router.post("/validacionCorreo", validacionCorreo);

router.post("/send-email", upload.single("file"), sendEmail);

router.post("/upload-file", upload.single("file"), driveService);

function getAccesToken() {
  return new Promise(function (resolve, reject) {
    var key = require("../service-account.json");
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
getAccesToken().then(function (access_token) {
  console.log(access_token);
});

module.exports = router;
