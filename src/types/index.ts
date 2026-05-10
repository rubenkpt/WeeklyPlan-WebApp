export type UserName = 'Linus' | 'Ruben' | 'Markus';

export const USERS: UserName[] = ['Linus', 'Ruben', 'Markus'];

export const USER_COLORS: Record<UserName, string> = {
  Linus: 'linus',
  Ruben: 'ruben',
  Markus: 'markus',
};

export const USER_EMOJIS: Record<UserName, string> = {
  Linus: '🏠',
  Ruben: '🌿',
  Markus: '⚡',
};

export type Recurrence = 'weekly' | 'biweekly' | 'monthly';

export const RECURRENCE_LABELS: Record<Recurrence, string> = {
  weekly: 'Wöchentlich',
  biweekly: '2-wöchentlich',
  monthly: 'Monatlich',
};

export const RECURRENCE_DAYS: Record<Recurrence, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

export type RecurringTask = {
  id: string;
  title: string;
  assignedTo: UserName;
  weekKey: string;
  isFridayTask: boolean;
  category: 'bathroom' | 'cleaning' | 'laundry';
};

export type CustomTask = {
  id: string;
  title: string;
  assignedTo: UserName | 'all';
  deadline: string | null;
  recurrence: Recurrence | null;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type View = 'tasks' | 'stats';
