import { useState } from 'react';
import { Plus } from 'lucide-react';
import RecurringTaskCard from './RecurringTaskCard';
import CustomTaskCard from './CustomTaskCard';
import AddTaskModal from './AddTaskModal';
import type { RecurringTask, CustomTask, UserName } from '../types';

type Props = {
  currentUser: UserName;
  recurringTasks: RecurringTask[];
  completedIds: Set<string>;
  customTasks: CustomTask[];
  onToggleRecurring: (task: RecurringTask, done: boolean) => void;
  onAddCustom: (title: string, assignedTo: UserName | 'all', deadline: string | null) => void;
  onToggleCustom: (task: CustomTask, done: boolean) => void;
  onDeleteCustom: (task: CustomTask) => void;
};

export default function TasksView({
  currentUser,
  recurringTasks,
  completedIds,
  customTasks,
  onToggleRecurring,
  onAddCustom,
  onToggleCustom,
  onDeleteCustom,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const myRecurring = recurringTasks.filter((t) => t.assignedTo === currentUser);
  const othersRecurring = recurringTasks.filter((t) => t.assignedTo !== currentUser);

  const pendingCustom = customTasks.filter((t) => !t.completed);
  const doneCustom = customTasks.filter((t) => t.completed);

  return (
    <>
      <div className="px-4 py-4 space-y-6 pb-32">
        {/* My recurring tasks */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Meine Aufgaben diese Woche
          </h2>
          <div className="space-y-2">
            {myRecurring.length === 0 ? (
              <p className="text-sm text-gray-600 py-2 px-4">Keine wiederkehrenden Aufgaben</p>
            ) : (
              myRecurring.map((task) => (
                <RecurringTaskCard
                  key={task.id}
                  task={task}
                  completed={completedIds.has(task.id)}
                  currentUser={currentUser}
                  onToggle={onToggleRecurring}
                />
              ))
            )}
          </div>
        </section>

        {/* Others' recurring tasks */}
        {othersRecurring.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Aufgaben der anderen
            </h2>
            <div className="space-y-2">
              {othersRecurring.map((task) => (
                <RecurringTaskCard
                  key={task.id}
                  task={task}
                  completed={completedIds.has(task.id)}
                  currentUser={currentUser}
                  onToggle={onToggleRecurring}
                />
              ))}
            </div>
          </section>
        )}

        {/* Custom tasks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Eigene Aufgaben
            </h2>
          </div>

          <div className="space-y-2">
            {pendingCustom.length === 0 && doneCustom.length === 0 && (
              <p className="text-sm text-gray-600 py-2 px-4">Noch keine eigenen Aufgaben</p>
            )}
            {pendingCustom.map((task) => (
              <CustomTaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                onToggle={onToggleCustom}
                onDelete={onDeleteCustom}
              />
            ))}
            {doneCustom.length > 0 && (
              <div className="space-y-2 mt-1">
                <p className="text-xs text-gray-600 px-1">Erledigt</p>
                {doneCustom.map((task) => (
                  <CustomTaskCard
                    key={task.id}
                    task={task}
                    currentUser={currentUser}
                    onToggle={onToggleCustom}
                    onDelete={onDeleteCustom}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-900/50 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Aufgabe hinzufügen"
      >
        <Plus size={26} strokeWidth={2.5} className="text-white" />
      </button>

      {showModal && (
        <AddTaskModal
          currentUser={currentUser}
          onAdd={(title, assignedTo, deadline) => {
            onAddCustom(title, assignedTo, deadline);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
