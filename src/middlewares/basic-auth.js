// src/middlewares/basic-auth.js
const crypto = require("crypto");

function safeEqual(a = "", b = "") {
  // compara sin filtrar timing
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

module.exports = function basicAuth(expectedUser, expectedPass) {
  return function (req, res, next) {
    const hdr = req.headers["authorization"] || "";
    const [type, value] = hdr.split(" ");

    if (type !== "Basic" || !value) {
      res.setHeader("WWW-Authenticate", 'Basic realm="docs"');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = Buffer.from(value, "base64").toString("utf8"); // "user:pass"
    const idx = decoded.indexOf(":");
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);

    const okUser = safeEqual(user, String(expectedUser || ""));
    const okPass = safeEqual(pass, String(expectedPass || ""));

    if (!okUser || !okPass) {
      res.setHeader("WWW-Authenticate", 'Basic realm="docs"');
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return next();
  };
};
