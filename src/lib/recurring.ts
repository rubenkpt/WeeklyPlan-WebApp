import { getISOWeek, getISOWeekYear, subWeeks, nextFriday, isFriday, isAfter } from 'date-fns';
import type { RecurringTask, UserName } from '../types';

export function getWeekKey(date: Date): string {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function getRecurringTasksForWeek(date: Date = new Date()): RecurringTask[] {
  const week = getISOWeek(date);
  const weekKey = getWeekKey(date);
  const isOddWeek = week % 2 === 1;

  const tasks: RecurringTask[] = [];

  // Linus & Ruben alternate weekly
  const bathroomUser: UserName = isOddWeek ? 'Linus' : 'Ruben';
  const cleaningUser: UserName = isOddWeek ? 'Ruben' : 'Linus';

  tasks.push({
    id: `bathroom-${bathroomUser.toLowerCase()}-${weekKey}`,
    title: 'Badezimmer putzen',
    assignedTo: bathroomUser,
    weekKey,
    isFridayTask: false,
    category: 'bathroom',
  });

  tasks.push({
    id: `cleaning-${cleaningUser.toLowerCase()}-${weekKey}`,
    title: 'Zimmer / Saugen / Flur',
    assignedTo: cleaningUser,
    weekKey,
    isFridayTask: false,
    category: 'cleaning',
  });

  // Every Friday: laundry chute for all
  const laundryUsers: UserName[] = ['Linus', 'Ruben', 'Markus'];
  laundryUsers.forEach((user) => {
    tasks.push({
      id: `laundry-${user.toLowerCase()}-${weekKey}`,
      title: 'Wäsche in die Wäscheschlucht',
      assignedTo: user,
      weekKey,
      isFridayTask: true,
      category: 'laundry',
    });
  });

  // Markus every 2 weeks (even ISO weeks)
  if (week % 2 === 0) {
    tasks.push({
      id: `markus-bathroom-${weekKey}`,
      title: 'Badezimmer putzen',
      assignedTo: 'Markus',
      weekKey,
      isFridayTask: false,
      category: 'bathroom',
    });

    tasks.push({
      id: `markus-vacuum-${weekKey}`,
      title: 'Flur saugen',
      assignedTo: 'Markus',
      weekKey,
      isFridayTask: false,
      category: 'cleaning',
    });
  }

  return tasks;
}

export function getNextFridayDate(from: Date = new Date()): Date {
  if (isFriday(from)) return from;
  return nextFriday(from);
}

export function isFridayPast(from: Date = new Date()): boolean {
  const friday = getNextFridayDate(from);
  return !isFriday(from) && isAfter(from, friday);
}

export function computeStreak(completedIds: Set<string>, userName: UserName): number {
  const now = new Date();
  let streak = 0;

  for (let i = 0; i < 52; i++) {
    const weekDate = subWeeks(now, i);
    const userTasks = getRecurringTasksForWeek(weekDate).filter(
      (t) => t.assignedTo === userName
    );

    if (userTasks.length === 0) break;

    const allDone = userTasks.every((t) => completedIds.has(t.id));
    if (allDone) {
      streak++;
    } else {
      // Allow the current week to be incomplete without breaking streak
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

export function getCategoryEmoji(category: RecurringTask['category']): string {
  return { bathroom: '🚿', cleaning: '🧹', laundry: '👕' }[category];
}
