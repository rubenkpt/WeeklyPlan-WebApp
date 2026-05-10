import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ToastMessage = {
  id: string;
  text: string;
  emoji?: string;
};

type Props = {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      {toast.emoji && <span className="text-xl flex-shrink-0">{toast.emoji}</span>}
      <span className="text-sm text-gray-100 flex-1">{toast.text}</span>
      <button
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        className="flex-shrink-0 text-gray-500 hover:text-white active:opacity-70"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
