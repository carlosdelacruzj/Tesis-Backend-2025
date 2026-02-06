// src/modules/comprobantes/comprobantes.service.js
const path = require("path");
const fs = require("fs");
const repo = require("./comprobantes.repository");
const { generatePdfBufferFromDocxTemplate } = require("../../pdf/wordToPdf");
const { getIgvRate } = require("../../utils/igv");

function money2(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
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
    letras = (miles === 1 ? "MIL" : convertir(miles) + " MIL") + (resto ? " " + convertir(resto) : "");
  }

  return `${letras} Y ${decimal}/100 DÓLARES`;
}

function mapComprobanteToTemplateData(header, items) {
  const h = header || {};
  const arr = Array.isArray(items) ? items : [];

  // ====== helpers numéricos ======
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : 0;
  };
  const round2 = (v) => Math.round(n(v) * 100) / 100;

  // ====== BASE (SIN IGV) ======
  const opGravadaNum = round2(n(h.opGravada));

  const igvNum =
    h.igv != null && h.igv !== ""
      ? round2(n(h.igv))
      : round2(opGravadaNum * 0.18);

  const totalSinIgvNum =
    h.total != null && h.total !== ""
      ? round2(n(h.total))
      : opGravadaNum;

  const totalConIgvNum =
    h.totalConIgv != null && h.totalConIgv !== ""
      ? round2(n(h.totalConIgv))
      : round2(totalSinIgvNum + igvNum);

  // ====== % pago (factorPago del SP: 0.60, 0.70, etc.) ======
  const factorPagoNum =
    h.factorPago != null && h.factorPago !== "" ? round2(n(h.factorPago)) : 1;

  const porcentajePagoNum = round2(factorPagoNum * 100);
  const porcentajePagoTxt = `${porcentajePagoNum}%`;

  const tipo = safeStr(h.tipo).toUpperCase();
  const tituloComprobante =
    tipo.includes("CRED") || tipo === "NC"
      ? "NOTA DE CRÉDITO"
      : tipo === "FACTURA"
      ? "FACTURA ELECTRÓNICA"
      : "BOLETA DE VENTA ELECTRÓNICA";

  // ====== pago parcial (condicional) ======
  // ✅ Regla simple: si factorPago < 100% entonces es parcial
  const esPagoParcial =
    Boolean(h.esPagoParcial) ||
    Boolean(h.mostrarPagoParcial) ||
    factorPagoNum < 0.999;

  // ✅ SOLO porcentaje, sin montos
  const observacionPago =
    safeStr(h.observacionPago) ||
    (esPagoParcial ? `Se ha pagado ${porcentajePagoTxt} del servicio.` : "");

  // ====== helper: quitar descripción larga después del " — " ======
  const stripLongDesc = (s) => {
    const txt = safeStr(s);
    return txt.includes(" — ") ? txt.split(" — ")[0].trim() : txt.trim();
  };

  // ✅ si NO es parcial, no agregamos porcentaje en la descripción
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
    moneda: safeStr(h.moneda || "USD"),

    // ===== cliente =====
    clienteTipoDoc: safeStr(h.clienteTipoDoc),
    clienteNumDoc: safeStr(h.clienteNumDoc),
    clienteNombre: safeStr(h.clienteNombre),
    clienteDireccion: safeStr(h.clienteDireccion),
    clienteCorreo: safeStr(h.clienteCorreo),
    clienteCelular: safeStr(h.clienteCelular),

    // ===== observación (bloque condicional del DOCX) =====
    // En el DOCX: {#mostrarPagoParcial} Observación: {observacionPago}{/mostrarPagoParcial}
    mostrarPagoParcial: esPagoParcial,
    observacionPago,

    // ===== totales =====
    opGravada: money2(opGravadaNum),
    igv: money2(igvNum),
    total: money2(totalSinIgvNum),          // SIN IGV (primer total)
    totalConIgv: money2(totalConIgvNum),    // CON IGV (segundo total)

    anticipos: money2(h.anticipos ?? 0),
    otrosCargos: money2(h.otrosCargos ?? 0),
    otrosTributos: money2(h.otrosTributos ?? 0),

    opExonerada: money2(h.opExonerada ?? 0),
    opInafecta: money2(h.opInafecta ?? 0),
    isc: money2(h.isc ?? 0),
    redondeo: money2(h.redondeo ?? 0),

    totalEnLetras: numberToWordsUSD(totalSinIgvNum),

    // ===== pedido/evento =====
    pedidoId: safeStr(h.pedidoId),
    pedidoNombre: safeStr(h.pedidoNombre),
    pedidoFechaEvento: safeStr(h.pedidoFechaEvento),
    pedidoLugar: safeStr(h.pedidoLugar),

    // ===== detalle =====
    detalleItems: arr.map((it) => ({
      cantidad: safeStr(it.cantidad),
      unidad: safeStr(it.unidad || "UNIDAD"),
      // ✅ SOLO título, y solo agrega (xx%) si es pago parcial
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
  if (tipo.includes("CRED") || tipo === "NC") return "NotaCredito_v2.docx";
  if (tipo === "FACTURA") return "Factura_v2.docx";
  return "Boleta_v2.docx";
}

async function generateComprobantePdfBufferByVoucherId(voucherId) {
  const { header, items } = await repo.getComprobantePdfByVoucherId(voucherId);

  if (!header) {
    const e = new Error(`No existe comprobante para voucher ${voucherId}`);
    e.status = 404;
    throw e;
  }

  // ✅ base del porcentaje = TOTAL con IGV (como UI)
  // subtotalPedido sale de SUM(PS_Subtotal) en T_PedidoServicio
  const subtotalPedido = await repo.getSubtotalPedidoByPedidoId(header.pedidoId);
  const totalPedidoConIGV = Number(subtotalPedido ?? 0) * 1.18;

  const totalPago = Number(header.total ?? 0);

  const factorPago =
    totalPedidoConIGV > 0 ? totalPago / totalPedidoConIGV : 1;

  const templateName = pickTemplate(header.tipo);
  const templatePath = path.join(process.cwd(), "src", "pdf", "templates", templateName);

  if (!fs.existsSync(templatePath)) {
    const e = new Error(`No existe template DOCX: ${templatePath}`);
    e.status = 500;
    throw e;
  }

  const data = mapComprobanteToTemplateData(header, items, { factorPago });

  const pdfBuffer = await generatePdfBufferFromDocxTemplate({
    templatePath,
    data,
  });

  return { pdfBuffer, header };
}

module.exports = { generateComprobantePdfBufferByVoucherId };
