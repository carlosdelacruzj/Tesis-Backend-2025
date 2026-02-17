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

async function getCalendarioMensual(req, res, next) {
  try {
    const data = await service.getCalendarioMensual(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getCalendarioDia(req, res, next) {
  try {
    const data = await service.getCalendarioDia(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardResumen(req, res, next) {
  try {
    const data = await service.getDashboardResumen(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

async function getDashboardAlertas(req, res, next) {
  try {
    const data = await service.getDashboardAlertas(req.query || {});
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

async function getDashboardOperativoDiario(req, res, next) {
  try {
    const data = await service.getDashboardOperativoDiario(req.query || {});
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getKpisOperativosMinimos,
  getAgendaOperativa,
  getCalendarioMensual,
  getCalendarioDia,
  getDashboardResumen,
  getDashboardAlertas,
  getDashboardCapacidad,
  getDashboardHome,
  getDashboardOperativoDiario,
};
