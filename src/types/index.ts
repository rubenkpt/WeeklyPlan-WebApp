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
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type View = 'tasks' | 'stats';
