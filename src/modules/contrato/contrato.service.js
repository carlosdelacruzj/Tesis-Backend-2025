const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const repo = require("./contrato.repository");
const pedidoRepo = require("../pedido/pedido.repository");
const { calcIgv } = require("../../utils/igv");
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
  return value == null ? "" : String(value).trim();
}

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sumTotal(items = []) {
  return (items || []).reduce((acc, it) => {
    const subtotal = Number(it?.subtotal);
    if (Number.isFinite(subtotal)) return acc + subtotal;
    const pu = Number(it?.precioUnit ?? 0);
    const qty = Number(it?.cantidad ?? 1);
    const desc = Number(it?.descuento ?? 0);
    const rec = Number(it?.recargo ?? 0);
    const base = (Number.isFinite(pu) ? pu : 0) * (Number.isFinite(qty) ? qty : 1);
    return acc + base - (Number.isFinite(desc) ? desc : 0) + (Number.isFinite(rec) ? rec : 0);
  }, 0);
}

function sortByStableJson(arr = []) {
  return [...arr].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}

function buildSnapshotFromPedidoDetail(detail = {}) {
  const pedido = detail?.pedido || {};
  const cliente = pedido?.cliente || {};
  const eventos = Array.isArray(detail?.eventos) ? detail.eventos : [];
  const items = Array.isArray(detail?.items) ? detail.items : [];
  const serviciosFechas = Array.isArray(detail?.serviciosFechas) ? detail.serviciosFechas : [];

  const lugarRaw = normalizeText(pedido?.lugar);
  const esLima = lugarRaw.toLowerCase() === "lima";
  const viaticosMonto = toNum(pedido?.viaticosMonto, 0);
  const viaticosAplicado = !esLima && viaticosMonto > 0 ? viaticosMonto : 0;
  const subtotalServicios = sumTotal(items);
  const { base: subtotal, igv, total } = calcIgv(subtotalServicios + viaticosAplicado);

  const snapshot = {
    pedido: {
      id: Number(pedido?.id || 0),
      codigo: pedido?.codigo || null,
      nombrePedido: normalizeText(pedido?.nombrePedido) || null,
      fechaCreacion: pedido?.fechaCreacion || null,
      fechaEvento: pedido?.fechaEvento || null,
      lugar: lugarRaw || null,
      dias: pedido?.dias != null ? Number(pedido.dias) : null,
      horasEstimadas: pedido?.horasEstimadas != null ? Number(pedido.horasEstimadas) : null,
      viaticosMonto: viaticosMonto,
      mensaje: normalizeText(pedido?.mensaje) || null,
      observaciones: normalizeText(pedido?.observaciones) || null,
    },
    cliente: {
      id: cliente?.id != null ? Number(cliente.id) : null,
      documento: normalizeText(cliente?.documento) || null,
      nombres: normalizeText(cliente?.nombres) || null,
      apellidos: normalizeText(cliente?.apellidos) || null,
      razonSocial: normalizeText(cliente?.razonSocial) || null,
      celular: normalizeText(cliente?.celular) || null,
      correo: normalizeText(cliente?.correo) || null,
      direccion: normalizeText(cliente?.direccion) || null,
    },
    eventos: sortByStableJson(
      eventos.map((e) => ({
        fecha: e?.fecha || null,
        hora: e?.hora || null,
        ubicacion: normalizeText(e?.ubicacion) || null,
        direccion: normalizeText(e?.direccion) || null,
        notas: normalizeText(e?.notas) || null,
      }))
    ),
    items: sortByStableJson(
      items.map((it) => ({
        idEventoServicio: it?.idEventoServicio ?? null,
        eventoId: it?.eventoId ?? null,
        servicioId: it?.servicioId ?? null,
        eventoCodigo: it?.eventoCodigo ?? null,
        nombre: normalizeText(it?.nombre) || null,
        descripcion: normalizeText(it?.descripcion) || null,
        moneda: normalizeText(it?.moneda || "USD").toUpperCase(),
        precioUnit: toNum(it?.precioUnit, 0),
        cantidad: toNum(it?.cantidad, 1),
        descuento: toNum(it?.descuento, 0),
        recargo: toNum(it?.recargo, 0),
        notas: normalizeText(it?.notas) || null,
        horas: it?.horas != null ? Number(it.horas) : null,
        personal: it?.personal != null ? Number(it.personal) : null,
        fotosImpresas: it?.fotosImpresas != null ? Number(it.fotosImpresas) : null,
        trailerMin: it?.trailerMin != null ? Number(it.trailerMin) : null,
        filmMin: it?.filmMin != null ? Number(it.filmMin) : null,
        subtotal: it?.subtotal != null ? Number(it.subtotal) : null,
      }))
    ),
    serviciosFechas: sortByStableJson(
      serviciosFechas.map((sf) => ({
        idPedidoServicio: sf?.idPedidoServicio ?? null,
        fecha: sf?.fecha || null,
      }))
    ),
    montos: {
      subtotalServicios,
      viaticosAplicado,
      subtotal,
      igv,
      total,
    },
  };

  return snapshot;
}

function hashSnapshot(snapshot) {
  const raw = JSON.stringify(snapshot);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function normalizeEstadoPedidoNombre(nombre) {
  return normalizeText(nombre).toLowerCase();
}

function isEstadoContratado(estadoPedidoNombre) {
  return normalizeEstadoPedidoNombre(estadoPedidoNombre) === "contratado";
}

async function syncVersionFromPedidoId(pedidoId, { force = false } = {}) {
  const id = assertPositiveId(pedidoId, "pedidoId");
  const estado = await pedidoRepo.getEstadoPedidoMetaById(id);
  if (!estado) throw badRequest(`Pedido ${id} no encontrado`, 404);
  if (!force && isEstadoContratado(estado.estadoPedidoNombre)) {
    return { created: false, reason: "pedido_contratado" };
  }

  const detail = await pedidoRepo.getById(id);
  if (!detail) throw badRequest(`Pedido ${id} no encontrado`, 404);

  const snapshot = buildSnapshotFromPedidoDetail(detail);
  const snapshotHash = hashSnapshot(snapshot);

  const vigente = await repo.getVigenteByPedidoId(id);
  if (vigente?.snapshotHash === snapshotHash) {
    return { created: false, reason: "sin_cambios", contratoId: Number(vigente.id), version: Number(vigente.version) };
  }

  const created = await repo.createVersionFromSnapshot({
    pedidoId: id,
    snapshotJson: JSON.stringify(snapshot),
    snapshotHash,
    estado: "BORRADOR",
  });
  return { created: true, ...created };
}

async function closeVigenteIfContratado(pedidoId) {
  const id = assertPositiveId(pedidoId, "pedidoId");
  const estado = await pedidoRepo.getEstadoPedidoMetaById(id);
  if (!estado) throw badRequest(`Pedido ${id} no encontrado`, 404);
  if (!isEstadoContratado(estado.estadoPedidoNombre)) return { closed: false, reason: "pedido_no_contratado" };
  const affected = await repo.closeVigenteByPedidoId(id);
  return { closed: affected > 0, affected };
}

function parseContratoRow(row) {
  if (!row) return null;
  let snapshot = row.snapshot ?? null;
  if (typeof snapshot === "string") {
    try {
      snapshot = JSON.parse(snapshot);
    } catch (_e) {
      snapshot = null;
    }
  }
  return {
    id: Number(row.id),
    pedidoId: Number(row.pedidoId),
    version: Number(row.version),
    estado: row.estado,
    link: row.link || null,
    pdfLink: row.pdfLink || null,
    snapshotHash: row.snapshotHash || null,
    esVigente: Number(row.esVigente) === 1,
    fechaCreacion: row.fechaCreacion || null,
    fechaCierre: row.fechaCierre || null,
    snapshot,
  };
}

function classifyItem(it) {
  const servicioNombre = normalizeText(it?.nombre).toLowerCase();
  const trailer = Number(it?.trailerMin ?? 0);
  const film = Number(it?.filmMin ?? 0);
  if (trailer > 0 || film > 0) return "video";
  if (servicioNombre.includes("video") || servicioNombre.includes("film")) return "video";
  return "foto";
}

function formatDateDMY(value) {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : s;
}

function money2(value) {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(safe);
}

function mapSnapshotToContratoTemplateData(snapshot = {}, overrides = {}) {
  const pedido = snapshot?.pedido || {};
  const cliente = snapshot?.cliente || {};
  const eventos = Array.isArray(snapshot?.eventos) ? snapshot.eventos : [];
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  const montos = snapshot?.montos || {};

  const fotoItems = [];
  const videoItems = [];
  for (const it of items) {
    const kind = classifyItem(it);
    if (kind === "video") videoItems.push(it);
    else fotoItems.push(it);
  }

  const hasFoto = fotoItems.length > 0;
  const hasVideo = videoItems.length > 0;

  let tituloContrato = "CONTRATO";
  let textoServicioContrato = "tomas fotograficas y video";
  if (hasFoto && hasVideo) {
    tituloContrato = "CONTRATO DE FOTOGRAFIA Y VIDEO";
    textoServicioContrato = "tomas fotograficas y video";
  } else if (hasFoto) {
    tituloContrato = "CONTRATO DE FOTOGRAFIA";
    textoServicioContrato = "tomas fotograficas";
  } else if (hasVideo) {
    tituloContrato = "CONTRATO DE VIDEO";
    textoServicioContrato = "tomas de video";
  }

  const contratanteNombre =
    normalizeText(`${cliente?.nombres || ""} ${cliente?.apellidos || ""}`) ||
    normalizeText(cliente?.razonSocial) ||
    "Cliente";
  const contratanteDoc = normalizeText(cliente?.documento) || "";
  const tipoEventoTitulo = normalizeText(pedido?.nombrePedido) || "EVENTO";

  const agenda = (eventos.length ? eventos : [null]).map((e) => {
    if (!e) return { item: "Fecha / hora / ubicacion por confirmar." };
    const fecha = formatDateDMY(e?.fecha);
    const hora = normalizeText(e?.hora);
    const ubi = normalizeText(e?.ubicacion);
    const dir = normalizeText(e?.direccion);
    const parts = [
      fecha && `Fecha: ${fecha}`,
      hora && `Hora: ${hora.slice(0, 5)}`,
      ubi && `Lugar: ${ubi}`,
      dir && `Direccion: ${dir}`,
    ].filter(Boolean);
    return { item: parts.join(" | ") || "Fecha / hora / ubicacion por confirmar." };
  });

  const itemsContrato = hasFoto && !hasVideo ? fotoItems : hasVideo && !hasFoto ? videoItems : items;
  const entregables = (itemsContrato.length ? itemsContrato : [null]).map((it) => {
    if (!it) return { item: "Entregables por confirmar." };
    const nombre = normalizeText(it?.nombre) || "Servicio";
    const desc = normalizeText(it?.descripcion);
    return { item: desc ? `${nombre} - ${desc}` : nombre };
  });

  const total = Number(montos?.total ?? 0);
  const totalSafe = Number.isFinite(total) ? total : 0;
  const adelantoRaw =
    overrides?.montoAdelanto != null ? Number(overrides.montoAdelanto) : totalSafe * 0.5;
  const adelanto = Number.isFinite(adelantoRaw) ? adelantoRaw : totalSafe * 0.5;
  const saldoRaw =
    overrides?.montoSaldo != null ? Number(overrides.montoSaldo) : totalSafe - adelanto;
  const saldo = Number.isFinite(saldoRaw) ? saldoRaw : totalSafe - adelanto;
  const condicionSaldo = normalizeText(overrides?.condicionSaldo) || "antes del evento";

  return {
    tituloContrato,
    tipoEventoTitulo,
    textoServicioContrato,
    mostrarFoto: hasFoto,
    mostrarVideo: hasVideo,
    contratanteNombre,
    contratanteDoc,
    agenda,
    entregables,
    montoTotal: money2(totalSafe),
    montoAdelanto: money2(adelanto),
    montoSaldo: money2(saldo),
    condicionSaldo,
  };
}

async function streamContratoPdfById({
  id,
  res,
  query = {},
} = {}) {
  const contratoId = assertPositiveId(id, "id");
  const row = await repo.getById(contratoId);
  if (!row) throw badRequest(`Contrato ${contratoId} no encontrado`, 404);
  const contrato = parseContratoRow(row);
  if (!contrato?.snapshot) {
    throw badRequest(`Contrato ${contratoId} no tiene snapshot`, 422);
  }

  const regenerate = ["1", "true", "yes"].includes(
    String(query?.regenerate ?? "").toLowerCase()
  );
  const existingLink = normalizeText(contrato.pdfLink);
  const existingAbsPath = existingLink
    ? path.join(process.cwd(), existingLink.replace(/^\/+/, ""))
    : null;

  if (!regenerate && existingAbsPath && fs.existsSync(existingAbsPath)) {
    const fileBuffer = fs.readFileSync(existingAbsPath);
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="contrato_${contrato.id}_v${contrato.version}.pdf"`
    );
    res.end(fileBuffer);
    return;
  }

  const templatePath = path.join(
    __dirname,
    "../../pdf/templates/current/contrato.docx"
  );
  const data = mapSnapshotToContratoTemplateData(contrato.snapshot, query);
  const pdfBuffer = await generatePdfBufferFromDocxTemplate({
    templatePath,
    data,
  });

  const uploadsDir = path.join(process.cwd(), "uploads", "contratos");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filename = `contrato_${contrato.id}_v${contrato.version}.pdf`;
  const absPath = path.join(uploadsDir, filename);
  fs.writeFileSync(absPath, pdfBuffer);

  const publicPath = `/uploads/contratos/${filename}`;
  await repo.updatePdfLinkById(contrato.id, publicPath);

  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.end(pdfBuffer);
}

async function findById(id) {
  const contratoId = assertPositiveId(id, "id");
  const row = await repo.getById(contratoId);
  if (!row) throw badRequest(`Contrato ${contratoId} no encontrado`, 404);
  return parseContratoRow(row);
}

async function listByPedidoId(pedidoId) {
  const id = assertPositiveId(pedidoId, "pedidoId");
  const rows = await repo.listByPedidoId(id);
  return rows.map((r) => parseContratoRow(r));
}

async function getVigenteByPedidoId(pedidoId) {
  const id = assertPositiveId(pedidoId, "pedidoId");
  const row = await repo.getVigenteByPedidoId(id);
  if (!row) return null;
  return parseContratoRow(row);
}

function toBoolOrNull(value) {
  if (value == null || value === "") return null;
  const v = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "si"].includes(v)) return true;
  if (["0", "false", "no"].includes(v)) return false;
  return null;
}

async function listGestion(query = {}) {
  const estado = normalizeText(query?.estado) || null;
  const vigente = toBoolOrNull(query?.vigente);
  const q = normalizeText(query?.q) || null;
  const historial = toBoolOrNull(query?.historial) === true;

  const rows = await repo.listGestion({
    estado: estado || null,
    vigente: vigente == null ? null : vigente ? 1 : 0,
    q,
    soloUltimaVersion: !historial,
  });

  return (rows || []).map((r) => {
    const nombreNatural = normalizeText(
      `${r?.clienteNombres || ""} ${r?.clienteApellidos || ""}`
    );
    return {
      contratoId: Number(r.contratoId),
      codigoContrato: `CON-${String(r.contratoId).padStart(6, "0")}`,
      pedidoId: Number(r.pedidoId),
      codigoPedido: `PED-${String(r.pedidoId).padStart(6, "0")}`,
      cliente:
        normalizeText(r.clienteRazonSocial) ||
        nombreNatural ||
        "Cliente",
      clienteDocumento: r.clienteDocumento || null,
      fechaContrato: r.fechaContrato || null,
      estadoPedidoId: r.estadoPedidoId != null ? Number(r.estadoPedidoId) : null,
      estadoPedidoNombre: r.estadoPedidoNombre || null,
      versionContrato: r.versionContrato != null ? Number(r.versionContrato) : null,
      estadoContrato: r.estadoContrato || null,
      esVigente: Number(r.esVigente) === 1,
      pdfLink: r.pdfLink || null,
    };
  });
}

module.exports = {
  isEstadoContratado,
  syncVersionFromPedidoId,
  closeVigenteIfContratado,
  findById,
  listByPedidoId,
  getVigenteByPedidoId,
  streamContratoPdfById,
  listGestion,
};
