// src/modules/comprobantes/comprobantes.service.js
const path = require("path");
const fs = require("fs");
const repo = require("./comprobantes.repository");
const { generatePdfBufferFromDocxTemplate } = require("../../pdf/wordToPdf");

function money2(v) {
  const n = Number(v ?? 0);
  const safe = Number.isFinite(n) ? n : 0;

  // 1,234.56 (coma miles, punto decimales)
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(safe);
}


function safeStr(v) {
  return v == null ? "" : String(v);
}

function numberToWordsUSD(amount) {
  const unidades = [
    "", "UNO", "DOS", "TRES", "CUATRO", "CINCO",
    "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
    "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE",
    "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
  ];

  const decenas = [
    "", "", "VEINTE", "TREINTA", "CUARENTA",
    "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA",
  ];

  const centenas = [
    "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS",
    "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS",
    "OCHOCIENTOS", "NOVECIENTOS",
  ];

  function convertir(n) {
    if (n === 0) return "CERO";
    if (n === 100) return "CIEN";
    let txt = "";

    if (n >= 100) {
      txt += centenas[Math.floor(n / 100)] + " ";
      n %= 100;
    }

    if (n <= 20) {
      txt += unidades[n];
    } else {
      txt += decenas[Math.floor(n / 10)];
      if (n % 10 !== 0) txt += " Y " + unidades[n % 10];
    }
    return txt.trim();
  }

  const total = Number(amount || 0).toFixed(2);
  const [entero, decimal] = total.split(".");
  const enteroNum = Number(entero);

  let letras = "";
  if (enteroNum === 0) letras = "CERO";
  else if (enteroNum < 1000) letras = convertir(enteroNum);
  else {
    const miles = Math.floor(enteroNum / 1000);
    const resto = enteroNum % 1000;
    letras =
      (miles === 1 ? "MIL" : convertir(miles) + " MIL") +
      (resto ? " " + convertir(resto) : "");
  }

  return `${letras} Y ${decimal}/100 DÓLARES`;
}

function mapComprobanteToTemplateData(header, items) {
  const h = header || {};
  const arr = Array.isArray(items) ? items : [];

  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  const round2 = (v) => Math.round(n(v) * 100) / 100;

  const tipoUpper = safeStr(h.tipo).trim().toUpperCase();
  const esNC = tipoUpper === "NC" || tipoUpper.includes("CRED");

  const tituloComprobante =
    esNC
      ? "NOTA DE CRÉDITO"
      : tipoUpper === "FACTURA"
      ? "FACTURA ELECTRÓNICA"
      : "BOLETA DE VENTA ELECTRÓNICA";

  // ===== totales vienen del SP =====
  const opGravadaNum = round2(n(h.opGravada)); // SIN IGV
  const igvNum = round2(n(h.igv));             // IGV
  const totalConIgvNum = round2(n(h.totalConIgv ?? h.total)); // CON IGV

  // En tus SP actuales, "totalSinIgv" no siempre existe:
  // el SIN IGV real para el template es opGravada
  const totalSinIgvNum =
    h.totalSinIgv != null && h.totalSinIgv !== ""
      ? round2(n(h.totalSinIgv))
      : opGravadaNum;

  // ===== factorPago viene del SP (NO recalcular en Node) =====
  const factorPagoNum =
    h.factorPago != null && h.factorPago !== "" ? round2(n(h.factorPago)) : 1;

  const porcentajePagoNum = Math.round(factorPagoNum * 100);
  const porcentajePagoTxt = `${porcentajePagoNum}%`;

  // Pago parcial SOLO si no es NC y < 100%
  const esPagoParcial = !esNC && factorPagoNum < 0.999;

  // Observación
  const observacionPagoTxt = esPagoParcial
    ? `Se ha pagado ${porcentajePagoTxt} del servicio.`
    : "";

  // ✅ Para tu bloque en DOCX:
  // {#mostrarPagoParcial} Observación: {observacionPago}{/mostrarPagoParcial}
  const mostrarPagoParcial = Boolean(esPagoParcial);

  // Quitar descripción larga después del " — "
  const stripLongDesc = (s) => {
    const txt = safeStr(s);
    if (txt.includes(" — ")) return txt.split(" — ")[0].trim();
    if (txt.includes(" - ")) return txt.split(" - ")[0].trim();
    return txt.trim();
  };

  // % al lado del servicio solo si es pago parcial (y NO es NC)
  const pctSuffix = esPagoParcial ? ` (${porcentajePagoTxt})` : "";

  return {
    // ===== header empresa =====
    tituloComprobante,
    empresaRazonSocial: safeStr(h.empresaRazonSocial),
    empresaRuc: "10078799884",
    empresaDireccion: safeStr(h.empresaDireccion),
    empresaCiudad: safeStr(h.empresaCiudad || ""),

    // ===== comprobante =====
    tipo: safeStr(h.tipo),
    serie: safeStr(h.serie),
    numero: safeStr(h.numero),
    fechaEmision: safeStr(h.fechaEmision),
    horaEmision: safeStr(h.horaEmision),
    fechaVencimiento: safeStr(h.fechaVencimiento || ""),

    // Moneda fija
    moneda: "Dolares",
    descuentoTotal: money2(h.descuentoTotal ?? 0),

    // ===== cliente =====
    clienteTipoDoc: safeStr(h.clienteTipoDoc),
    clienteNumDoc: safeStr(h.clienteNumDoc),
    clienteNombre: safeStr(h.clienteNombre),
    clienteDireccion: safeStr(h.clienteDireccion),
    clienteCorreo: safeStr(h.clienteCorreo),
    clienteCelular: safeStr(h.clienteCelular),

    // ===== observación =====
    mostrarPagoParcial,
    observacionPago: observacionPagoTxt,

    // ===== totales =====
    opGravada: money2(opGravadaNum),        // SIN IGV
    igv: money2(igvNum),
    total: money2(totalSinIgvNum),         // primer total: SIN IGV
    totalConIgv: money2(totalConIgvNum),   // segundo total: CON IGV

    // ✅ totalEnLetras SIN IGV (como pediste)
    totalEnLetras: numberToWordsUSD(totalConIgvNum),

    anticipos: money2(h.anticipos ?? 0),
    otrosCargos: money2(h.otrosCargos ?? 0),
    otrosTributos: money2(h.otrosTributos ?? 0),

    opExonerada: money2(h.opExonerada ?? 0),
    opInafecta: money2(h.opInafecta ?? 0),
    isc: money2(h.isc ?? 0),
    redondeo: money2(h.redondeo ?? 0),

    // ===== pedido/evento =====
    pedidoId: safeStr(h.pedidoId),
    pedidoNombre: safeStr(h.pedidoNombre),
    pedidoFechaEvento: safeStr(h.pedidoFechaEvento),
    pedidoLugar: safeStr(h.pedidoLugar),

    // ===== detalle =====
    detalleItems: arr.map((it) => ({
      cantidad: safeStr(it.cantidad),
      unidad: safeStr(it.unidad || "UNIDAD"),
      descripcion: `${stripLongDesc(it.descripcion)}${pctSuffix}`,
      valorUnitario: money2(it.valorUnitario),
      descuento: money2(it.descuento ?? 0),
      importe: money2(it.importe),
    })),

    leyendaSunat: safeStr(
      h.leyendaSunat ||
        "Esta es una representación impresa del comprobante. (Demo / uso interno)"
    ),

    // ===== NC referencias =====
    docAfectadoTipo: safeStr(h.docAfectadoTipo || ""),
    docAfectadoSerieNumero: safeStr(h.docAfectadoSerieNumero || ""),
    motivoNc: safeStr(h.motivoNc || ""),

    // extras
    factorPago: factorPagoNum,
    porcentajePago: porcentajePagoTxt,
  };
}

function pickTemplate(tipoRaw) {
  const tipo = String(tipoRaw || "").trim().toUpperCase();
  if (tipo.includes("CRED") || tipo === "NC") return "NotaCredito.docx";
  if (tipo === "FACTURA") return "Factura.docx";
  return "Boleta.docx";
}

async function generateComprobantePdfBufferByVoucherId(voucherId) {
  const { header, items } = await repo.getComprobantePdfByVoucherId(voucherId);

  if (!header) {
    const e = new Error(`No existe comprobante para voucher ${voucherId}`);
    e.status = 404;
    throw e;
  }

  const templateName = pickTemplate(header.tipo);
  const templatePath = path.join(
    process.cwd(),
    "src",
    "pdf",
    "templates",
    "current",
    templateName
  );

  if (!fs.existsSync(templatePath)) {
    const e = new Error(`No existe template DOCX: ${templatePath}`);
    e.status = 500;
    throw e;
  }

  const data = mapComprobanteToTemplateData(header, items);

  const pdfBuffer = await generatePdfBufferFromDocxTemplate({
    templatePath,
    data,
  });

  return { pdfBuffer, header };
}

module.exports = { generateComprobantePdfBufferByVoucherId };
