// src/modules/comprobantes/comprobantes.controller.js
const service = require("./comprobantes.service");

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

module.exports = { downloadByVoucher };