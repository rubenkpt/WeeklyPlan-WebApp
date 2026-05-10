import { format, nextFriday, isFriday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, BellRing } from 'lucide-react';
import { getCategoryEmoji } from '../lib/recurring';
import { USER_EMOJIS } from '../types';
import type { RecurringTask, UserName } from '../types';

type Props = {
  task: RecurringTask;
  completed: boolean;
  currentUser: UserName;
  onToggle: (task: RecurringTask, completed: boolean) => void;
  onNudge?: (task: RecurringTask) => void;
};

const userBorderColors: Record<UserName, string> = {
  Linus: 'border-blue-500/40',
  Ruben: 'border-purple-500/40',
  Markus: 'border-emerald-500/40',
};

const userCheckColors: Record<UserName, string> = {
  Linus: 'bg-blue-600 border-blue-600',
  Ruben: 'bg-purple-600 border-purple-600',
  Markus: 'bg-emerald-600 border-emerald-600',
};

const userUncheckedColors: Record<UserName, string> = {
  Linus: 'border-blue-500/50',
  Ruben: 'border-purple-500/50',
  Markus: 'border-emerald-500/50',
};

function getFridayLabel(): string {
  const now = new Date();
  const friday = isFriday(now) ? now : nextFriday(now);
  return format(friday, 'EEE, d. MMM', { locale: de });
}

export default function RecurringTaskCard({ task, completed, currentUser, onToggle, onNudge }: Props) {
  const isOwn = task.assignedTo === currentUser;
  const showNudge = !isOwn && !completed && !!onNudge;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gray-900 border ${userBorderColors[task.assignedTo]} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => isOwn && onToggle(task, !completed)}
        disabled={!isOwn}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          completed ? userCheckColors[task.assignedTo] : `${userUncheckedColors[task.assignedTo]} bg-transparent`
        } ${!isOwn ? 'opacity-40 cursor-default' : 'active:scale-90 cursor-pointer'}`}
      >
        {completed && <Check size={14} strokeWidth={3} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{getCategoryEmoji(task.category)}</span>
          <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">
            {USER_EMOJIS[task.assignedTo]} {task.assignedTo}
          </span>
          {task.isFridayTask && (
            <span className="text-xs text-amber-400">· Fällig {getFridayLabel()}</span>
          )}
        </div>
      </div>

      {showNudge && (
        <button
          onClick={() => onNudge(task)}
          className="flex-shrink-0 p-2 rounded-xl text-gray-600 hover:text-amber-400 active:scale-90 transition-all"
          aria-label={`${task.assignedTo} erinnern`}
          title={`${task.assignedTo} erinnern`}
        >
          <BellRing size={16} />
        </button>
      )}
    </div>
  );
}
