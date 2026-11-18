// POST /api/subscribe — footer signup + timed-popup signup -> Google Sheet
// ("Newsletter" tab). Both post { email, source } ('footer' or 'popup').
import { toSheet, json, readJson, badOrigin } from './_sheet.js';

export async function onRequestPost({ request, env }) {
  if (badOrigin(request)) return json({ ok: false, message: 'Forbidden.' }, 403);
  const data = await readJson(request);

  // Honeypot: bots fill the hidden "company" field -> silently accept, don't save.
  if ((data.company || '').toString().trim()) return json({ ok: true, message: 'Thank you! You are subscribed.' }, 200);

  const email = (data.email || '').toString().trim().slice(0, 254);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  return toSheet(
    env,
    { type: 'newsletter', email, source: (data.source || 'footer').toString().slice(0, 40) },
    'Thank you! You are subscribed.'
  );
}
