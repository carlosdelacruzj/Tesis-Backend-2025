function getLimaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return { year, month, day };
}

function getLimaDate(date = new Date()) {
  const { year, month, day } = getLimaParts(date);
  return new Date(year, month - 1, day);
}

function getLimaISODate(date = new Date()) {
  const { year, month, day } = getLimaParts(date);
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

module.exports = {
  getLimaDate,
  getLimaISODate,
};
