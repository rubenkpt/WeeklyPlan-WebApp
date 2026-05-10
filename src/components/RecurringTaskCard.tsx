import { format, nextFriday, isFriday } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check } from 'lucide-react';
import { getCategoryEmoji } from '../lib/recurring';
import { USER_EMOJIS } from '../types';
import type { RecurringTask, UserName } from '../types';

type Props = {
  task: RecurringTask;
  completed: boolean;
  currentUser: UserName;
  onToggle: (task: RecurringTask, completed: boolean) => void;
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

export default function RecurringTaskCard({ task, completed, currentUser, onToggle }: Props) {
  const isOwn = task.assignedTo === currentUser;
  const canToggle = isOwn;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gray-900 border ${userBorderColors[task.assignedTo]} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => canToggle && onToggle(task, !completed)}
        disabled={!canToggle}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          completed
            ? userCheckColors[task.assignedTo]
            : `${userUncheckedColors[task.assignedTo]} bg-transparent`
        } ${!canToggle ? 'opacity-40 cursor-default' : 'active:scale-90 cursor-pointer'}`}
        aria-label={completed ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
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
    </div>
  );
}
