import { getISOWeek, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { LogOut } from 'lucide-react';
import { USER_EMOJIS } from '../types';
import type { UserName } from '../types';

type Props = {
  currentUser: UserName;
  onSwitchUser: () => void;
};

const userRingColors: Record<UserName, string> = {
  Linus: 'ring-blue-500',
  Ruben: 'ring-purple-500',
  Markus: 'ring-emerald-500',
};

export default function Header({ currentUser, onSwitchUser }: Props) {
  const now = new Date();
  const week = getISOWeek(now);
  const monthYear = format(now, 'MMMM yyyy', { locale: de });

  return (
    <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-sm border-b border-gray-800 px-4 pt-safe">
      <div className="flex items-center justify-between h-14">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            KW {week} · {monthYear}
          </span>
        </div>

        <button
          onClick={onSwitchUser}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 ring-2 ${userRingColors[currentUser]} active:opacity-70 transition-opacity`}
        >
          <span className="text-base">{USER_EMOJIS[currentUser]}</span>
          <span className="text-sm font-semibold text-white">{currentUser}</span>
          <LogOut size={13} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
