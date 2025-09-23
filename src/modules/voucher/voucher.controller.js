const service = require("./voucher.service");

// GET /voucher/consulta/getAllPedidoVoucher/:idEstado
async function getAllPedidoVoucher(req, res, next) {
  try {
    const data = await service.listPedidosByEstado(req.params.idEstado);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /voucher/consulta/getAllVoucherByPedido/:idPedido
async function getAllVoucherByPedido(req, res, next) {
  try {
    const data = await service.listByPedido(req.params.idPedido);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /voucher/consulta/getVoucherByPedido/:idPedido
async function getVoucherByPedido(req, res, next) {
  try {
    const data = await service.getByPedido(req.params.idPedido);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// POST /voucher/registro/postVoucher
async function postVoucher(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}


// GET /voucher/consulta/getAllMetodoPago
async function getAllMetodoPago(_req, res, next) {
  try {
    const data = await service.listMetodosPago();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

// GET /voucher/consulta/getAllEstadoVoucher
async function getAllEstadoVoucher(_req, res, next) {
  try {
    const data = await service.listEstados();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

module.exports = {
  getAllPedidoVoucher,
  getAllVoucherByPedido,
  getVoucherByPedido,
  postVoucher,
  getAllMetodoPago,
  getAllEstadoVoucher,
};
