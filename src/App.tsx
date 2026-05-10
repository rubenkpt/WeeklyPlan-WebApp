import { useState, useEffect, useCallback, useRef } from 'react';
import { addWeeks, subWeeks } from 'date-fns';
import UserSelector from './components/UserSelector';
import Header from './components/Header';
import WeekNavigator from './components/WeekNavigator';
import TasksView from './components/TasksView';
import StatsPanel from './components/StatsPanel';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { getRecurringTasksForWeek, isCustomTaskDue } from './lib/recurring';
import {
  fetchCompletions, addCompletion, removeCompletion,
  fetchCustomTasks, addCustomTask, toggleCustomTask, deleteCustomTask,
  mapCustomTaskRow,
} from './lib/database';
import { requestPermission, showNotification, scheduleAllDeadlineNotifications, scheduleDeadlineNotification } from './lib/notifications';
import { subscribeToPush, sendPushToOthers, nudgeUser, updateAppBadge, isPushSupported } from './lib/push';
import { supabase } from './lib/supabase';
import type { UserName, View, CustomTask, Recurrence } from './types';

const USER_STORAGE_KEY = 'weeklyplan_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserName | null>(
    () => (localStorage.getItem(USER_STORAGE_KEY) as UserName | null) ?? null
  );
  const [view, setView] = useState<View>('tasks');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  function addToast(text: string, emoji?: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, text, emoji }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ids, tasks] = await Promise.all([fetchCompletions(), fetchCustomTasks()]);
      setCompletedIds(new Set(ids));
      setCustomTasks(tasks);
      scheduleAllDeadlineNotifications(tasks);
    } catch (e) {
      setError('Verbindung zu Supabase fehlgeschlagen. Prüfe deine .env Variablen.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data + request permissions on mount
  useEffect(() => {
    if (!currentUser) return;
    load();
    requestPermission().then((granted) => {
      if (granted && isPushSupported()) subscribeToPush(currentUser);
    });
  }, [currentUser, load]);

  // Update app badge whenever pending task counts change
  useEffect(() => {
    const pendingRecurring = getRecurringTasksForWeek().filter(
      (t) => !completedIds.has(t.id)
    ).length;
    const pendingCustom = customTasks.filter(isCustomTaskDue).length;
    updateAppBadge(pendingRecurring + pendingCustom);
  }, [completedIds, customTasks]);

  // Supabase Realtime — live updates across devices
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('custom_tasks_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'custom_tasks' },
        (payload) => {
          const newTask = mapCustomTaskRow(payload.new);
          setCustomTasks((prev) => {
            if (prev.find((t) => t.id === newTask.id)) return prev;
            return [...prev, newTask];
          });
          scheduleDeadlineNotification(newTask);

          if (newTask.createdBy && newTask.createdBy !== currentUserRef.current) {
            const assigneeLabel = newTask.assignedTo === 'all' ? 'allen' : newTask.assignedTo;
            const msg = `${newTask.createdBy} → ${assigneeLabel}: „${newTask.title}"`;
            addToast(msg, '📋');
            showNotification('📋 Neue Aufgabe', msg);
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'custom_tasks' }, (payload) => {
        setCustomTasks((prev) => prev.map((t) => (t.id === payload.new.id ? mapCustomTaskRow(payload.new) : t)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'custom_tasks' }, (payload) => {
        setCustomTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  function handleSelectUser(user: UserName) {
    localStorage.setItem(USER_STORAGE_KEY, user);
    setCurrentUser(user);
  }

  function handleSwitchUser() {
    localStorage.removeItem(USER_STORAGE_KEY);
    setCurrentUser(null);
  }

  async function handleToggleRecurring(taskId: string, assignedTo: UserName, done: boolean) {
    if (!currentUser) return;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      done ? next.add(taskId) : next.delete(taskId);
      return next;
    });
    try {
      if (done) await addCompletion(taskId, assignedTo);
      else await removeCompletion(taskId, assignedTo);
    } catch {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        done ? next.delete(taskId) : next.add(taskId);
        return next;
      });
    }
  }

  async function handleAddCustom(
    title: string,
    assignedTo: UserName | 'all',
    deadline: string | null,
    recurrence: Recurrence | null
  ) {
    if (!currentUser) return;
    try {
      const task = await addCustomTask(title, assignedTo, deadline, currentUser, recurrence);
      setCustomTasks((prev) => [...prev, task]);
      scheduleDeadlineNotification(task);
      addToast(`„${title}" hinzugefügt`, '✅');

      // Push notification to other devices
      const assigneeLabel = assignedTo === 'all' ? 'allen' : assignedTo;
      await sendPushToOthers(
        '📋 Neue Aufgabe',
        `${currentUser} → ${assigneeLabel}: „${title}"`
      );
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
      setCustomTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
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

  async function handleNudge(targetUser: UserName, taskTitle: string) {
    if (!currentUser || targetUser === currentUser) return;
    await nudgeUser(targetUser, taskTitle, currentUser);
    addToast(`${targetUser} wurde erinnert!`, '👋');
  }

  if (!currentUser) return <UserSelector onSelect={handleSelectUser} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Header currentUser={currentUser} onSwitchUser={handleSwitchUser} />

      {view === 'tasks' && (
        <WeekNavigator
          selectedWeek={selectedWeek}
          onPrev={() => setSelectedWeek((w) => subWeeks(w, 1))}
          onNext={() => setSelectedWeek((w) => addWeeks(w, 1))}
          onToday={() => setSelectedWeek(new Date())}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />

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
        view === 'tasks' ? (
          <TasksView
            currentUser={currentUser}
            selectedWeek={selectedWeek}
            completedIds={completedIds}
            customTasks={customTasks}
            onToggleRecurring={handleToggleRecurring}
            onAddCustom={handleAddCustom}
            onToggleCustom={handleToggleCustom}
            onDeleteCustom={handleDeleteCustom}
            onNudge={handleNudge}
            onNavigateWeek={(date) => setSelectedWeek(date)}
          />
        ) : (
          <StatsPanel
            completedIds={completedIds}
            customTasks={customTasks}
            currentUser={currentUser}
          />
        )
      )}

      <BottomNav view={view} onChange={setView} />
    </div>
  );
}
