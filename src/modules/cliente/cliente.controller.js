// src/modules/cliente/cliente.controller.js
const service = require("./cliente.service");

// GET /clientes
async function getAllCliente(_req, res, next) {
  try {
    const data = await service.list();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /clientes/:id
async function getByIdCliente(req, res, next) {
  try {
    const data = await service.findById(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// GET /clientes/by-doc/:doc
async function getDataCliente(req, res, next) {
  try {
    const data = await service.findByDoc(req.params.doc);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// POST /clientes
async function postCliente(req, res, next) {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// PUT /clientes/:id
async function putClienteById(req, res, next) {
  try {
    if (req.params?.id != null) {
      req.body = { ...req.body, idCliente: req.params.id };
    }
    const result = await service.update(req.body);
    res.status(200).json(result); // 200 en update
  } catch (err) {
    next(err);
  }
}

/* =========================
   NUEVO: GET /clientes/buscar
   Autocompletado (query + limit)
   ========================= */
async function buscarClientes(req, res, next) {
  try {
    const query = String(req.query?.query ?? "").trim();
    const limit = Number(req.query?.limit ?? 10);
    const data = await service.autocomplete({ query, limit });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getPedidosCliente(req, res, next) {
  try {
    const data = await service.listPedidosByCliente(req.params.id);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getCotizacionesCliente(req, res, next) {
  try {
    const estado = typeof req.query?.estado === "string" ? req.query.estado : null;
    const data = await service.listCotizacionesByCliente(req.params.id, estado);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function listEstadosCliente(_req, res, next) {
  try {
    const data = await service.listEstadosCliente();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function patchEstadoCliente(req, res, next) {
  try {
    const data = await service.changeEstado(req.params.id, req.body?.estadoClienteId);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCliente,
  getByIdCliente,
  getDataCliente,
  postCliente,
  putClienteById,
  buscarClientes, // <-- export nuevo
  getPedidosCliente,
  getCotizacionesCliente,
  listEstadosCliente,
  patchEstadoCliente,
};
