const service = require("./operaciones.service");

async function getKpisOperativosMinimos(_req, res, next) {
  try {
    const data = await service.getKpisOperativosMinimos();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getAgendaOperativa(req, res, next) {
  try {
    const data = await service.getAgendaOperativa(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardResumen(_req, res, next) {
  try {
    const data = await service.getDashboardResumen();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardAlertas(_req, res, next) {
  try {
    const data = await service.getDashboardAlertas();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardCapacidad(req, res, next) {
  try {
    const data = await service.getDashboardCapacidad(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardHome(req, res, next) {
  try {
    const data = await service.getDashboardHome(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getKpisOperativosMinimos,
  getAgendaOperativa,
  getDashboardResumen,
  getDashboardAlertas,
  getDashboardCapacidad,
  getDashboardHome,
};
