import React, { useState } from 'react';
import type { Task, TaskState } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { Play, Check, X, Pin, PinOff, RotateCcw, AlertCircle, Trash2, Clock } from 'lucide-react';
import { cn } from '../utils/cn';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask, togglePin, markTaskDone, reopenTask, deleteTask } = useTaskStore();
  const [showDoneInput, setShowDoneInput] = useState(false);
  const [timeTaken, setTimeTaken] = useState('');

  const isDone = task.state === 'done';
  const isBlocked = task.state === 'blocked';
  const isActive = task.state === 'active';

  const handleStateChange = (newState: TaskState) => {
    if (newState === 'done') {
      setShowDoneInput(true);
    } else {
      const updates: Partial<Task> = { state: newState };
      if (newState === 'active' && !task.startedAt) {
        updates.startedAt = Date.now();
      }
      updateTask(task.id, updates);
    }
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

  const energyColors = {
    deep: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    shallow: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    admin: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    creative: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };

  return (
    <div className={cn(
      "group relative flex flex-col p-3 rounded-lg border transition-all duration-200",
      isDone ? "opacity-60 border-[var(--color-dark-border)] bg-transparent" : "border-[var(--color-dark-border)] bg-[var(--color-dark-card)] hover:border-slate-600",
      isActive && "border-[var(--color-state-active)] bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
      isBlocked && "border-red-900/50 bg-red-900/10",
      task.pinned && !isDone && "ring-1 ring-[var(--color-accent)]/50"
    )}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => togglePin(task.id)}
          className={cn(
            "mt-1 flex-shrink-0 transition-colors",
            task.pinned ? "text-[var(--color-accent)]" : "text-slate-600 hover:text-slate-400"
          )}
          title={task.pinned ? "Unpin" : "Pin task"}
        >
          {task.pinned ? <Pin size={16} className="fill-[var(--color-accent)]" /> : <PinOff size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn(
              "font-medium truncate",
              isDone ? "line-through text-[var(--color-dark-text-muted)]" : "text-[var(--color-dark-text)]"
            )}>
              {task.title}
            </span>
            
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold", energyColors[task.energyType])}>
              {task.energyType}
            </span>
            
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              {task.category}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-mono text-[var(--color-accent)] bg-[var(--color-accent)]/10 px-1 rounded inline-flex items-center gap-1">
              <Play size={12} />
              {task.nextAction}
            </span>
          </div>
          
          {isDone && task.timeTakenMinutes !== undefined && (
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
              <Check size={12} /> Completed in {task.timeTakenMinutes}m
              {task.reopenCount > 0 && <span className="text-slate-500 ml-2">(Reopened {task.reopenCount}x)</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isDone && (
            <>
              {isActive ? (
                <button onClick={() => handleStateChange('queued')} className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Pause">
                  <Clock size={16} />
                </button>
              ) : (
                <button onClick={() => handleStateChange('active')} className="p-1.5 text-[var(--color-accent)] hover:text-blue-300 rounded hover:bg-blue-900/30" title="Start working">
                  <Play size={16} />
                </button>
              )}
              
              <button onClick={() => handleStateChange('blocked')} className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-900/30" title="Mark blocked">
                <AlertCircle size={16} />
              </button>
              
              <button onClick={() => handleStateChange('done')} className="p-1.5 text-emerald-400 hover:text-emerald-300 rounded hover:bg-emerald-900/30" title="Complete">
                <Check size={16} />
              </button>
            </>
          )}
          
          {isDone && (
            <button onClick={() => reopenTask(task.id)} className="p-1.5 text-amber-400 hover:text-amber-300 rounded hover:bg-amber-900/30" title="Reopen">
              <RotateCcw size={16} />
            </button>
          )}

          <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-800" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showDoneInput && (
        <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-md">
          <form onSubmit={handleDoneSubmit} className="flex items-center gap-2">
            <span className="text-sm text-emerald-400">Time taken (min):</span>
            <input
              autoFocus
              type="number"
              min="0"
              required
              className="w-20 bg-[#0f1115] border border-emerald-900/50 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500"
              value={timeTaken}
              onChange={(e) => setTimeTaken(e.target.value)}
            />
            <button type="submit" className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-sm transition-colors">
              Done
            </button>
            <button type="button" onClick={() => setShowDoneInput(false)} className="px-2 py-1 text-slate-400 hover:text-white rounded text-sm transition-colors">
              <X size={16} />
            </button>
          </form>
        </div>
      )}

      {isBlocked && (
        <div className="mt-3 pt-3 border-t border-red-900/30">
          <label className="text-xs text-red-400 font-medium flex items-center gap-2 mb-1">
            <AlertCircle size={12} /> Why stuck?
          </label>
          <input
            type="text"
            placeholder="e.g. unclear implementation, waiting reply..."
            className="w-full bg-[#0f1115] border border-red-900/50 rounded-md px-3 py-1.5 text-sm text-red-200 placeholder-red-900/50 focus:outline-none focus:border-red-500/50"
            value={task.blockedReason || ''}
            onChange={(e) => updateTask(task.id, { blockedReason: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
