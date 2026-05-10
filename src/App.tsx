import { useState, useEffect, useCallback } from 'react';
import UserSelector from './components/UserSelector';
import Header from './components/Header';
import TasksView from './components/TasksView';
import StatsPanel from './components/StatsPanel';
import BottomNav from './components/BottomNav';
import { getRecurringTasksForWeek } from './lib/recurring';
import { fetchCompletions, addCompletion, removeCompletion, fetchCustomTasks, addCustomTask, toggleCustomTask, deleteCustomTask } from './lib/database';
import type { UserName, View, RecurringTask, CustomTask } from './types';

const USER_STORAGE_KEY = 'weeklyplan_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserName | null>(() => {
    return (localStorage.getItem(USER_STORAGE_KEY) as UserName | null) ?? null;
  });
  const [view, setView] = useState<View>('tasks');
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recurringTasks = getRecurringTasksForWeek();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ids, tasks] = await Promise.all([fetchCompletions(), fetchCustomTasks()]);
      setCompletedIds(new Set(ids));
      setCustomTasks(tasks);
    } catch (e) {
      setError('Verbindung zu Supabase fehlgeschlagen. Prüfe deine .env Variablen.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) load();
  }, [currentUser, load]);

  function handleSelectUser(user: UserName) {
    localStorage.setItem(USER_STORAGE_KEY, user);
    setCurrentUser(user);
  }

  function handleSwitchUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
  }

  async function handleToggleRecurring(task: RecurringTask, done: boolean) {
    if (!currentUser) return;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (done) next.add(task.id);
      else next.delete(task.id);
      return next;
    });
    try {
      if (done) await addCompletion(task.id, currentUser);
      else await removeCompletion(task.id, currentUser);
    } catch {
      // Revert optimistic update
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (done) next.delete(task.id);
        else next.add(task.id);
        return next;
      });
    }
  }

  async function handleAddCustom(title: string, assignedTo: UserName | 'all', deadline: string | null) {
    if (!currentUser) return;
    try {
      const task = await addCustomTask(title, assignedTo, deadline, currentUser);
      setCustomTasks((prev) => [...prev, task]);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleCustom(task: CustomTask, done: boolean) {
    if (!currentUser) return;
    setCustomTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, completed: done, completedBy: done ? currentUser : null, completedAt: done ? new Date().toISOString() : null }
          : t
      )
    );
    try {
      await toggleCustomTask(task.id, done, done ? currentUser : null);
    } catch {
      setCustomTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      );
    }
  }

  async function handleDeleteCustom(task: CustomTask) {
    setCustomTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await deleteCustomTask(task.id);
    } catch {
      setCustomTasks((prev) => [...prev, task]);
    }
  }

  if (!currentUser) {
    return <UserSelector onSelect={handleSelectUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header currentUser={currentUser} onSwitchUser={handleSwitchUser} />

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-900/30 border border-red-800 rounded-2xl text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {view === 'tasks' ? (
            <TasksView
              currentUser={currentUser}
              recurringTasks={recurringTasks}
              completedIds={completedIds}
              customTasks={customTasks}
              onToggleRecurring={handleToggleRecurring}
              onAddCustom={handleAddCustom}
              onToggleCustom={handleToggleCustom}
              onDeleteCustom={handleDeleteCustom}
            />
          ) : (
            <StatsPanel completedIds={completedIds} currentUser={currentUser} />
          )}
        </>
      )}

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
