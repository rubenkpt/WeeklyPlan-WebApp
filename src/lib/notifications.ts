import { isToday, parseISO } from 'date-fns';
import type { CustomTask } from '../types';

export async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showNotification(title: string, body: string) {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  });
  // Auto-close after 6s
  setTimeout(() => n.close(), 6000);
}

// Schedules a browser notification at 18:00 on the task's deadline day.
// Only works while the tab/PWA is open — for true background push you'd need a push server.
const scheduledTaskIds = new Set<string>();

export function scheduleDeadlineNotification(task: CustomTask) {
  if (!task.deadline || scheduledTaskIds.has(task.id)) return;

  const deadline = parseISO(task.deadline);
  if (!isToday(deadline)) return; // only schedule for today

  const notifAt = new Date(deadline);
  notifAt.setHours(18, 0, 0, 0);

  const delay = notifAt.getTime() - Date.now();

  if (delay < 0) {
    // Already past 18:00 today — show immediately
    showNotification('📋 Aufgabe fällig', task.title);
  } else {
    scheduledTaskIds.add(task.id);
    setTimeout(() => {
      showNotification('📋 Aufgabe fällig heute', `${task.title} ist fällig!`);
    }, delay);
  }
}

export function scheduleAllDeadlineNotifications(tasks: CustomTask[]) {
  tasks.filter((t) => !t.completed).forEach(scheduleDeadlineNotification);
}
