/**
 * DataParsing.gs
 * Utilities for parsing & formatting fractions
 */

function parseFraction(input) {
  let raw = '';
  if (input !== undefined && input !== null) {
    raw = String(input);
  }
  raw = raw.trim();
  const leadMatch = raw.match(/^([\d\s\/\.\-½¼¾]+)/);
  const lead = leadMatch ? leadMatch[1].trim() : '';

  let m = lead.match(/^(\d+)[\s\-]+(\d+)\s*\/\s*(\d+)$/);
  if (m) {
    return parseInt(m[1], 10)
         + parseInt(m[2], 10) / parseInt(m[3], 10);
  }

  m = lead.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1], 10) / parseInt(m[2], 10);

  const uniMap = {'½':'1/2','¼':'1/4','¾':'3/4'};
  if (uniMap[lead]) return parseFraction(uniMap[lead]);

  const n = parseFloat(lead);
  return isNaN(n) ? 0 : n;
}

function formatFraction(x) {
  const whole = Math.floor(x), frac = x - whole;
  if (frac < 1e-6) return String(whole);
  let best = { err: Infinity, n: 0, d: 1 };
  for (let d = 1; d <= 16; d++) {
    const n = Math.round(frac * d), err = Math.abs(frac - n / d);
    if (err < best.err) best = { err, n, d };
  }
  if (best.n === best.d) return String(whole + 1);
  const f = `${best.n}/${best.d}`;
  return whole > 0 ? `${whole} ${f}` : f;
}
