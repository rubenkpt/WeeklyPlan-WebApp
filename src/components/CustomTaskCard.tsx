import { format, isPast, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Trash2 } from 'lucide-react';
import { USER_EMOJIS } from '../types';
import type { CustomTask, UserName } from '../types';

type Props = {
  task: CustomTask;
  currentUser: UserName;
  onToggle: (task: CustomTask, completed: boolean) => void;
  onDelete: (task: CustomTask) => void;
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

export default function CustomTaskCard({ task, currentUser, onToggle, onDelete }: Props) {
  const isAssignedToMe = task.assignedTo === currentUser || task.assignedTo === 'all';
  const isOverdue = task.deadline && !task.completed && isPast(parseISO(task.deadline));
  const assigneeKey = task.assignedTo;

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gray-900 border ${borderColors[assigneeKey] ?? 'border-gray-700'} ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => isAssignedToMe && onToggle(task, !task.completed)}
        disabled={!isAssignedToMe}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          task.completed
            ? (checkColors[assigneeKey] ?? 'bg-indigo-600 border-indigo-600')
            : (uncheckedColors[assigneeKey] ?? 'border-gray-500/50') + ' bg-transparent'
        } ${!isAssignedToMe ? 'opacity-40 cursor-default' : 'active:scale-90 cursor-pointer'}`}
      >
        {task.completed && <Check size={14} strokeWidth={3} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`text-sm font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
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
          {task.deadline && (
            <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-500'}`}>
              · {isOverdue ? '⚠️ ' : ''}Fällig {format(parseISO(task.deadline), 'd. MMM', { locale: de })}
            </span>
          )}
          {task.completed && task.completedBy && (
            <span className="text-xs text-gray-600">· erledigt von {task.completedBy}</span>
          )}
        </div>
      </div>

      {(task.createdBy === currentUser || !task.createdBy) && (
        <button
          onClick={() => onDelete(task)}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-red-400 active:opacity-70 transition-colors"
          aria-label="Aufgabe löschen"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
