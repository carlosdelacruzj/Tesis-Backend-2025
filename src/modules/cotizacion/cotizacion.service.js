const repo = require("./cotizacion.repository");
const { generarCotizacionPdf } = require("../../pdf/cotizacion");
const { generarCotizacionPdfV2 } = require("../../pdf/cotizacion_v2");
const { formatCodigo } = require("../../utils/codigo");
const { getLimaDate, getLimaISODate } = require("../../utils/dates");

const ESTADOS_VALIDOS = new Set(["Borrador", "Enviada", "Aceptada", "Rechazada"]);
const ESTADOS_ABIERTOS = new Set(["Borrador", "Enviada"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ utils â”€â”€â”€â”€â”€â”€â”€â”€â”€
function badRequest(message){ const err=new Error(message); err.status=400; return err; }
function assertPositiveInt(v,f){ const n=Number(v); if(!Number.isInteger(n)||n<=0) throw badRequest(`${f} invÃ¡lido`); return n; }
function assertString(v,f){ if(typeof v!=="string"||!v.trim()) throw badRequest(`Campo '${f}' es requerido`); return v.trim(); }
function assertDate(v,f){ if(v==null) return null; if(typeof v!=="string"||!ISO_DATE.test(v)) throw badRequest(`Campo '${f}' debe ser YYYY-MM-DD`); return v; }
function assertEstado(v){ if(v==null) return "Borrador"; const e=String(v).trim(); if(!ESTADOS_VALIDOS.has(e)) throw badRequest(`estado invÃ¡lido. Valores permitidos: ${[...ESTADOS_VALIDOS].join(", ")}`); return e; }

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ repo passthrough â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function findById(id){
  await rechazarVencidasLocal();
  const n = assertPositiveInt(id,"id");
  const data = await repo.findByIdWithItems(n);
  if(!data){ const err=new Error(`CotizaciÃ³n ${n} no encontrada`); err.status=404; throw err; }
  if(!Array.isArray(data.eventos)) data.eventos = [];
  if(Array.isArray(data.items)){
    data.items = data.items.map((it)=>{
      if(!it||typeof it!=="object") return it;
      return {
        ...it,
        eventoId: it.eventoId==null||it.eventoId===""?null:it.eventoId,
        servicioId: it.servicioId==null||it.servicioId===""?null:it.servicioId,
        eventoServicio: it.eventoServicio ?? null,
      };
    });
  }
  return data;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ STREAM PDF â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toBullets(desc) {
  if (!desc) return [];
  return String(desc)
    .split(/\r?\n|â—|- |â€¢|Â·|\u2022|\. /)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseLocalDate(value) {
  if (!value) return null;
  if (typeof value === "string" && ISO_DATE.test(value.trim())) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d); // evita desfase de -1 dÃ­a en zonas horarias negativas
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function rechazarVencidasLocal() {
  await repo.rechazarVencidas(getLimaISODate());
}

function isOnOrBefore(date, ref) {
  return date.getTime() <= ref.getTime();
}

function isEditableFechaEvento(fechaEvento) {
  const date = parseLocalDate(fechaEvento);
  if (!date) return true;
  return !isOnOrBefore(date, getLimaDate());
}

function isAceptableFechaEvento(fechaEvento) {
  const date = parseLocalDate(fechaEvento);
  if (!date) return true;
  const tomorrow = new Date(getLimaDate());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getTime() >= tomorrow.getTime();
}
function formatDateDetail(value) {
  if (!value) return "";
  const date = parseLocalDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateLong(value) {
  if (!value) return "";
  const date = parseLocalDate(value);
  if (!date) return String(value);
  const parts = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  if (!day || !month || !year) {
    return new Intl.DateTimeFormat("es-PE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }
  const prettyMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${prettyMonth} ${day}, ${year}`;
}

function uniqueJoin(values = [], joiner = " - ") {
  const uniq = [];
  for (const raw of values) {
    const str = String(raw ?? "").trim();
    if (str && !uniq.includes(str)) uniq.push(str);
  }
  return uniq.join(joiner);
}

async function streamPdf({ id, res, body, query } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");

  const detail = await repo.findByIdWithItems(cotizacionId);
  if (!detail) { const err = new Error(`CotizaciÃ³n ${cotizacionId} no encontrada`); err.status = 404; throw err; }
  if (!Array.isArray(detail.eventos)) detail.eventos = [];

  // Normaliza items segÃºn esquema actual del SP
  const rawItems = Array.isArray(detail.items) ? detail.items : [];
  const norm = rawItems.map((it) => {
    const titulo = String(it.nombre || "").trim();
    const descripcion = String(it.descripcion || "").trim();
    const moneda = String(it.moneda || "USD").toUpperCase();

    const cantidadNum = Number(it.cantidad);
    const precioUnitNum = Number(it.precioUnit);
    const horasNum = Number(it.horas);
    const personalNum = Number(it.personal);
    const fotosImpresasNum = Number(it.fotosImpresas);
    const trailerMinNum = Number(it.trailerMin);
    const filmMinNum = Number(it.filmMin);

    return {
      titulo: String(titulo || "").trim(),
      descripcion: String(descripcion || "").trim(),
      moneda,
      cantidad: Number.isFinite(cantidadNum) ? cantidadNum : 1,
      precioUnitario: Number.isFinite(precioUnitNum) ? precioUnitNum : 0,
      horas: Number.isFinite(horasNum) ? horasNum : null,
      notas: String(it.notas || "").trim(),
      personal: Number.isFinite(personalNum) ? personalNum : null,
      fotosImpresas: Number.isFinite(fotosImpresasNum) ? fotosImpresasNum : 0,
      trailerMin: Number.isFinite(trailerMinNum) ? trailerMinNum : 0,
      filmMin: Number.isFinite(filmMinNum) ? filmMinNum : 0,
    };
  });

  // Clasifica por heurÃ­stica simple
  const foto = [], video = [], extrasFoto = [], extrasVideo = [];
  const keywordCat = (t, d, fi, tr, fm) => {
    if ((tr||0) > 0 || (fm||0) > 0) return "video";
    if ((fi||0) > 0) return "foto";
    const txt = `${t} ${d}`.toLowerCase();
    if (/(video|filmaciÃ³n|filmacion|trÃ¡iler|trailer|reporte|4k|cÃ¡mara de video)/i.test(txt)) return "video";
    if (/(foto|fotografÃ­a|fotografia|photobook|Ã¡lbum|album)/i.test(txt)) return "foto";
    return "otro";
  };
  for (const it of norm) {
    const cat = keywordCat(it.titulo, it.descripcion, it.fotosImpresas, it.trailerMin, it.filmMin);
    const base = {
      titulo: it.titulo,
      bullets: toBullets(it.descripcion),
      horas: it.horas ?? null,
      notas: it.notas ?? "",
      personal: it.personal ?? null,
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario ?? 0,
      moneda: it.moneda || "USD",
    };
    if (cat === "video") video.push(base);
    else if (cat === "foto") foto.push(base);
    else if (/video/i.test(it.titulo)) extrasVideo.push(base);
    else extrasFoto.push(base);
  }
  if (foto.length === 0 && video.length === 0 && norm.length > 0) {
    video.push(...norm.map(it => ({
      titulo: it.titulo,
      bullets: toBullets(it.descripcion),
      horas: it.horas ?? null,
      notas: it.notas ?? "",
      personal: it.personal ?? null,
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario ?? 0,
      moneda: it.moneda || "USD"
    })));
  }

  // Cabecera para PDF (DB + overrides desde body)
  const cabecera = {
    atencion: (detail.contacto && detail.contacto.nombre)
      || detail.leadNombre
      || (detail.lead && detail.lead.nombre)
      || "Cliente",
    evento: detail.cotizacion?.tipoEvento || detail.tipoEvento || "evento",
    fechaEvento: detail.cotizacion?.fechaEvento || detail.fechaEvento || null,
    lugar: detail.cotizacion?.lugar || detail.lugar || "",
    // valores por defecto desde DBâ€¦
    logoBase64: detail.company?.logoBase64 || null,
    firmaBase64: detail.company?.firmaBase64 || null,
    videoEquipo: detail.cotizacion?.videoEquipo || detail.videoEquipo || null,
    createdAt: detail.cotizacion?.fechaCreacion || detail.fechaCreacion || new Date()
  };

  // â€¦y sobreescrituras desde el body del front (si vienen)
  if (body && typeof body === "object") {
    if (body.company) {
      if (body.company.logoBase64) cabecera.logoBase64 = body.company.logoBase64;
      if (body.company.firmaBase64) cabecera.firmaBase64 = body.company.firmaBase64;
    }
    if (body.videoEquipo) cabecera.videoEquipo = body.videoEquipo;
  }

  const selecciones = { foto, video, extrasFoto, extrasVideo };
  const locaciones = Array.isArray(detail.eventos)
    ? detail.eventos
        .filter(Boolean)
        .map((evt) => ({
          fecha: evt.fecha ?? evt.eventoFecha ?? null,
          hora: evt.hora ?? evt.eventoHora ?? null,
          ubicacion: evt.ubicacion ?? evt.lugar ?? null,
          direccion: evt.direccion ?? null,
          notas: evt.notas ?? null,
        }))
    : [];

  const versionToken = String(
    (query && (query.version ?? query.pdfVersion))
      ?? (body && (body.pdfVersion ?? body.version))
      ?? ""
  ).trim().toLowerCase();
  let useV2 = true;
  if (versionToken) {
    if (["v1", "legacy", "classic", "old"].includes(versionToken)) {
      useV2 = false;
    } else if (["v2", "new", "testing"].includes(versionToken)) {
      useV2 = true;
    }
  }

  let buffer;
  if (useV2) {
    const clean = (arr = []) =>
      arr
        .map((text) => (typeof text === "string" ? text : text != null ? String(text) : ""))
        .map((text) => text.trim())
        .filter(Boolean);

    const describeItem = (it = {}) => {
      const qty = Number(it.cantidad);
      const qtyPrefix = Number.isFinite(qty) && qty > 0 ? (qty === 1 ? "1 " : `${qty} `) : "";
      const baseTitulo = it.titulo || "Servicio";
      const base = `${qtyPrefix}${baseTitulo}`.trim();
      const meta = [];
      if (it.horas != null && it.horas !== "") meta.push(`${it.horas} h`);
      if (it.personal != null && it.personal !== "") {
        const count = Number(it.personal);
        const label = Number.isFinite(count)
          ? `${count} ${count === 1 ? "persona" : "personas"}`
          : `Personal: ${it.personal}`;
        meta.push(label);
      }
      const metaTxt = meta.length ? ` (${meta.join(" â€¢ ")})` : "";
      const note = it.notas ? ` â€” ${it.notas}` : "";
      return `${base}${metaTxt}${note}`.trim();
    };

    const allFotoItems = [...foto, ...extrasFoto];
    const allVideoItems = [...video, ...extrasVideo];

    const fotoRecursos = clean(allFotoItems.map(describeItem));
    const fotoLocaciones = (() => {
      const lines = [];
      const eventos = locaciones.length ? locaciones : [{
        fecha: cabecera.fechaEvento ?? null,
        hora: null,
        ubicacion: cabecera.lugar ?? null,
        direccion: null,
        notas: null,
      }];
      eventos.filter(Boolean).forEach((loc) => {
        if (loc.fecha) {
          const fechaTxt = formatDateDetail(loc.fecha);
          const horaTxt = loc.hora ? ` ${loc.hora}` : "";
          lines.push(`Fecha: ${fechaTxt}${horaTxt}`);
        }
        if (loc.ubicacion) lines.push(`Lugar: ${loc.ubicacion}`);
        if (loc.direccion) lines.push(`DirecciÃ³n: ${loc.direccion}`);
        if (loc.notas) lines.push(`Notas: ${loc.notas}`);
      });
      return clean(lines);
    })();
    const fotoProducto = (() => {
      const bullets = clean(
        allFotoItems.flatMap((it) => [
          ...toBullets(it.descripcion),
          ...toBullets(it.notas),
        ])
      );
      return bullets.length ? bullets : ["Entrega segÃºn detalle del servicio fotogrÃ¡fico."];
    })();

    const videoEquipos = clean(
      allVideoItems.flatMap((it) => [
        describeItem(it),
        ...toBullets(it.descripcion),
      ])
    );
    const videoPersonal = clean(
      allVideoItems.flatMap((it) => {
        if (it.personal == null || it.personal === "") return [];
        const count = Number(it.personal);
        if (Number.isFinite(count)) {
          return [`${count} ${count === 1 ? "integrante" : "integrantes"}`];
        }
        return [`Personal: ${it.personal}`];
      })
    );
    const videoLocaciones = fotoLocaciones.length ? fotoLocaciones : clean([cabecera.lugar]);
    const videoProducto = (() => {
      const bullets = clean(
        allVideoItems.flatMap((it) => [
          ...toBullets(it.notas),
          ...toBullets(it.descripcion),
        ])
      );
      return bullets.length ? bullets : ["Producto final segÃºn alcance del servicio de video."];
    })();

    const sumImporte = (items = []) =>
      items.reduce((acc, it) => {
        const qty = Number(it.cantidad ?? 1);
        const precio = Number(it.precioUnitario ?? 0);
        if (Number.isFinite(qty) && Number.isFinite(precio)) {
          return acc + qty * precio;
        }
        return acc;
      }, 0);
    const totalFoto = sumImporte(foto) + sumImporte(extrasFoto);
    const totalVideo = sumImporte(video) + sumImporte(extrasVideo);
    const monedaFoto = foto.find((it) => it.moneda)?.moneda
      ?? extrasFoto.find((it) => it.moneda)?.moneda
      ?? "USD";
    const monedaVideo = video.find((it) => it.moneda)?.moneda
      ?? extrasVideo.find((it) => it.moneda)?.moneda
      ?? "USD";

    const totalesData = [];
    if (totalFoto > 0) {
      totalesData.push({
        label: "Total, por el servicio fotografÃ­a",
        amount: totalFoto,
        currency: monedaFoto,
      });
    }
    if (totalVideo > 0) {
      totalesData.push({
        label: "Total, por el servicio video",
        amount: totalVideo,
        currency: monedaVideo,
      });
    }
    totalesData.push("Precios expresados en dÃ³lares no incluye el IGV (18%)");

    const fechasEvento = locaciones.map((loc) => formatDateDetail(loc.fecha)).filter(Boolean);
    if (!fechasEvento.length && cabecera.fechaEvento) fechasEvento.push(formatDateDetail(cabecera.fechaEvento));
    const lugaresEvento = locaciones.map((loc) => loc.ubicacion).filter(Boolean);
    if (!lugaresEvento.length && cabecera.lugar) lugaresEvento.push(cabecera.lugar);

    const cabeceraV2 = {
      cliente:
        body?.clienteNombre
        ?? detail.cliente?.nombre
        ?? detail.clienteNombre
        ?? detail.company?.razonSocial
        ?? cabecera.atencion
        ?? "Cliente",
      atencion:
        body?.atencionNombre
        ?? cabecera.atencion
        ?? detail.contacto?.nombre
        ?? "Cliente",
      evento: body?.eventoNombre ?? cabecera.evento ?? "Evento",
      eventoDetalle: uniqueJoin(
        [
          uniqueJoin(fechasEvento, " y "),
          uniqueJoin(lugaresEvento, ", "),
        ].filter(Boolean),
        " â€“ "
      ),
    };

    const despedidaTexto =
      body?.pdfDespedida
      ?? body?.despedida
      ?? detail.cotizacion?.mensajeDespedida
      ?? "Sin otro en particular nos despedimos agradeciendo de antemano por la confianza recibida.";

    const fechaFirmado =
      body?.pdfFecha
      ?? body?.fechaTexto
      ?? formatDateLong(cabecera.createdAt || new Date());

    const firmaNombre =
      body?.pdfFirma
      ?? body?.firmaNombre
      ?? detail.company?.representante
      ?? "Edwin De La Cruz";

    const footerInfo = {};
    const footerLine1 = body?.footer?.line1 ?? detail.company?.footerLinea1;
    const footerLine2 = body?.footer?.line2 ?? detail.company?.footerLinea2;
    if (footerLine1) footerInfo.line1 = footerLine1;
    if (footerLine2) footerInfo.line2 = footerLine2;

    buffer = await generarCotizacionPdfV2({
      cabecera: cabeceraV2,
      fotografia: {
        recursos: fotoRecursos,
        locaciones: fotoLocaciones,
        productoFinal: fotoProducto,
      },
      video: {
        equiposFilmacion: videoEquipos,
        personal: videoPersonal,
        locaciones: videoLocaciones,
        productoFinal: videoProducto,
      },
      totales: totalesData,
      despedida: despedidaTexto,
      fechaTexto: fechaFirmado,
      firmaNombre,
      footer: footerInfo,
    });
  } else {
    buffer = await generarCotizacionPdf({ cabecera, selecciones, locaciones });
  }

  res.status(200);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="cotizacion_${cotizacionId}.pdf"`);
  res.end(buffer);
}

async function migrarAPedido(id, { empleadoId, nombrePedido } = {}) {
  const cotizacionId = assertPositiveInt(id, "id");
  const empleado = assertPositiveInt(empleadoId, "empleadoId");
  const pedidoNombre = nombrePedido == null ? null : String(nombrePedido);

  return await repo.migrarAPedido({
    cotizacionId,
    empleadoId: empleado,
    nombrePedido: pedidoNombre,
  });
}

/** ====== REST no tocado ====== */
async function list({ estado } = {}) {
  await rechazarVencidasLocal();
  const rows = await repo.listAll({ estado });

  return rows.map((r) => {
    // Construimos el bloque 'contacto' a partir de lo que venga del repo/SP
    const contacto = r.contacto ?? (
      r.origen ? {
        id: r.origen === 'CLIENTE'
          ? (r.clienteId ?? r.idCliente ?? null)
          : (r.leadId ?? r.idLead ?? null),
        origen: r.origen,
        nombre: r.contactoNombre ?? r.leadNombre ?? r.nombre ?? r.Lead_Nombre ?? null,
        celular: r.contactoCelular ?? r.leadCelular ?? r.celular ?? r.Lead_Celular ?? null,
      } : undefined
    );

    const id = r.id ?? r.idCotizacion ?? r.cotizacion_id ?? r.PK_Cot_Cod;
    return {
      id,
      codigo: r.codigo ?? formatCodigo("COT", id),
      estado: r.estado,
      fechaCreacion: r.fechaCreacion ?? r.Cot_Fecha_Crea,

      // ðŸ”¹ asegÃºrate de poblar eventoId (desde idTipoEvento en el SP)
      eventoId: r.eventoId ?? r.idTipoEvento ?? r.Cot_IdTipoEvento ?? null,
      tipoEvento: r.tipoEvento ?? r.Cot_TipoEvento,
      fechaEvento: r.fechaEvento ?? r.Cot_FechaEvento,
      lugar: r.lugar ?? r.Cot_Lugar,

      // ðŸ”¹ coerces numÃ©ricos a Number
      horasEstimadas:
        r.horasEstimadas != null ? Number(r.horasEstimadas)
        : (r.Cot_HorasEst != null ? Number(r.Cot_HorasEst) : null),

      mensaje: r.mensaje ?? r.Cot_Mensaje,
      total:
        r.total != null ? Number(r.total)
        : (r.cot_total != null ? Number(r.cot_total) : null),

      // ðŸ”¥ solo incluimos 'contacto' si existe; no exponemos 'lead'
      ...(contacto ? { contacto } : {}),
    };
  });
}

async function createPublic(payload = {}) {
  if (!payload || typeof payload !== "object") throw badRequest("Body invÃ¡lido");
  const { lead, cotizacion } = payload;
  // Validaciones mÃ­nimas (el SP tambiÃ©n valida)
  assertString(lead?.nombre ?? "", "lead.nombre");
  assertString(cotizacion?.tipoEvento ?? "", "cotizacion.tipoEvento");
  assertDate(cotizacion?.fechaEvento, "cotizacion.fechaEvento");
  return await repo.createPublic({ lead, cotizacion });
}

async function createAdmin(payload = {}) {
  if (!payload || typeof payload !== "object") throw badRequest("Body invÃ¡lido");
  if (payload.eventos != null && !Array.isArray(payload.eventos))
    throw badRequest("Campo 'eventos' debe ser un arreglo");
  if (payload?.cotizacion?.estado != null) {
    assertEstado(payload.cotizacion.estado);
  }
  return await repo.createAdmin(payload);
}

async function update(id, body = {}) {
  const nId = assertPositiveInt(id, "id");
  if (!body || typeof body !== "object") throw badRequest("Body inválido");
  if (body.eventos != null && !Array.isArray(body.eventos))
    throw badRequest("Campo 'eventos' debe ser un arreglo");
  if (body?.cotizacion?.estado != null) {
    assertEstado(body.cotizacion.estado);
  }

  await rechazarVencidasLocal();
  const info = await repo.getFechaYEstado(nId);
  if (!info) { const err = new Error(`Cotización ${nId} no encontrada`); err.status = 404; throw err; }

  const fechaEvento = body?.cotizacion?.fechaEvento ?? info.fechaEvento;
  if (!isEditableFechaEvento(fechaEvento)) {
    throw badRequest("Cotización no editable el mismo día del evento.");
  }

  return await repo.updateAdmin(nId, body);
}

async function remove(id) {
  const nId = assertPositiveInt(id, "id");
  return await repo.deleteById(nId);
}

async function cambiarEstadoOptimista(id, { estadoNuevo, estadoEsperado } = {}) {
  const nId = assertPositiveInt(id, "id");
  const nuevo = assertEstado(estadoNuevo);
  const esperado = estadoEsperado == null ? null : assertEstado(estadoEsperado);

  await rechazarVencidasLocal();
  const info = await repo.getFechaYEstado(nId);
  if (!info) { const err = new Error(`Cotización ${nId} no encontrada`); err.status = 404; throw err; }

  if (nuevo !== "Rechazada" && !isEditableFechaEvento(info.fechaEvento)) {
    throw badRequest("Cotización vencida: solo se permite rechazar el mismo día del evento.");
  }
  if (nuevo === "Aceptada" && !isAceptableFechaEvento(info.fechaEvento)) {
    throw badRequest("La cotización solo puede aceptarse hasta un día antes del evento.");
  }

  return await repo.cambiarEstado(nId, { estadoNuevo: nuevo, estadoEsperado: esperado });
}


module.exports = {
  list,
  findById,
  streamPdf,
  migrarAPedido,
  createPublic,
  createAdmin,
  update,
  remove,
  cambiarEstadoOptimista,
};







