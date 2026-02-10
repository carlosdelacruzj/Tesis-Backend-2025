const service = require("./auth.service");

async function login(req, res, next) {
  try {
    const result = await service.login(req.body || {});
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function badRequest(msg) {
  const err = new Error(msg);
  err.status = 400;
  return err;
}

async function login(req, res, next) {
  try {
    const body = req.body || {};

    const correo = (body.correo || "").trim().toLowerCase();
    const contrasena = (body.contrasena || "").trim();

    if (!correo) throw badRequest("Campo 'correo' es requerido");
    if (correo.length > 254) throw badRequest("Campo 'correo' es inválido");
    if (!isEmail(correo)) throw badRequest("Campo 'correo' es inválido");

    if (!contrasena) throw badRequest("Campo 'contrasena' es requerido");

    const result = await service.login({ correo, contrasena });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


async function setPassword(req, res, next) {
  try {
    const result = await service.setPassword(req.body || {});
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  setPassword,
};
