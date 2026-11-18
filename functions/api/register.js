// POST /api/register — Chulele community registration -> Google Sheet
// ("Registrations" tab). Posts { firstName, lastName, email, phone, reason }.
import { toSheet, json, readJson, badOrigin } from './_sheet.js';

export async function onRequestPost({ request, env }) {
  if (badOrigin(request)) return json({ ok: false, message: 'Forbidden.' }, 403);
  const data = await readJson(request);

  // Honeypot: bots fill the hidden "company" field -> silently accept, don't save.
  if ((data.company || '').toString().trim()) return json({ ok: true, message: 'Welcome to the Chulele community!' }, 200);

  const email = (data.email || '').toString().trim().slice(0, 254);
  if (!email || email.indexOf('@') < 1) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  return toSheet(
    env,
    {
      type: 'registration',
      firstName: (data.firstName || '').toString().slice(0, 80),
      lastName: (data.lastName || '').toString().slice(0, 80),
      email,
      phone: (data.phone || '').toString().slice(0, 40),
      reason: (data.reason || '').toString().slice(0, 200),
    },
    'Welcome to the Chulele community!'
  );
}
