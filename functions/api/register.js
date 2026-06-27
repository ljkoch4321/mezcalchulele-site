// POST /api/register — Chulele community registration (Step 5) -> Mailchimp.
// Separate integration from the footer signup; same audience, richer fields.
import { handleSubscribe } from './subscribe.js';

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid request.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const merge_fields = {};
  if (data.firstName) merge_fields.FNAME = String(data.firstName).slice(0, 80);
  if (data.lastName) merge_fields.LNAME = String(data.lastName).slice(0, 80);
  if (data.phone) merge_fields.PHONE = String(data.phone).slice(0, 40);

  const tags = ['Community Registration'];
  if (/media/i.test(data.reason || '')) tags.push('Member of the Media');
  else if (data.reason) tags.push('Upcoming Batches');

  // Re-wrap the request so handleSubscribe sees the email + extra fields.
  const proxy = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: data.email }),
  });
  return handleSubscribe(proxy, env, { merge_fields, tags });
}
