// Supabase Edge Function — sends Web Push notifications
// Deploy: supabase functions deploy send-push

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

webpush.setVapidDetails(
  `mailto:${Deno.env.get('VAPID_EMAIL')!}`,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { title, body, excludeSubscriptionId, targetUser } = await req.json() as {
      title: string;
      body: string;
      excludeSubscriptionId?: string;
      targetUser?: string; // send only to this user's devices
    };

    let query = supabase.from('push_subscriptions').select('id, endpoint, p256dh, auth');
    if (targetUser) {
      query = query.eq('user_name', targetUser);
    } else if (excludeSubscriptionId) {
      query = query.neq('id', excludeSubscriptionId);
    }

    const { data: subs, error } = await query;
    if (error) throw error;

    const payload = JSON.stringify({ title, body });
    const results = await Promise.allSettled(
      (subs ?? []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );

    // Remove expired subscriptions (410 Gone)
    const expiredIds = (subs ?? [])
      .filter((_, i) => {
        const r = results[i];
        return r.status === 'rejected' && (r.reason as { statusCode?: number })?.statusCode === 410;
      })
      .map((s) => s.id);
    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  }
});
