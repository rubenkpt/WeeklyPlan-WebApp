import { getISOWeek, subWeeks } from 'date-fns';
import { Flame, CheckCircle2, ListTodo } from 'lucide-react';
import { getRecurringTasksForWeek, computeStreak } from '../lib/recurring';
import { USER_EMOJIS, USERS } from '../types';
import type { CustomTask, UserName } from '../types';

type Props = {
  completedIds: Set<string>;
  customTasks: CustomTask[];
  currentUser: UserName;
};

const userGradients: Record<UserName, string> = {
  Linus: 'from-blue-600/20 to-blue-600/5 border-blue-500/30',
  Ruben: 'from-purple-600/20 to-purple-600/5 border-purple-500/30',
  Markus: 'from-emerald-600/20 to-emerald-600/5 border-emerald-500/30',
};

const streakColors: Record<UserName, string> = {
  Linus: 'text-blue-400',
  Ruben: 'text-purple-400',
  Markus: 'text-emerald-400',
};

const barColors: Record<UserName, string> = {
  Linus: 'bg-blue-500',
  Ruben: 'bg-purple-500',
  Markus: 'bg-emerald-500',
};

const dotColors: Record<UserName, string> = {
  Linus: 'bg-blue-500',
  Ruben: 'bg-purple-500',
  Markus: 'bg-emerald-500',
};

function WeekHistory({ user, completedIds }: { user: UserName; completedIds: Set<string> }) {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const date = subWeeks(now, 7 - i);
    const week = getISOWeek(date);
    const tasks = getRecurringTasksForWeek(date).filter((t) => t.assignedTo === user);
    const done = tasks.filter((t) => completedIds.has(t.id)).length;
    const total = tasks.length;
    return { week, done, total, isCurrent: i === 7 };
  });

  return (
    <div className="flex gap-1.5 mt-3">
      {weeks.map(({ week, done, total, isCurrent }, i) => {
        const pct = total > 0 ? done / total : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                pct === 1
                  ? dotColors[user] + ' text-white'
                  : pct > 0
                  ? dotColors[user] + '/30 text-white/60'
                  : 'bg-gray-800 text-gray-700'
              } ${isCurrent ? 'ring-1 ring-white/20' : ''}`}
            >
              {pct === 1 ? '✓' : total > 0 ? `${done}/${total}` : '-'}
            </div>
            <span className="text-[10px] text-gray-600">W{week}</span>
          </div>
        );
      })}
    </div>
  );
}

function customTasksForUser(tasks: CustomTask[], user: UserName) {
  return tasks.filter((t) => t.assignedTo === user || t.assignedTo === 'all');
}

export default function StatsPanel({ completedIds, customTasks, currentUser }: Props) {
  const thisWeekRecurring = getRecurringTasksForWeek();

  const streaks = USERS.map((user) => ({
    user,
    streak: computeStreak(completedIds, user),
    recurringDone: thisWeekRecurring.filter((t) => t.assignedTo === user && completedIds.has(t.id)).length,
    recurringTotal: thisWeekRecurring.filter((t) => t.assignedTo === user).length,
    customDone: customTasksForUser(customTasks, user).filter((t) => t.completed).length,
    customTotal: customTasksForUser(customTasks, user).length,
  }));

  const myStreak = streaks.find((s) => s.user === currentUser)?.streak ?? 0;
  const myCustomDone = streaks.find((s) => s.user === currentUser)?.customDone ?? 0;
  const myCustomTotal = streaks.find((s) => s.user === currentUser)?.customTotal ?? 0;

  return (
    <div className="px-4 py-5 space-y-6 pb-32">
      {/* Top summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
          <CheckCircle2 size={18} className="text-indigo-400 mb-2" />
          <div className="text-xl font-bold text-white">{completedIds.size}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">Wiederkehrende erledigt</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
          <ListTodo size={18} className="text-purple-400 mb-2" />
          <div className="text-xl font-bold text-white">{myCustomDone}/{myCustomTotal}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">Eigene Aufgaben</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
          <Flame size={18} className="text-orange-400 mb-2" />
          <div className="text-xl font-bold text-white">{myStreak}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">Wochen Streak</div>
        </div>
      </div>

      {/* Per-user breakdown */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Streaks & Verlauf
        </h2>
        <div className="space-y-3">
          {streaks.map(({ user, streak, recurringDone, recurringTotal, customDone, customTotal }) => (
            <div
              key={user}
              className={`bg-gradient-to-br ${userGradients[user]} border rounded-2xl p-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{USER_EMOJIS[user]}</span>
                  <span className="font-bold text-white">{user}</span>
                  {user === currentUser && (
                    <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">Du</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Flame size={16} className={streak > 0 ? 'text-orange-400' : 'text-gray-600'} />
                  <span className={`text-lg font-bold ${streak > 0 ? streakColors[user] : 'text-gray-600'}`}>
                    {streak}
                  </span>
                </div>
              </div>

              {/* Recurring progress bar */}
              <div className="mt-2.5 flex items-center gap-1.5">
                <div className="flex-1 bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColors[user]}`}
                    style={{ width: recurringTotal > 0 ? `${(recurringDone / recurringTotal) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {recurringDone}/{recurringTotal} wiederkehrend
                </span>
              </div>

              {/* Custom tasks progress bar */}
              {customTotal > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="flex-1 bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all opacity-60 ${barColors[user]}`}
                      style={{ width: `${(customDone / customTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {customDone}/{customTotal} eigene
                  </span>
                </div>
              )}

              <WeekHistory user={user} completedIds={completedIds} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
