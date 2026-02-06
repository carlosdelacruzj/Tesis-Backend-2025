const DEFAULT_IGV_RATE = 0.18;

function getIgvRate() {
  const raw = process.env.IGV_RATE;
  if (raw == null || raw === "") return DEFAULT_IGV_RATE;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_IGV_RATE;
  return n;
}

function round2(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calcIgv(base) {
  const baseNum = round2(base);
  const rate = getIgvRate();
  const igv = round2(baseNum * rate);
  const total = round2(baseNum + igv);
  return { base: baseNum, igv, total, rate };
}

module.exports = { getIgvRate, round2, calcIgv };
