const jwt = require("jsonwebtoken");
const repo = require("./auth.repository");
const { hashPassword } = require("../../utils/password");
const { getLimaDateTimeString } = require("../../utils/dates");

function assertString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    const err = new Error(`Campo '${field}' es requerido`);
    err.status = 400;
    throw err;
  }
}

async function login({ correo, contrasena }) {
  assertString(correo, "correo");
  assertString(contrasena, "contrasena");

  const user = await repo.findByCorreo(correo);
  if (!user?.contrasenaHash) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const incomingHash = hashPassword(contrasena);
  if (incomingHash !== user.contrasenaHash) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  if (user.empleadoId && Number(user.permiteLogin) !== 1) {
    const err = new Error("Este empleado no tiene permisos de acceso");
    err.status = 403;
    throw err;
  }

  const payload = {
    sub: user.usuarioId,
    email: user.correo,
    clienteId: user.clienteId ?? null,
    empleadoId: user.empleadoId ?? null,
    tipoEmpleado: user.tipoEmpleado ?? null,
  };

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "my_secret_key",
    { expiresIn: "8h" }
  );

  return {
    token,
    usuario: {
      id: user.usuarioId,
      clienteId: user.clienteId ?? null,
      correo: user.correo,
      nombres: user.nombres ?? null,
      apellidos: user.apellidos ?? null,
      empleadoId: user.empleadoId ?? null,
      tipoEmpleado: user.tipoEmpleado ?? null,
    },
  };
}

async function setPassword({ correo, contrasena }) {
  assertString(correo, "correo");
  assertString(contrasena, "contrasena");

  const user = await repo.findByCorreo(correo);
  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  const hash = hashPassword(contrasena);
  const updated = await repo.updatePasswordByCorreo(
    correo,
    hash,
    getLimaDateTimeString()
  );

  if (!updated) {
    const err = new Error("No se pudo actualizar la contraseña");
    err.status = 500;
    throw err;
  }

  return {
    message: "Contraseña actualizada",
    usuarioId: user.usuarioId,
    correo: user.correo,
  };
}

module.exports = {
  login,
  setPassword,
};
