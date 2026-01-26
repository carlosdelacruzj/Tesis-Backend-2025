// src/modules/portafolio/portafolio.repository.js
const pool = require("../../db");

async function runQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

const t = (value) =>
  typeof value === "string" ? value.trim() || null : value ?? null;

async function listEventos() {
  return runQuery(
    `SELECT
        PK_E_Cod AS id,
        E_Nombre AS nombre,
        E_IconUrl AS iconUrl,
        E_MostrarPortafolio AS mostrarPortafolio
     FROM T_Eventos
     ORDER BY E_Nombre`
  );
}

async function updateEventoMostrar({ id, mostrar }) {
  return runQuery(
    "UPDATE T_Eventos SET E_MostrarPortafolio = ? WHERE PK_E_Cod = ?",
    [Number(mostrar), Number(id)]
  );
}

async function listImagenes({ eventoId } = {}) {
  const params = [];
  let where = "";
  if (eventoId != null) {
    where = "WHERE FK_E_Cod = ?";
    params.push(Number(eventoId));
  }

  return runQuery(
    `SELECT
        PK_PI_Cod AS id,
        FK_E_Cod AS eventoId,
        PI_Url AS url,
        PI_Titulo AS titulo,
        PI_Descripcion AS descripcion,
        PI_Orden AS orden,
        PI_Fecha_Creacion AS fechaCreacion
     FROM T_PortafolioImagen
     ${where}
     ORDER BY PI_Orden, PK_PI_Cod`,
    params
  );
}

async function getImagenById(id) {
  const rows = await runQuery(
    `SELECT
        PK_PI_Cod AS id,
        FK_E_Cod AS eventoId,
        PI_Url AS url,
        PI_Titulo AS titulo,
        PI_Descripcion AS descripcion,
        PI_Orden AS orden,
        PI_Fecha_Creacion AS fechaCreacion
     FROM T_PortafolioImagen
     WHERE PK_PI_Cod = ?
     LIMIT 1`,
    [Number(id)]
  );
  return rows?.[0] || null;
}

async function createImagen({ eventoId, url, titulo, descripcion, orden }) {
  return runQuery(
    `INSERT INTO T_PortafolioImagen
      (FK_E_Cod, PI_Url, PI_Titulo, PI_Descripcion, PI_Orden)
     VALUES (?, ?, ?, ?, ?)`,
    [Number(eventoId), t(url), t(titulo), t(descripcion), Number(orden || 0)]
  );
}

async function updateImagen({
  id,
  eventoId,
  url,
  titulo,
  descripcion,
  orden,
}) {
  const fields = [];
  const params = [];

  if (eventoId !== undefined) {
    fields.push("FK_E_Cod = ?");
    params.push(Number(eventoId));
  }
  if (url !== undefined) {
    fields.push("PI_Url = ?");
    params.push(t(url));
  }
  if (titulo !== undefined) {
    fields.push("PI_Titulo = ?");
    params.push(t(titulo));
  }
  if (descripcion !== undefined) {
    fields.push("PI_Descripcion = ?");
    params.push(t(descripcion));
  }
  if (orden !== undefined) {
    fields.push("PI_Orden = ?");
    params.push(Number(orden || 0));
  }

  if (!fields.length) return { affectedRows: 0 };

  params.push(Number(id));
  const sql = `UPDATE T_PortafolioImagen SET ${fields.join(", ")} WHERE PK_PI_Cod = ?`;
  return runQuery(sql, params);
}

async function deleteImagen(id) {
  return runQuery("DELETE FROM T_PortafolioImagen WHERE PK_PI_Cod = ?", [
    Number(id),
  ]);
}

module.exports = {
  listEventos,
  updateEventoMostrar,
  listImagenes,
  getImagenById,
  createImagen,
  updateImagen,
  deleteImagen,
};
