const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const repo = require("./cotizacion_version.repository");
const cotizacionRepo = require("../cotizacion/cotizacion.repository");
const { generatePdfBufferFromDocxTemplate } = require("../../pdf/wordToPdf");

function badRequest(msg, code = 400) {
  const e = new Error(msg);
  e.status = code;
  return e;
}

function assertPositiveId(value, name = "id") {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) throw badRequest(`${name} invalido`);
  return n;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function isEstadoFinal(estadoNombre) {
  const v = normalizeText(estadoNombre).toLowerCase();
  return v === "aceptada" || v === "rechazada" || v === "expirada";
}

function sortByStableJson(arr = []) {
  return [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function stableSnapshot(detail = {}, estadoNombre = null, templateData = null) {
  const cot = detail?.cotizacion || {};
  const contacto = detail?.contacto || {};
  const eventos = Array.isArray(detail?.eventos) ? detail.eventos : [];
  const items = Array.isArray(detail?.items) ? detail.items : [];
  const serviciosFechas = Array.isArray(detail?.serviciosFechas) ? detail.serviciosFechas : [];

  return {
    estadoCotizacion: estadoNombre || null,
    cotizacion: {
      id: Number(cot?.idCotizacion || cot?.id || 0),
      tipoEvento: cot?.tipoEvento || null,
      idTipoEvento: cot?.idTipoEvento ?? null,
      fechaEvento: cot?.fechaEvento || null,
      lugar: cot?.lugar || null,
      horasEstimadas: cot?.horasEstimadas ?? null,
      dias: cot?.dias ?? null,
      viaticosMonto: cot?.viaticosMonto ?? null,
      mensaje: cot?.mensaje || null,
      fechaCreacion: cot?.fechaCreacion || null,
      estado: cot?.estado || null,
    },
    contacto: {
      nombre: contacto?.nombre || null,
      nombreContacto: contacto?.nombreContacto || null,
      razonSocial: contacto?.razonSocial || null,
      tipoDocumento: contacto?.tipoDocumento || null,
      numeroDocumento: contacto?.numeroDocumento || null,
      celular: contacto?.celular || null,
      correo: contacto?.correo || null,
      direccion: contacto?.direccion || null,
    },
    eventos: sortByStableJson(
      eventos.map((e) => ({
        fecha: e?.fecha || null,
        hora: e?.hora || null,
        ubicacion: e?.ubicacion || null,
        direccion: e?.direccion || null,
        notas: e?.notas || null,
      }))
    ),
    items: sortByStableJson(
      items.map((it) => ({
        idCotizacionServicio: it?.idCotizacionServicio ?? null,
        idEventoServicio: it?.idEventoServicio ?? null,
        eventoId: it?.eventoId ?? null,
        servicioId: it?.servicioId ?? null,
        nombre: it?.nombre || null,
        descripcion: it?.descripcion || null,
        moneda: it?.moneda || null,
        precioUnit: it?.precioUnit ?? null,
        cantidad: it?.cantidad ?? null,
        descuento: it?.descuento ?? null,
        recargo: it?.recargo ?? null,
        notas: it?.notas || null,
        horas: it?.horas ?? null,
        personal: it?.personal ?? null,
        fotosImpresas: it?.fotosImpresas ?? null,
        trailerMin: it?.trailerMin ?? null,
        filmMin: it?.filmMin ?? null,
        subtotal: it?.subtotal ?? null,
      }))
    ),
    serviciosFechas: sortByStableJson(
      serviciosFechas.map((sf) => ({
        idCotizacionServicio: sf?.idCotizacionServicio ?? null,
        fecha: sf?.fecha || null,
      }))
    ),
    templateData: templateData || null,
  };
}

function hashSnapshot(snapshot) {
  return crypto.createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}

function parseRow(row) {
  if (!row) return null;
  let snapshot = row.snapshot ?? null;
  if (typeof snapshot === "string") {
    try {
      snapshot = JSON.parse(snapshot);
    } catch (_err) {
      snapshot = null;
    }
  }
  return {
    id: Number(row.id),
    cotizacionId: Number(row.cotizacionId),
    version: Number(row.version),
    estado: row.estado,
    snapshotHash: row.snapshotHash || null,
    esVigente: Number(row.esVigente) === 1,
    fechaCreacion: row.fechaCreacion || null,
    fechaCierre: row.fechaCierre || null,
    pdfLink: row.pdfLink || null,
    snapshot,
  };
}

async function buildDetailWithServiciosFechas(cotizacionId) {
  const detail = await cotizacionRepo.findByIdWithItems(Number(cotizacionId));
  if (!detail) throw badRequest(`Cotizacion ${cotizacionId} no encontrada`, 404);
  const serviciosFechas = await cotizacionRepo.listServiciosFechasByCotizacionId(Number(cotizacionId));
  detail.serviciosFechas = Array.isArray(serviciosFechas) ? serviciosFechas : [];
  return detail;
}

async function syncVersionFromCotizacionId(
  cotizacionId,
  { force = false, mapTemplateData } = {}
) {
  const id = assertPositiveId(cotizacionId, "cotizacionId");
  const estadoInfo = await cotizacionRepo.getFechaYEstado(id);
  if (!estadoInfo) throw badRequest(`Cotizacion ${id} no encontrada`, 404);

  if (!force && isEstadoFinal(estadoInfo.estado)) {
    return { created: false, reason: "estado_final" };
  }

  const detail = await buildDetailWithServiciosFechas(id);
  const templateData =
    typeof mapTemplateData === "function" ? mapTemplateData(detail) : null;
  const snapshot = stableSnapshot(detail, estadoInfo.estado, templateData);
  const snapshotHash = hashSnapshot(snapshot);

  const vigente = await repo.getVigenteByCotizacionId(id);
  if (vigente?.snapshotHash === snapshotHash) {
    return {
      created: false,
      reason: "sin_cambios",
      versionId: Number(vigente.id),
      version: Number(vigente.version),
    };
  }

  const created = await repo.createVersionFromSnapshot({
    cotizacionId: id,
    snapshotJson: JSON.stringify(snapshot),
    snapshotHash,
    estado: "BORRADOR",
  });
  return { created: true, ...created };
}

async function closeVigenteIfFinalState(cotizacionId) {
  const id = assertPositiveId(cotizacionId, "cotizacionId");
  const estadoInfo = await cotizacionRepo.getFechaYEstado(id);
  if (!estadoInfo) throw badRequest(`Cotizacion ${id} no encontrada`, 404);
  if (!isEstadoFinal(estadoInfo.estado)) return { closed: false, reason: "estado_no_final" };
  const affected = await repo.closeVigenteByCotizacionId(id);
  return { closed: affected > 0, affected };
}

async function listByCotizacionId(cotizacionId) {
  const id = assertPositiveId(cotizacionId, "cotizacionId");
  const rows = await repo.listByCotizacionId(id);
  return rows.map(parseRow);
}

async function getVigenteByCotizacionId(cotizacionId) {
  const id = assertPositiveId(cotizacionId, "cotizacionId");
  const row = await repo.getVigenteByCotizacionId(id);
  return row ? parseRow(row) : null;
}

async function findById(versionId) {
  const id = assertPositiveId(versionId, "versionId");
  const row = await repo.getById(id);
  if (!row) throw badRequest(`Version ${id} no encontrada`, 404);
  return parseRow(row);
}

async function streamPdfByVersionId({ versionId, res, query = {} } = {}) {
  const version = await findById(versionId);
  const regenerate = ["1", "true", "yes"].includes(
    String(query?.regenerate || "").toLowerCase()
  );

  const existingLink = normalizeText(version?.pdfLink);
  const existingAbsPath = existingLink
    ? path.join(process.cwd(), existingLink.replace(/^\/+/, ""))
    : null;
  if (!regenerate && existingAbsPath && fs.existsSync(existingAbsPath)) {
    const fileBuffer = fs.readFileSync(existingAbsPath);
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="cotizacion_v${version.version}_${version.id}.pdf"`
    );
    res.end(fileBuffer);
    return;
  }

  const templateData = version?.snapshot?.templateData;
  if (!templateData || typeof templateData !== "object") {
    throw badRequest(
      `La version ${version.id} no tiene templateData para generar PDF`,
      422
    );
  }

  const templatePath = path.join(
    process.cwd(),
    "src",
    "pdf",
    "templates",
    "current",
    "cotizacion.docx"
  );

  const pdfBuffer = await generatePdfBufferFromDocxTemplate({
    templatePath,
    data: templateData,
  });

  const outDir = path.join(process.cwd(), "uploads", "cotizaciones-versiones");
  fs.mkdirSync(outDir, { recursive: true });
  const fileName = `cotizacion_version_${version.id}_v${version.version}.pdf`;
  const absPath = path.join(outDir, fileName);
  fs.writeFileSync(absPath, pdfBuffer);

  const publicPath = `/uploads/cotizaciones-versiones/${fileName}`;
  await repo.updatePdfLinkById(version.id, publicPath);

  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
  res.end(pdfBuffer);
}

module.exports = {
  isEstadoFinal,
  syncVersionFromCotizacionId,
  closeVigenteIfFinalState,
  listByCotizacionId,
  getVigenteByCotizacionId,
  findById,
  streamPdfByVersionId,
};
