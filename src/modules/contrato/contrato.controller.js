const service = require("./contrato.service");

async function getContratoById(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function listGestion(req, res, next) {
  try {
    const data = await service.listGestion(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function listContratosByPedido(req, res, next) {
  try {
    const data = await service.listByPedidoId(req.params.pedidoId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getContratoVigenteByPedido(req, res, next) {
  try {
    const data = await service.getVigenteByPedidoId(req.params.pedidoId);
    if (!data) return res.status(404).json({ message: "No encontrado" });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function downloadContratoPdfById(req, res, next) {
  try {
    await service.streamContratoPdfById({
      id: req.params.id,
      res,
      query: req.query || {},
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listGestion,
  getContratoById,
  listContratosByPedido,
  getContratoVigenteByPedido,
  downloadContratoPdfById,
};
