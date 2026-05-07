import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { Check, Clock, X, Zap, Coffee } from 'lucide-react';

export function CurrentFocus({ task }: { task: Task }) {
  const { updateTask, markTaskDone, startBreak } = useTaskStore();
  const [showDoneInput, setShowDoneInput] = useState(false);
  const [timeTaken, setTimeTaken] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!task.startedAt) return;
    
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - task.startedAt!) / 60000));
    };
    
    updateElapsed();
    const interval = setInterval(updateElapsed, 60000);
    return () => clearInterval(interval);
  }, [task.startedAt]);

  const handlePause = () => {
    updateTask(task.id, { state: 'queued' });
  };

  const handleDoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(timeTaken, 10);
    if (!isNaN(minutes) && minutes >= 0) {
      markTaskDone(task.id, minutes);
      setShowDoneInput(false);
      setTimeTaken('');
    }
  };

  return (
    <div className="mb-10 relative isolate">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 bg-[var(--color-accent)]/10 blur-xl rounded-3xl"></div>
      
      <div className="bg-[var(--color-dark-bg)] border-2 border-[var(--color-accent)]/50 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[var(--color-accent)] font-semibold tracking-widest uppercase text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
            </span>
            Current Focus
          </div>
          
          <div className="flex items-center gap-4 text-slate-400 text-sm font-mono">
            {task.startedAt && (
              <span>{elapsed}m elapsed</span>
            )}
            <button 
              onClick={() => startBreak(5)}
              className="flex items-center gap-1 hover:text-[var(--color-accent)] transition-colors border border-slate-700 hover:border-[var(--color-accent)]/50 px-2 py-1 rounded"
              title="Take a 5 minute break"
            >
              <Coffee size={14} /> Break
            </button>
            <button 
              onClick={handlePause}
              className="flex items-center gap-1 hover:text-white transition-colors border border-slate-700 px-2 py-1 rounded"
            >
              <Clock size={14} /> Pause
            </button>
          </div>
        </div>

        {/* Task Details */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
            {task.title}
          </h2>
          
          <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-[var(--color-accent)]/30 text-[var(--color-accent)] px-4 py-3 rounded-lg text-lg font-medium w-full">
            <Zap className="shrink-0" size={20} />
            <span className="truncate">{task.nextAction}</span>
          </div>
        </div>

        {/* Action bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase tracking-wider">{task.category}</span>
            <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase tracking-wider">{task.energyType}</span>
          </div>

          {!showDoneInput ? (
            <button 
              onClick={() => setShowDoneInput(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
            >
              <Check size={20} /> Complete
            </button>
          ) : (
            <form onSubmit={handleDoneSubmit} className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-900 rounded-lg p-1.5 animate-in fade-in slide-in-from-right-4">
              <input
                autoFocus
                type="number"
                min="0"
                required
                placeholder="Mins?"
                className="w-20 bg-[#0f1115] border border-emerald-900 rounded px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                value={timeTaken}
                onChange={(e) => setTimeTaken(e.target.value)}
              />
              <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition-colors">
                Done
              </button>
              <button type="button" onClick={() => setShowDoneInput(false)} className="px-2 text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
