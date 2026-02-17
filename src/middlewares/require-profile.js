function normalizeCode(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function readUserProfileCodes(user) {
  const raw = user?.perfiles;
  if (!raw) return [];

  if (typeof raw === "string") {
    const code = normalizeCode(raw);
    return code ? [code] : [];
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") return normalizeCode(item);
      if (item && typeof item === "object") {
        return normalizeCode(item.codigo || item.perfilCodigo || item.code);
      }
      return "";
    })
    .filter(Boolean);
}

function requireProfile(...allowedProfiles) {
  const allowed = new Set(allowedProfiles.map(normalizeCode).filter(Boolean));

  return function requireProfileMiddleware(req, res, next) {
    const requireAuthEnabled =
      (process.env.REQUIRE_AUTH || "").toLowerCase() === "true";
    if (!requireAuthEnabled) return next();

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "No autenticado" });
    }

    if (allowed.size === 0) return next();

    const userCodes = readUserProfileCodes(req.user);
    const hasAnyAllowed = userCodes.some((code) => allowed.has(code));

    if (!hasAnyAllowed) {
      return res.status(403).json({
        success: false,
        message: "No autorizado para este recurso",
      });
    }

    return next();
  };
}

module.exports = requireProfile;

