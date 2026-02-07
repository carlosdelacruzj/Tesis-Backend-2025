// src/modules/comprobantes/comprobantes.controller.js
const service = require("./comprobantes.service");

// GET /api/v1/comprobantes/vouchers/:voucherId/pdf  (boleta/factura)
async function downloadByVoucher(req, res, next) {
  try {
    const { voucherId } = req.params;
    const { pdfBuffer, header } = await service.generateComprobantePdfBufferByVoucherId(voucherId);

    const serie = header?.serie || "";
    const numero = header?.numero || voucherId;
    const tipo = String(header?.tipo || "COMPROBANTE").toLowerCase();

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${tipo}_${serie}-${numero}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/comprobantes/vouchers/:voucherId/nota-credito/pdf
// body: { montoDevolverConIgv: number, motivo: string }
async function downloadNotaCreditoByVoucher(req, res, next) {
  try {
    const { voucherId } = req.params;
    const { montoDevolverConIgv, motivo } = req.body || {};

    const { pdfBuffer, header } = await service.generateNotaCreditoPdfBufferByVoucherId(
      voucherId,
      montoDevolverConIgv,
      motivo
    );

    const serie = header?.serie || "NC01";
    const numero = header?.numero || voucherId;

    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="nota_credito_${serie}-${numero}.pdf"`);
    res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { downloadByVoucher, downloadNotaCreditoByVoucher };
