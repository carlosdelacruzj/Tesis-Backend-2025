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

function mapComprobanteToTemplateData(header, items, { factorPago = 1 } = {}) {
  const h = header || {};
  const arr = Array.isArray(items) ? items : [];

  const mostrarPagoParcial = Number(factorPago) < 0.999;
  const pct = Math.round(Number(factorPago) * 100);
  const pctLabel = `${pct}%`;

  const observacionPago = mostrarPagoParcial ? `Pago parcial (${pctLabel})` : "";

  const tipo = safeStr(h.tipo).toUpperCase();
  const tituloComprobante =
    tipo.includes("CRED") || tipo === "NC"
      ? "NOTA DE CRÉDITO"
      : tipo === "FACTURA"
      ? "FACTURA ELECTRÓNICA"
      : "BOLETA DE VENTA ELECTRÓNICA";

  return {
    tituloComprobante,

    empresaRazonSocial: safeStr(h.empresaRazonSocial),
    empresaRuc: safeStr(h.empresaRuc),
    empresaDireccion: safeStr(h.empresaDireccion),
    empresaCiudad: safeStr(h.empresaCiudad || ""),

    tipo: safeStr(h.tipo),
    serie: safeStr(h.serie),
    numero: safeStr(h.numero),
    fechaEmision: safeStr(h.fechaEmision),
    horaEmision: safeStr(h.horaEmision),
    fechaVencimiento: safeStr(h.fechaVencimiento || ""),
    moneda: safeStr(h.moneda || "USD"),

    clienteTipoDoc: safeStr(h.clienteTipoDoc),
    clienteNumDoc: safeStr(h.clienteNumDoc),
    clienteNombre: safeStr(h.clienteNombre),
    clienteDireccion: safeStr(h.clienteDireccion),
    clienteCorreo: safeStr(h.clienteCorreo),
    clienteCelular: safeStr(h.clienteCelular),

    medioPago: safeStr(h.medioPago || ""),
    observacion: safeStr(h.observacion || ""),

    mostrarPagoParcial,
    observacionPago,

    // totals (aunque no muestres IGV, no molesta tenerlos)
    opGravada: money2(h.opGravada),
    igv: money2(h.igv),
    total: money2(h.total),
    anticipos: money2(h.anticipos),
    otrosCargos: money2(h.otrosCargos ?? 0),
    otrosTributos: money2(h.otrosTributos ?? 0),

    totalEnLetras: numberToWordsUSD(h.total),

    pedidoId: safeStr(h.pedidoId),
    pedidoNombre: safeStr(h.pedidoNombre),
    pedidoFechaEvento: safeStr(h.pedidoFechaEvento),
    pedidoLugar: safeStr(h.pedidoLugar),

    detalleItems: arr.map((it) => {
      const cant = Number(it.cantidad ?? 0) || 0;
      const importeParcial = Number(it.importe ?? 0) || 0;
      const valorUnitarioParcial = cant > 0 ? importeParcial / cant : 0;

      return {
        cantidad: safeStr(it.cantidad),
        unidad: safeStr(it.unidad),
        descripcion: `${safeStr(it.descripcion)} (Pago ${pctLabel})`,
        valorUnitario: money2(valorUnitarioParcial),
        descuento: money2(it.descuento ?? 0),
        importe: money2(importeParcial),
      };
    }),

    leyendaSunat: safeStr(
      h.leyendaSunat || "Los precios indicados NO incluyen IGV. Documento de uso interno."
    ),

    docAfectadoTipo: safeStr(h.docAfectadoTipo || ""),
    docAfectadoSerieNumero: safeStr(h.docAfectadoSerieNumero || ""),
    motivoNc: safeStr(h.motivoNc || ""),
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
