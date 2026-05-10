import { getISOWeek, subWeeks } from 'date-fns';
import { Flame, CheckCircle2 } from 'lucide-react';
import { getRecurringTasksForWeek, computeStreak } from '../lib/recurring';
import { USER_EMOJIS } from '../types';
import { USERS } from '../types';
import type { UserName } from '../types';

type Props = {
  completedIds: Set<string>;
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

function WeekHistory({ user, completedIds }: { user: UserName; completedIds: Set<string> }) {
  const now = new Date();
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const date = subWeeks(now, 7 - i);
    const week = getISOWeek(date);
    const tasks = getRecurringTasksForWeek(date).filter((t) => t.assignedTo === user);
    const done = tasks.filter((t) => completedIds.has(t.id)).length;
    const total = tasks.length;
    const isCurrent = i === 7;
    return { week, done, total, isCurrent };
  });

  const dotColors: Record<UserName, string> = {
    Linus: 'bg-blue-500',
    Ruben: 'bg-purple-500',
    Markus: 'bg-emerald-500',
  };

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

export default function StatsPanel({ completedIds, currentUser }: Props) {
  const streaks = USERS.map((user) => ({
    user,
    streak: computeStreak(completedIds, user),
    taskCount: getRecurringTasksForWeek().filter((t) => t.assignedTo === user && completedIds.has(t.id)).length,
    totalThisWeek: getRecurringTasksForWeek().filter((t) => t.assignedTo === user).length,
  }));

  const totalCompleted = completedIds.size;

  return (
    <div className="px-4 py-5 space-y-6 pb-safe">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <CheckCircle2 size={20} className="text-indigo-400 mb-2" />
          <div className="text-2xl font-bold text-white">{totalCompleted}</div>
          <div className="text-xs text-gray-500 mt-0.5">Wiederkehrende erledigt</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <Flame size={20} className="text-orange-400 mb-2" />
          <div className="text-2xl font-bold text-white">
            {streaks.find((s) => s.user === currentUser)?.streak ?? 0}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Wochen Streak</div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Streaks & Verlauf
        </h2>
        <div className="space-y-3">
          {streaks.map(({ user, streak, taskCount, totalThisWeek }) => (
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

              <div className="mt-2 flex items-center gap-1.5">
                <div className="flex-1 bg-gray-800/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      user === 'Linus' ? 'bg-blue-500' : user === 'Ruben' ? 'bg-purple-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: totalThisWeek > 0 ? `${(taskCount / totalThisWeek) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {taskCount}/{totalThisWeek} diese Woche
                </span>
              </div>

              <WeekHistory user={user} completedIds={completedIds} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
