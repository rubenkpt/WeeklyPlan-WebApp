import { format, startOfISOWeek, endOfISOWeek, getISOWeek, isSameWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  selectedWeek: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function WeekNavigator({ selectedWeek, onPrev, onNext, onToday }: Props) {
  const isCurrentWeek = isSameWeek(selectedWeek, new Date(), { weekStartsOn: 1 });
  const weekNum = getISOWeek(selectedWeek);
  const start = startOfISOWeek(selectedWeek);
  const end = endOfISOWeek(selectedWeek);

  const startStr = format(start, 'd. MMM', { locale: de });
  const endStr = format(end, 'd. MMM yyyy', { locale: de });

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/60 border-b border-gray-800">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg text-gray-400 hover:text-white active:opacity-60 transition-colors"
        aria-label="Vorherige Woche"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="flex-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-white">KW {weekNum}</span>
          <span className="text-xs text-gray-400">{startStr} – {endStr}</span>
        </div>
        {isCurrentWeek && (
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
            Diese Woche
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {!isCurrentWeek && (
          <button
            onClick={onToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/50 active:opacity-70 transition-colors mr-1"
          >
            Heute
          </button>
        )}
        <button
          onClick={onNext}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white active:opacity-60 transition-colors"
          aria-label="Nächste Woche"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
