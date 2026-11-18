// POST /api/reserve — reserve-list signup -> Google Sheet ("Reserve List" tab).
// Form: reserve/#reserve-list posts { name, email, variant }.
import { toSheet, json, readJson, badOrigin } from './_sheet.js';

export async function onRequestPost({ request, env }) {
  if (badOrigin(request)) return json({ ok: false, message: 'Forbidden.' }, 403);
  const data = await readJson(request);

  // Honeypot: bots fill the hidden "company" field -> silently accept, don't save.
  if ((data.company || '').toString().trim()) return json({ ok: true, message: 'Thank you — your name is on the list.' }, 200);

  const name = (data.name || '').toString().trim().slice(0, 120);
  const email = (data.email || '').toString().trim().slice(0, 254);
  if (!email || email.indexOf('@') < 1) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  let variant = (data.variant || '').toString().trim().slice(0, 40);
  if (!variant) {
    const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)ab=([^;]+)/);
    if (m) variant = m[1].slice(0, 40);
  }

  return toSheet(
    env,
    { type: 'reserve', name, email, source: (data.source || 'reserve').toString().slice(0, 40), variant },
    'Thank you — your name is on the list.'
  );
}
