import { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { endOfISOWeek, isSameWeek, format } from 'date-fns';
import { USERS } from '../types';
import type { Recurrence, UserName } from '../types';

type Props = {
  currentUser: UserName;
  defaultDeadlineWeek?: Date;
  onAdd: (title: string, assignedTo: UserName | 'all', deadline: string | null, recurrence: Recurrence | null) => void;
  onClose: () => void;
};

function getDefaultDeadline(week?: Date): string {
  if (!week || isSameWeek(week, new Date(), { weekStartsOn: 1 })) return '';
  return format(endOfISOWeek(week), 'yyyy-MM-dd');
}

const RECURRENCE_OPTIONS: { value: Recurrence | null; label: string }[] = [
  { value: null, label: 'Einmalig' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: '2-wöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
];

export default function AddTaskModal({ currentUser, defaultDeadlineWeek, onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<UserName | 'all'>(currentUser);
  const [deadline, setDeadline] = useState(getDefaultDeadline(defaultDeadlineWeek));
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    // Recurring tasks don't need a deadline — it auto-repeats
    onAdd(trimmed, assignedTo, recurrence ? null : (deadline || null), recurrence);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-gray-900 rounded-t-3xl sm:rounded-2xl border border-gray-700 pb-safe">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Neue Aufgabe</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-white active:opacity-70">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Aufgabe
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Küche putzen"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          {/* Assigned to */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Zugewiesen an
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([...USERS, 'all'] as (UserName | 'all')[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setAssignedTo(u)}
                  className={`py-2 px-1 rounded-xl text-sm font-semibold transition-all ${
                    assignedTo === u ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {u === 'all' ? 'Alle' : u}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} />
                Wiederholung
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RECURRENCE_OPTIONS.map(({ value, label }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => setRecurrence(value)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all text-left ${
                    recurrence === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {value && <span className="mr-1">🔄</span>}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline — only for non-recurring */}
          {!recurrence && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Fällig bis (optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm [color-scheme:dark]"
              />
            </div>
          )}

          {recurrence && (
            <p className="text-xs text-gray-500 -mt-2 px-1">
              Die Aufgabe erscheint automatisch alle{' '}
              {recurrence === 'weekly' ? '7 Tage' : recurrence === 'biweekly' ? '14 Tage' : '30 Tage'} wieder.
            </p>
          )}

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white font-bold text-base transition-colors"
          >
            Aufgabe hinzufügen
          </button>
        </form>
      </div>
    </div>
  );
}
