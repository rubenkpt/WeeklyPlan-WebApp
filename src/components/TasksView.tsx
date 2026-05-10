import { useState } from 'react';
import { Plus } from 'lucide-react';
import { startOfISOWeek, endOfISOWeek, parseISO, isWithinInterval, isSameWeek } from 'date-fns';
import RecurringTaskCard from './RecurringTaskCard';
import CustomTaskCard from './CustomTaskCard';
import AddTaskModal from './AddTaskModal';
import UpcomingWeeks from './UpcomingWeeks';
import { getRecurringTasksForWeek, isCustomTaskDue } from '../lib/recurring';
import type { CustomTask, RecurringTask, Recurrence, UserName } from '../types';

type AnyTask = RecurringTask | CustomTask;

type Props = {
  currentUser: UserName;
  selectedWeek: Date;
  completedIds: Set<string>;
  customTasks: CustomTask[];
  onToggleRecurring: (taskId: string, assignedTo: UserName, done: boolean) => void;
  onAddCustom: (title: string, assignedTo: UserName | 'all', deadline: string | null, recurrence: Recurrence | null) => void;
  onToggleCustom: (task: CustomTask, done: boolean) => void;
  onDeleteCustom: (task: CustomTask) => void;
  onNudge: (targetUser: UserName, taskTitle: string) => void;
  onNavigateWeek: (date: Date) => void;
};

function customTasksForWeek(tasks: CustomTask[], selectedWeek: Date): CustomTask[] {
  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });
  const weekStart = startOfISOWeek(selectedWeek);
  const weekEnd = endOfISOWeek(selectedWeek);
  return tasks.filter((t) => {
    if (t.recurrence) return true;
    if (t.deadline) return isWithinInterval(parseISO(t.deadline), { start: weekStart, end: weekEnd });
    return isCurrentWeek;
  });
}

function isRecurring(task: AnyTask): task is RecurringTask {
  return 'category' in task;
}

export default function TasksView({
  currentUser,
  selectedWeek,
  completedIds,
  customTasks,
  onToggleRecurring,
  onAddCustom,
  onToggleCustom,
  onDeleteCustom,
  onNudge,
  onNavigateWeek,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });

  const recurringTasks = getRecurringTasksForWeek(selectedWeek);
  const weekCustomTasks = customTasksForWeek(customTasks, selectedWeek);

  const myTasks: AnyTask[] = [
    ...recurringTasks.filter((t) => t.assignedTo === currentUser),
    ...weekCustomTasks.filter((t) => t.assignedTo === currentUser || t.assignedTo === 'all'),
  ];
  const othersTasks: AnyTask[] = [
    ...recurringTasks.filter((t) => t.assignedTo !== currentUser),
    ...weekCustomTasks.filter((t) => t.assignedTo !== currentUser && t.assignedTo !== 'all'),
  ];

  function isDone(task: AnyTask) {
    return isRecurring(task) ? completedIds.has(task.id) : !isCustomTaskDue(task);
  }

  function renderTask(task: AnyTask) {
    if (isRecurring(task)) {
      return (
        <RecurringTaskCard
          key={task.id}
          task={task}
          completed={completedIds.has(task.id)}
          currentUser={currentUser}
          onToggle={(t, done) => onToggleRecurring(t.id, t.assignedTo, done)}
          onNudge={task.assignedTo !== currentUser ? (t) => onNudge(t.assignedTo, t.title) : undefined}
        />
      );
    }
    return (
      <CustomTaskCard
        key={task.id}
        task={task}
        currentUser={currentUser}
        onToggle={onToggleCustom}
        onDelete={onDeleteCustom}
        onNudge={
          task.assignedTo !== currentUser && task.assignedTo !== 'all'
            ? (t) => onNudge(t.assignedTo as UserName, t.title)
            : undefined
        }
      />
    );
  }

  const myPending = myTasks.filter((t) => !isDone(t));
  const myDone = myTasks.filter((t) => isDone(t));
  const othersPending = othersTasks.filter((t) => !isDone(t));
  const othersDone = othersTasks.filter((t) => isDone(t));

  return (
    <>
      <div className="px-4 py-4 space-y-6 pb-32">
        {/* My tasks */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Meine Aufgaben
          </h2>
          <div className="space-y-2">
            {myPending.length === 0 && myDone.length === 0 && (
              <p className="text-sm text-gray-600 py-2 px-1">Keine Aufgaben diese Woche</p>
            )}
            {myPending.map(renderTask)}
            {myDone.length > 0 && (
              <>
                <p className="text-xs text-gray-600 px-1 pt-1">Erledigt</p>
                {myDone.map(renderTask)}
              </>
            )}
          </div>
        </section>

        {/* Others' tasks */}
        {(othersPending.length > 0 || othersDone.length > 0) && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Aufgaben der anderen
            </h2>
            <div className="space-y-2">
              {othersPending.map(renderTask)}
              {othersDone.length > 0 && (
                <>
                  <p className="text-xs text-gray-600 px-1 pt-1">Erledigt</p>
                  {othersDone.map(renderTask)}
                </>
              )}
            </div>
          </section>
        )}

        {/* Upcoming weeks preview — only on current week view */}
        {isCurrentWeek && (
          <UpcomingWeeks
            currentUser={currentUser}
            customTasks={customTasks}
            completedIds={completedIds}
            weeksAhead={4}
            onNavigate={onNavigateWeek}
          />
        )}
      </div>

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
          defaultDeadlineWeek={selectedWeek}
          onAdd={(title, assignedTo, deadline, recurrence) => {
            onAddCustom(title, assignedTo, deadline, recurrence);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
