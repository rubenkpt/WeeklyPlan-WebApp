import { format, isPast, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2, RefreshCw, BellRing } from 'lucide-react';
import { isCustomTaskDue, nextRecurrenceDue } from '../lib/recurring';
import { USER_EMOJIS, RECURRENCE_LABELS } from '../types';
import type { CustomTask, UserName } from '../types';

type Props = {
  task: CustomTask;
  currentUser: UserName;
  onToggle: (task: CustomTask, completed: boolean) => void;
  onDelete: (task: CustomTask) => void;
  onNudge?: (task: CustomTask) => void;
};

const checkColors: Record<string, string> = {
  Linus: 'bg-blue-600 border-blue-600',
  Ruben: 'bg-purple-600 border-purple-600',
  Markus: 'bg-emerald-600 border-emerald-600',
  all: 'bg-indigo-600 border-indigo-600',
};
const uncheckedColors: Record<string, string> = {
  Linus: 'border-blue-500/50',
  Ruben: 'border-purple-500/50',
  Markus: 'border-emerald-500/50',
  all: 'border-indigo-500/50',
};
const borderColors: Record<string, string> = {
  Linus: 'border-blue-500/40',
  Ruben: 'border-purple-500/40',
  Markus: 'border-emerald-500/40',
  all: 'border-indigo-500/40',
};

function RecurrenceLabel({ task }: { task: CustomTask }) {
  if (!task.recurrence) return null;
  const due = nextRecurrenceDue(task);
  const isDue = isCustomTaskDue(task);
  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <RefreshCw size={10} className="text-indigo-400 flex-shrink-0" />
      <span className="text-[11px] text-indigo-400">{RECURRENCE_LABELS[task.recurrence]}</span>
      {!isDue && due && (
        <span className="text-[11px] text-gray-600">
          · wieder in {differenceInDays(due, new Date())} Tagen
        </span>
      )}
    </div>
  );
}

export default function CustomTaskCard({ task, currentUser, onToggle, onDelete, onNudge }: Props) {
  const isDue = isCustomTaskDue(task);
  const isAssignedToMe = task.assignedTo === currentUser || task.assignedTo === 'all';
  const isOverdue = task.deadline && isDue && isPast(parseISO(task.deadline));
  const completed = !isDue;
  const key = task.assignedTo;

  // Show nudge when task belongs to someone else specifically (not 'all') and is still pending
  const showNudge = task.assignedTo !== 'all' && task.assignedTo !== currentUser && isDue && !!onNudge;
  const canDelete = task.createdBy === currentUser || !task.createdBy;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-900 border ${borderColors[key] ?? 'border-gray-700'} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => isAssignedToMe && onToggle(task, !task.completed)}
        disabled={!isAssignedToMe}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          completed
            ? (checkColors[key] ?? 'bg-indigo-600 border-indigo-600')
            : (uncheckedColors[key] ?? 'border-gray-500/50') + ' bg-transparent'
        } ${!isAssignedToMe ? 'opacity-40 cursor-default' : 'active:scale-90 cursor-pointer'}`}
      >
        {completed && <Check size={14} strokeWidth={3} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`text-sm font-semibold ${completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {task.title}
        </span>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          {task.assignedTo === 'all' ? (
            <span className="text-xs text-gray-500">👥 Alle</span>
          ) : (
            <span className="text-xs text-gray-500">
              {USER_EMOJIS[task.assignedTo as UserName]} {task.assignedTo}
            </span>
          )}
          {task.deadline && !task.recurrence && (
            <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
              · {isOverdue ? '⚠️ ' : ''}Fällig {format(parseISO(task.deadline), 'd. MMM', { locale: de })}
            </span>
          )}
        </div>
        <RecurrenceLabel task={task} />
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        {showNudge && (
          <button
            onClick={() => onNudge(task)}
            className="p-2 rounded-xl text-gray-600 hover:text-amber-400 active:scale-90 transition-all"
            aria-label={`${task.assignedTo} erinnern`}
            title={`${task.assignedTo} erinnern`}
          >
            <BellRing size={16} />
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(task)}
            className="p-2 rounded-xl text-gray-600 hover:text-red-400 active:opacity-70 transition-colors"
            aria-label="Aufgabe löschen"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
