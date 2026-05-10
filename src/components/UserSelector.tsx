import { USERS, USER_EMOJIS } from '../types';
import type { UserName } from '../types';

type Props = {
  onSelect: (user: UserName) => void;
};

const userGradients: Record<UserName, string> = {
  Linus: 'from-blue-600 to-blue-400',
  Ruben: 'from-purple-600 to-purple-400',
  Markus: 'from-emerald-600 to-emerald-400',
};

export default function UserSelector({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 py-safe">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">WeeklyPlan</h1>
        <p className="text-gray-400 mt-2 text-lg">Wer bist du?</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {USERS.map((user) => (
          <button
            key={user}
            onClick={() => onSelect(user)}
            className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl bg-gradient-to-r ${userGradients[user]} shadow-lg active:scale-95 transition-transform`}
          >
            <span className="text-4xl">{USER_EMOJIS[user]}</span>
            <span className="text-2xl font-bold text-white">{user}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
