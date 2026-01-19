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

function getLimaDateTimeParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;
  return { year, month, day, hour, minute, second };
}

function getLimaDateTimeString(date = new Date()) {
  const { year, month, day, hour, minute, second } = getLimaDateTimeParts(date);
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

module.exports = {
  getLimaDate,
  getLimaISODate,
  getLimaDateTimeString,
};
