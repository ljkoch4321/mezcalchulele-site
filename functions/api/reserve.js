// POST /api/reserve — reserve-list signup -> Mailchimp audience, tagged "Reserve List".
// Reuses the shared Mailchimp handler from subscribe.js.
// Env vars (Cloudflare Pages dashboard): MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID
import { handleSubscribe } from './subscribe.js';

export async function onRequestPost({ request, env }) {
  let data = {};
  try { data = await request.clone().json(); } catch {}
  const name = (data.name || '').trim();
  const extra = {
    tags: ['Reserve List'],
    merge_fields: name ? { FNAME: name } : {},
  };
  return handleSubscribe(request, env, extra);
}
