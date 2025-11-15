// src/modules/lead/lead.repository.js
const pool = require("../../db");

/**
 * Trim helper: string -> trimmed; others -> null if undefined, else value
 */
const t = (v) => (typeof v === "string" ? v.trim() : v ?? null);

/**
 * Convierte un lead en cliente invocando el SP:
 *   sp_lead_convertir_cliente(
 *     IN p_lead_id, IN p_correo, IN p_celular, IN p_nombre, IN p_apellido,
 *     IN p_num_doc, IN p_direccion, IN p_tipo_cliente, IN p_estado_cliente,
 *     OUT o_usuario_id, OUT o_cliente_id, OUT o_usuario_accion, OUT o_cliente_accion
 *   )
 *
 * @param {Object} p
 * @param {number} p.leadId                 - ID del lead (obligatorio)
 * @param {string} p.correo                 - Correo del usuario (obligatorio si se crea)
 * @param {string} [p.celular]              - Celular; si no viene, el SP usa el del lead
 * @param {string} [p.nombre]
 * @param {string} [p.apellido]
 * @param {string} [p.numDoc]               - DNI(8) o RUC(11); requerido si se crea usuario
 * @param {string} [p.direccion]
 * @param {number} [p.tipoCliente]          - Puede ser null
 * @param {number} p.estadoCliente          - FK a T_Estado_Cliente (obligatorio)
 * @returns {Promise<{usuarioId:number, clienteId:number, usuarioAccion:'CREADO'|'REUSADO', clienteAccion:'CREADO'|'REUSADO'}>}
 */
async function convertirACliente({
  leadId,
  correo,
  celular,
  nombre,
  apellido,
  numDoc,
  direccion,
  tipoCliente,
  estadoCliente,
}) {
  const conn = await pool.getConnection();
  try {
    // Validaciones mínimas (repo-level)
    if (!Number.isFinite(Number(leadId))) {
      throw new Error("[lead.repo] convertirACliente: leadId inválido");
    }
    if (!t(correo)) {
      throw new Error("[lead.repo] convertirACliente: correo es requerido");
    }
    if (!Number.isFinite(Number(estadoCliente))) {
      throw new Error("[lead.repo] convertirACliente: estadoCliente es requerido");
    }

    // Inicializa variables de salida en la misma sesión/conn
    await conn.query(
      "SET @o_usuario_id=NULL, @o_cliente_id=NULL, @o_usuario_accion=NULL, @o_cliente_accion=NULL"
    );

    // Ejecuta el SP (misma conexión para conservar @vars)
    await conn.query(
      "CALL sp_lead_convertir_cliente(?,?,?,?,?,?,?,?,?, @o_usuario_id, @o_cliente_id, @o_usuario_accion, @o_cliente_accion)",
      [
        Number(leadId),
        t(correo),
        t(celular),
        t(nombre),
        t(apellido),
        t(numDoc),
        t(direccion),
        Number.isFinite(Number(tipoCliente)) ? Number(tipoCliente) : null,
        Number(estadoCliente),
      ]
    );

    // Lee las variables de salida
    const [outRows] = await conn.query(
      "SELECT @o_usuario_id AS usuarioId, @o_cliente_id AS clienteId, @o_usuario_accion AS usuarioAccion, @o_cliente_accion AS clienteAccion"
    );

    const out = Array.isArray(outRows) && outRows[0] ? outRows[0] : {};
    // Normaliza tipos
    return {
      usuarioId: Number(out.usuarioId ?? 0),
      clienteId: Number(out.clienteId ?? 0),
      usuarioAccion: String(out.usuarioAccion || ""),
      clienteAccion: String(out.clienteAccion || ""),
    };
  } catch (err) {
    // Propaga con contexto. Nota: SQLSTATE 45000 suele mapear a errno 1644.
    err.message = `[lead.repo] convertirACliente: ${err.message}`;
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  convertirACliente,
};
