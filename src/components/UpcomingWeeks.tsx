import { useState } from 'react';
import { addWeeks, format, startOfISOWeek, endOfISOWeek, getISOWeek, isWithinInterval, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { getRecurringTasksForWeek, getCategoryEmoji, isCustomTaskDue } from '../lib/recurring';
import { USER_EMOJIS } from '../types';
import type { CustomTask, UserName } from '../types';

type Props = {
  currentUser: UserName;
  customTasks: CustomTask[];
  completedIds: Set<string>;
  weeksAhead?: number;
  onNavigate: (date: Date) => void;
};

function WeekCard({
  weekDate,
  currentUser,
  customTasks,
  completedIds,
  onNavigate,
}: {
  weekDate: Date;
  currentUser: UserName;
  customTasks: CustomTask[];
  completedIds: Set<string>;
  onNavigate: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const week = getISOWeek(weekDate);
  const start = startOfISOWeek(weekDate);
  const end = endOfISOWeek(weekDate);

  const recurring = getRecurringTasksForWeek(weekDate);
  const weekCustom = customTasks.filter((t) => {
    if (t.recurrence) return true;
    if (t.deadline) return isWithinInterval(parseISO(t.deadline), { start, end });
    return false;
  });

  const allTasks = [
    ...recurring.map((t) => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assignedTo,
      emoji: getCategoryEmoji(t.category),
      done: completedIds.has(t.id),
      isRecurring: false,
    })),
    ...weekCustom.map((t) => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assignedTo as UserName | 'all',
      emoji: t.recurrence ? '🔄' : '📌',
      done: !isCustomTaskDue(t),
      isRecurring: !!t.recurrence,
    })),
  ];

  const myTasks = allTasks.filter(
    (t) => t.assignedTo === currentUser || t.assignedTo === 'all'
  );
  const pending = myTasks.filter((t) => !t.done);

  const dateLabel = `${format(start, 'd. MMM', { locale: de })} – ${format(end, 'd. MMM', { locale: de })}`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div>
            <span className="text-sm font-bold text-white">KW {week}</span>
            <span className="text-xs text-gray-500 ml-2">{dateLabel}</span>
          </div>
          {pending.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-400">
              {pending.length} offen
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-1.5">
          {myTasks.length === 0 ? (
            <p className="text-xs text-gray-600">Keine Aufgaben diese Woche</p>
          ) : (
            myTasks.map((t) => (
              <div key={t.id} className={`flex items-center gap-2 ${t.done ? 'opacity-40' : ''}`}>
                <span className="text-sm">{t.emoji}</span>
                <span className={`text-sm flex-1 ${t.done ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                  {t.title}
                </span>
                <span className="text-xs text-gray-600">
                  {t.assignedTo === 'all' ? '👥' : USER_EMOJIS[t.assignedTo as UserName]}
                </span>
              </div>
            ))
          )}
          <button
            onClick={() => onNavigate(weekDate)}
            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Zur Woche navigieren →
          </button>
        </div>
      )}
    </div>
  );
}

export default function UpcomingWeeks({ currentUser, customTasks, completedIds, weeksAhead = 4, onNavigate }: Props) {
  const now = new Date();
  const weeks = Array.from({ length: weeksAhead }, (_, i) => addWeeks(now, i + 1));

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Nächste {weeksAhead} Wochen
      </h2>
      <div className="space-y-2">
        {weeks.map((w) => (
          <WeekCard
            key={getISOWeek(w)}
            weekDate={w}
            currentUser={currentUser}
            customTasks={customTasks}
            completedIds={completedIds}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
