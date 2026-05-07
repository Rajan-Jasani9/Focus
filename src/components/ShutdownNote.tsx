import { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Moon, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export function ShutdownNote() {
  const { shutdownNote, setShutdownNote } = useTaskStore();
  const [localNote, setLocalNote] = useState(shutdownNote);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalNote(shutdownNote);
  }, [shutdownNote]);

  const handleSave = () => {
    setShutdownNote(localNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-dark-border)]">
      <div className="flex items-center gap-2 mb-3 text-amber-500">
        <Moon size={18} />
        <h3 className="font-medium text-sm">Shutdown Note</h3>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Next thing to do tomorrow..."
          value={localNote}
          onChange={(e) => setLocalNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-amber-50"
        />
        <button
          onClick={handleSave}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
            isSaved ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
          )}
        >
          {isSaved ? <><Check size={16} /> Saved</> : 'Save'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        A clear starting point eliminates tomorrow's startup friction.
      </p>
    </div>
  );
}
