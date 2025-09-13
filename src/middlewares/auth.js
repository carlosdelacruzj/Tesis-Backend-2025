const jwt = require("jsonwebtoken");

// Rutas públicas (sin JWT)
const PUBLIC_PATHS = [
  /^\/health$/,                 // healthcheck
  /^\/api-doc(?:\/|$)/,         // swagger UI
  /^\/api-doc\.json$/,          // swagger JSON
  /^\/api\/v1\/auth\/login$/,   // login dev
];

function isPublic(path) {
  return PUBLIC_PATHS.some((rx) => rx.test(path));
}

// Intenta verificar con una lista de secretos
function verifyWithAnySecret(token, secrets) {
  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch {
      // probar siguiente
    }
  }
  throw new Error("invalid token");
}

module.exports = function authMiddleware(req, res, next) {
  // dejar pasar públicas
  if (isPublic(req.path)) return next();

  // extraer token: Authorization: Bearer <jwt> o ?token=<jwt>
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1] || req.query.token;

  if (!token) {
    return res.status(403).json({ success: false, message: "no existe el token" });
  }

  const secrets = [
    process.env.JWT_SECRET || "my_secret_key",
    process.env.JWT_ADMIN_SECRET || "my_admin_secret_key",
    process.env.JWT_EMPRESA_SECRET || "my_empresa_secret_key",
  ];

  try {
    req.user = verifyWithAnySecret(token, secrets);
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "token inválido" });
  }
};
