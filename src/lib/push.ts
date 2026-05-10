import { supabase } from './supabase';
import { upsertPushSubscription } from './database';
import type { UserName } from '../types';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return view;
}

let _subscriptionId: string | null = null;
export function getSubscriptionId(): string | null { return _subscriptionId; }

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;
}

export async function subscribeToPush(userName: UserName): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
      });
    }
    const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
    _subscriptionId = await upsertPushSubscription(userName, json.endpoint, json.keys.p256dh, json.keys.auth);
    return true;
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return false;
  }
}

export async function sendPushToOthers(title: string, body: string): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', {
      body: { title, body, excludeSubscriptionId: _subscriptionId },
    });
  } catch (err) {
    console.warn('send-push failed:', err);
  }
}

export async function nudgeUser(targetUser: UserName, taskTitle: string, fromUser: UserName): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', {
      body: {
        title: `👋 Erinnerung von ${fromUser}`,
        body: `„${taskTitle}" ist noch offen!`,
        targetUser,
      },
    });
  } catch (err) {
    console.warn('nudge failed:', err);
  }
}

// ─── App badge ────────────────────────────────────────────────────────────────

type NavWithBadge = Navigator & {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export function updateAppBadge(count: number): void {
  const nav = navigator as NavWithBadge;
  if (count > 0 && nav.setAppBadge) {
    nav.setAppBadge(count).catch(() => undefined);
  } else if (nav.clearAppBadge) {
    nav.clearAppBadge().catch(() => undefined);
  }
}
