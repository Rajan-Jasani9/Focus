import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types';
import { Play, RotateCcw, Zap } from 'lucide-react';

export function ResumeLastSession({ task }: { task: Task }) {
  const { updateTask } = useTaskStore();

  const handleResume = () => {
    updateTask(task.id, { state: 'active', updatedAt: Date.now() });
  };

  return (
    <div className="mb-10 relative isolate animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-[#0f1115] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-xs tracking-wider uppercase mb-1">
            <RotateCcw size={14} />
            Resume Last Session
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-slate-200">
            {task.title}
          </h2>
          
          <div className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium text-sm w-full">
            <Zap className="shrink-0" size={16} />
            <span className="truncate">{task.nextAction}</span>
          </div>
        </div>

        <div className="shrink-0">
          <button 
            onClick={handleResume}
            className="w-full md:w-auto bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5"
          >
            <Play size={20} fill="currentColor" /> Resume Work
          </button>
        </div>
      </div>
    </div>
  );
}
