const service = require("./pagos.service");

// GET /pagos
async function getAllPagos(_req, res, next) {
  try {
    res.status(200).json(await service.listAllVouchers());
  } catch (e) {
    next(e);
  }
}

// GET /pagos/pendientes
async function getPendientes(_req, res, next) {
  try {
    res.status(200).json(await service.listPendientes());
  } catch (e) {
    next(e);
  }
}

// GET /pagos/parciales
async function getParciales(_req, res, next) {
  try {
    res.status(200).json(await service.listParciales());
  } catch (e) {
    next(e);
  }
}

// GET /pagos/pagados
async function getPagados(_req, res, next) {
  try {
    res.status(200).json(await service.listPagados());
  } catch (e) {
    next(e);
  }
}

// GET /pagos/resumen/:pedidoId
async function getResumen(req, res, next) {
  try {
    res.status(200).json(await service.getResumen(req.params.pedidoId));
  } catch (e) {
    next(e);
  }
}

// GET /pagos/vouchers/:pedidoId
async function getVouchers(req, res, next) {
  try {
    res.status(200).json(await service.listVouchers(req.params.pedidoId));
  } catch (e) {
    next(e);
  }
}

// GET /pagos/metodos
async function getMetodos(_req, res, next) {
  try {
    res.status(200).json(await service.listMetodos());
  } catch (e) {
    next(e);
  }
}

async function getEstadosPago(_req, res, next) {
  try {
    res.status(200).json(await service.listEstadosPago());
  } catch (e) {
    next(e);
  }
}

// GET /pagos/:id
async function getPagoById(req, res, next) {
  try {
    res.status(200).json(await service.findVoucherById(req.params.id));
  } catch (e) {
    next(e);
  }
}
// POST /pagos  (multipart)
async function postPago(req, res, next) {
  try {
    const { pedidoId, monto, metodoPagoId, estadoVoucherId, fecha } = req.body;
    const mpId = Number(metodoPagoId);
    const voucherRequerido = await service.isMetodoPagoTransferencia(mpId);

    // Si es transferencia y no hay archivo => 400
    if (voucherRequerido && !req.file?.buffer) {
      return res
        .status(400)
        .json({ error: "El voucher es obligatorio para Transferencia." });
    }

    const out = await service.createVoucher({
      file: req.file // puede ser undefined si no es transferencia
        ? {
            buffer: req.file.buffer,
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size,
          }
        : undefined,
      pedidoId,
      monto,
      metodoPagoId: mpId,
      estadoVoucherId, // puede venir undefined; el service resuelve el default por nombre
      fecha,
    });

    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

// === NUEVO: devolver imagen del voucher (BLOB) ===
async function getVoucherImage(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      return res.status(400).json({ error: "id inválido" });

    const row = await service.getVoucherImage(id);
    if (!row) return res.status(404).end();

    res.setHeader(
      "Content-Type",
      row.Pa_Imagen_Mime || "application/octet-stream"
    );
    if (row.Pa_Imagen_Size) res.setHeader("Content-Length", row.Pa_Imagen_Size);
    // res.setHeader('Content-Disposition', `inline; filename="${row.Pa_Imagen_NombreOriginal || 'voucher'}"`);

    return res.end(row.Pa_Imagen_Voucher); // Buffer
  } catch (e) {
    next(e);
  }
}

// PUT /pagos/:id (multipart opcional)
async function putPago(req, res, next) {
  try {
    const out = await service.updateVoucher(req.params.id, req.body || {}, req.file);
    res.status(200).json(out);
  } catch (e) {
    next(e);
  }
}

// DELETE /pagos/:id
async function deletePago(req, res, next) {
  try {
    await service.deleteVoucher(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getAllPagos,
  getPendientes,
  getParciales,
  getPagados,
  getResumen,
  getVouchers,
  getMetodos,
  getEstadosPago,
  getPagoById,
  postPago,
  getVoucherImage,
  putPago,
  deletePago,
};
