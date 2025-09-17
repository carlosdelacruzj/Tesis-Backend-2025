const service = require("./pedido.service");

async function getAllPedido(_req, res, next) {
  try {
    const data = await service.listAllPedidos();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getIndexPedido(_req, res, next) {
  try {
    const data = await service.listIndexPedidos();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getPedidoById(req, res, next) {
  try {
    const data = await service.findPedidoById(req.params.id);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getLastEstadoPedido(_req, res, next) {
  try {
    const data = await service.findLastEstadoPedido();
    if (!data) return res.status(404).json({ message: "No encontrado" });
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function createPedido(req, res, next) {
  try {
    const result = await service.createNewPedido(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function updatePedido(req, res, next) {
  try {
    const payload = { ...req.body, id: req.params.id };
    const result = await service.updatePedidoById(payload);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = {
  getAllPedido,
  getIndexPedido,
  getPedidoById,
  getLastEstadoPedido,
  createPedido,
  updatePedido,
};
