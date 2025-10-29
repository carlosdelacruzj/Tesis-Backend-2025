const service = require("./auth.service");

async function login(req, res, next) {
  try {
    const result = await service.login(req.body || {});
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function setPassword(req, res, next) {
  try {
    const result = await service.setPassword(req.body || {});
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  setPassword,
};
