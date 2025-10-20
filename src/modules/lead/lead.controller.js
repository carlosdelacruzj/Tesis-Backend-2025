const service = require("./lead.service");

async function postConvertirACliente(req, res, next) {
  try {
    const result = await service.convertirACliente(req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  postConvertirACliente,
};
