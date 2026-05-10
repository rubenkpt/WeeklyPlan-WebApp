import { CheckSquare, BarChart2 } from 'lucide-react';
import type { View } from '../types';

type Props = {
  view: View;
  onChange: (v: View) => void;
};

export default function BottomNav({ view, onChange }: Props) {
  const items: { id: View; label: string; Icon: typeof CheckSquare }[] = [
    { id: 'tasks', label: 'Aufgaben', Icon: CheckSquare },
    { id: 'stats', label: 'Statistiken', Icon: BarChart2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800 pb-safe">
      <div className="flex">
        {items.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors active:opacity-70 ${
              view === id ? 'text-indigo-400' : 'text-gray-600'
            }`}
          >
            <Icon size={22} strokeWidth={view === id ? 2.5 : 1.8} />
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
