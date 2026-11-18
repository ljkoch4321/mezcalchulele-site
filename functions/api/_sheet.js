// Shared helper — forward a signup to the Google Sheet Apps Script webhook.
// The Apps Script routes by `type` to the matching tab.
// Env (Cloudflare Pages -> Settings -> Environment variables -> Production):
//   SHEET_WEBHOOK_URL     required — Apps Script Web-App "/exec" URL
//   SHEET_WEBHOOK_SECRET  optional — must match the Apps Script "SECRET" property
export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

// --- Abuse / injection guards ------------------------------------------------
// Max accepted request body. Signups are tiny; anything larger is abuse.
const MAX_BODY = 8 * 1024;
// Per-value length backstop before a value reaches the sheet / confirmation email.
const MAX_VALUE = 500;
// A leading =, +, -, @ (or tab/CR) turns a cell into a live formula when the
// sheet is opened or exported to CSV — spreadsheet "formula injection". Neutralise
// it by prefixing a single quote so the value is always stored as literal text.
const FORMULA_LEAD = /^[=+\-@\t\r]/;

function sanitizeValue(v) {
  if (typeof v !== 'string') return v;
  let s = v.slice(0, MAX_VALUE);
  if (FORMULA_LEAD.test(s)) s = "'" + s;
  return s;
}

// Size-guarded JSON read. Returns {} on oversize / malformed body so callers fall
// through to their normal validation (and reject with a 400), never throwing.
export async function readJson(request, max = MAX_BODY) {
  if (+(request.headers.get('content-length') || 0) > max) return {};
  try {
    const txt = await request.text();
    if (txt.length > max) return {};
    const obj = JSON.parse(txt);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

// Reject browser requests that originate from another site (cross-site spam /
// CSRF). Requests with no Origin header (non-browser clients, some same-origin
// posts) are allowed; the site's own origin and Cloudflare Pages previews pass.
const ALLOWED_HOST = /(^|\.)mezcalchulele\.com$|\.pages\.dev$/i;
export function badOrigin(request) {
  const o = request.headers.get('origin');
  if (!o) return false;
  try { return !ALLOWED_HOST.test(new URL(o).hostname); }
  catch { return true; }
}

export async function toSheet(env, payload, okMessage) {
  const url = env.SHEET_WEBHOOK_URL;
  if (!url) {
    return json({ ok: false, message: 'Signups are temporarily unavailable. Please try again shortly.' }, 503);
  }
  // Sanitise every forwarded value centrally, so no endpoint can let a formula
  // or an oversized value reach the sheet or the confirmation email.
  const safe = {};
  for (const k in payload) safe[k] = sanitizeValue(payload[k]);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ts: new Date().toISOString(),
        secret: env.SHEET_WEBHOOK_SECRET || '',
        ...safe,
      }),
    });
    const body = await res.text();
    if (!res.ok || /"ok"\s*:\s*false/.test(body)) throw new Error('sheet ' + res.status);
    return json({ ok: true, message: okMessage || 'Thank you!' }, 200);
  } catch (e) {
    return json({ ok: false, message: 'Something went wrong. Please try again.' }, 502);
  }
}
