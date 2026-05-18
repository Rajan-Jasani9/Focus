import React, { useState, useEffect, useRef } from 'react';
import type { Task, EnergyType, TaskState } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { X, Play, Calendar, Save } from 'lucide-react';
import { cn } from '../utils/cn';

interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
}

function formatDateForInput(timestamp?: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toISOString().split('T')[0];
}

function parseDateInput(value: string): number | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d.getTime();
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const updateTask = useTaskStore((s) => s.updateTask);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [nextAction, setNextAction] = useState(task.nextAction);
  const [category, setCategory] = useState(task.category);
  const [type, setType] = useState(task.type);
  const [energyType, setEnergyType] = useState<EnergyType>(task.energyType);
  const [state, setState] = useState<TaskState>(task.state);
  const [pinned, setPinned] = useState(task.pinned);
  const [dueDate, setDueDate] = useState(formatDateForInput(task.dueDate));

  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus title on open
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !nextAction.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      nextAction: nextAction.trim(),
      category: category.trim() || 'General',
      type: type.trim() || 'Task',
      energyType,
      state,
      pinned,
      dueDate: parseDateInput(dueDate),
    });
    onClose();
  };

  const isOverdue = task.dueDate && task.dueDate < Date.now() && task.state !== 'done';

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-lg bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-dark-border)]">
          <h2 className="text-sm font-semibold text-white uppercase tracking-widest">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5 overflow-y-auto">

          {/* Title */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Title *</label>
            <input
              ref={titleRef}
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context..."
              className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
            />
          </div>

          {/* Next Action */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Next Action *</label>
            <div className="relative">
              <Play size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Row: Category + Type */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Type</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Row: Energy + State */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Energy</label>
              <select
                value={energyType}
                onChange={(e) => setEnergyType(e.target.value as EnergyType)}
                className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
              >
                <option value="deep">Deep Work</option>
                <option value="shallow">Shallow Work</option>
                <option value="admin">Admin</option>
                <option value="creative">Creative</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as TaskState)}
                className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none cursor-pointer"
              >
                <option value="queued">Queued</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar size={10} />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(
                "w-full bg-[#0f1115] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-accent)] transition-colors appearance-none",
                isOverdue ? "border-red-500/60 text-red-400" : "border-[var(--color-dark-border)] text-white"
              )}
            />
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 pt-1 border-t border-[var(--color-dark-border)]">
            <span>Created: {new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>Updated: {new Date(task.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {task.completedAt && (
              <span className="text-emerald-700">
                Done: {new Date(task.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* Pinned toggle + Submit */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 select-none">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded border-slate-600 bg-[#0f1115] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
              />
              Pin this task
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors"
              >
                <Save size={14} />
                Save
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
