import { supabase } from './supabase';
import type { CustomTask, UserName } from '../types';

// ─── Completions (recurring tasks) ───────────────────────────────────────────

export async function fetchCompletions(): Promise<string[]> {
  const { data, error } = await supabase.from('completions').select('task_id');
  if (error) throw error;
  return (data ?? []).map((r) => r.task_id as string);
}

export async function addCompletion(taskId: string, userName: UserName): Promise<void> {
  const { error } = await supabase
    .from('completions')
    .upsert({ task_id: taskId, user_name: userName }, { onConflict: 'task_id,user_name' });
  if (error) throw error;
}

export async function removeCompletion(taskId: string, userName: UserName): Promise<void> {
  const { error } = await supabase
    .from('completions')
    .delete()
    .eq('task_id', taskId)
    .eq('user_name', userName);
  if (error) throw error;
}

// ─── Custom tasks ─────────────────────────────────────────────────────────────

export async function fetchCustomTasks(): Promise<CustomTask[]> {
  const { data, error } = await supabase
    .from('custom_tasks')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function addCustomTask(
  title: string,
  assignedTo: UserName | 'all',
  deadline: string | null,
  createdBy: UserName
): Promise<CustomTask> {
  const { data, error } = await supabase
    .from('custom_tasks')
    .insert({ title, assigned_to: assignedTo, deadline, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function toggleCustomTask(
  id: string,
  completed: boolean,
  completedBy: UserName | null
): Promise<void> {
  const { error } = await supabase
    .from('custom_tasks')
    .update({
      completed,
      completed_by: completedBy,
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCustomTask(id: string): Promise<void> {
  const { error } = await supabase.from('custom_tasks').delete().eq('id', id);
  if (error) throw error;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: any): CustomTask {
  return {
    id: r.id,
    title: r.title,
    assignedTo: r.assigned_to,
    deadline: r.deadline ?? null,
    completed: r.completed,
    completedBy: r.completed_by ?? null,
    completedAt: r.completed_at ?? null,
    createdBy: r.created_by ?? null,
    createdAt: r.created_at,
  };
}
