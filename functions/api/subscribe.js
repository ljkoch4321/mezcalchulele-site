// POST /api/subscribe  — footer email signup -> Mailchimp audience.
// Env vars (set in Cloudflare Pages dashboard, never hardcoded):
//   MAILCHIMP_API_KEY      e.g. xxxxxxxx-us21
//   MAILCHIMP_AUDIENCE_ID  e.g. a1b2c3d4e5
export async function onRequestPost({ request, env }) {
  return handleSubscribe(request, env, {});
}

export async function handleSubscribe(request, env, extra) {
  const json = (body, status) =>
    new Response(JSON.stringify(body), {
      status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });

  if (!env.MAILCHIMP_API_KEY || !env.MAILCHIMP_AUDIENCE_ID) {
    return json({ ok: false, message: 'Subscription is not configured yet.' }, 500);
  }

  let data;
  try { data = await request.json(); } catch { return json({ ok: false, message: 'Invalid request.' }, 400); }

  const email = (data.email || '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, message: 'Please enter a valid email address.' }, 400);
  }

  const dc = env.MAILCHIMP_API_KEY.split('-')[1];
  if (!dc) return json({ ok: false, message: 'Subscription is misconfigured.' }, 500);

  const member = {
    email_address: email,
    status: 'subscribed',
    merge_fields: extra.merge_fields || {},
    tags: extra.tags || [],
  };

  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_AUDIENCE_ID}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa('anystring:' + env.MAILCHIMP_API_KEY),
      },
      body: JSON.stringify(member),
    }
  );

  if (res.ok) return json({ ok: true, message: 'Subscribed.' }, 200);

  let body = {};
  try { body = await res.json(); } catch {}
  if (body.title === 'Member Exists') {
    return json({ ok: true, message: 'You are already subscribed.' }, 200);
  }
  // Surface Mailchimp's reason without leaking internals.
  return json({ ok: false, message: body.detail || 'Could not subscribe right now.' }, 502);
}
