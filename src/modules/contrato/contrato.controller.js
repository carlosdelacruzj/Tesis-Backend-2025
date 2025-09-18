const service = require("./contrato.service");

async function getAllContratos(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) { next(err); }
}

async function getAllContratosByPedido(req, res, next) {
  try {
    const data = await service.listByPedido(req.params.pedido);
    res.status(200).json(data);
  } catch (err) { next(err); }
}

module.exports = { getAllContratos, getAllContratosByPedido };
