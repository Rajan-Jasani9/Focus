import { useState, useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskForm } from '../components/TaskForm';
import { TaskItem } from '../components/TaskItem';
import { ShutdownNote } from '../components/ShutdownNote';
import { useSuggestions } from '../hooks/useSuggestions';
import { CurrentFocus } from '../components/CurrentFocus';
import { ResumeLastSession } from '../components/ResumeLastSession';
import type { EnergyType, TaskState } from '../types';
import { cn } from '../utils/cn';
import { Filter, X, Search, ArrowUpDown } from 'lucide-react';

type ViewMode = 'today' | 'active' | 'blocked' | 'done' | 'all';
type SortKey = 'default' | 'due-asc' | 'created-desc' | 'created-asc' | 'alpha';

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'default',      label: 'Default'    },
  { id: 'due-asc',      label: 'Due date'   },
  { id: 'created-desc', label: 'Newest'     },
  { id: 'created-asc',  label: 'Oldest'     },
  { id: 'alpha',        label: 'A → Z'      },
];

export function MainView() {
  const tasks = useTaskStore((state) => state.tasks);
  const { categories, types } = useSuggestions();

  const [view, setView] = useState<ViewMode>('today');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterEnergy, setFilterEnergy] = useState<EnergyType | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const activeTask = useMemo(() => tasks.find(t => t.state === 'active'), [tasks]);
  const lastSessionTask = useMemo(() => {
    if (activeTask) return null;
    const pausedTasks = tasks.filter(t => t.state === 'queued' && t.startedAt);
    if (pausedTasks.length === 0) return null;
    return pausedTasks.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  }, [tasks, activeTask]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // View Filtering
    if (view === 'today') {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      result = result.filter(t => {
        if (t.state === 'done') return false; // never show completed tasks in Today
        if (t.state === 'active') return true;
        if (t.pinned) return true;
        // show tasks due today or overdue (past due)
        if (t.dueDate && t.dueDate <= todayEnd.getTime()) return true;
        return false;
      });
    } else if (view === 'active') {
      result = result.filter(t => t.state === 'active');
    } else if (view === 'blocked') {
      result = result.filter(t => t.state === 'blocked');
    } else if (view === 'done') {
      result = result.filter(t => t.state === 'done');
    }

    // Search Filtering
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.nextAction.toLowerCase().includes(q)
      );
    }

    // Property Filtering
    if (filterCategory) result = result.filter(t => t.category === filterCategory);
    if (filterType) result = result.filter(t => t.type === filterType);
    if (filterEnergy) result = result.filter(t => t.energyType === filterEnergy);

    // Sorting
    if (sortKey === 'default') {
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const stateOrder: Record<TaskState, number> = { active: 1, queued: 2, blocked: 3, done: 4 };
        if (stateOrder[a.state] !== stateOrder[b.state]) return stateOrder[a.state] - stateOrder[b.state];
        return b.updatedAt - a.updatedAt;
      });
    } else if (sortKey === 'due-asc') {
      // Overdue first, then due today, then future due, then no due date — all with pinned on top
      const FAR_FUTURE = Number.MAX_SAFE_INTEGER;
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const aDue = a.dueDate ?? FAR_FUTURE;
        const bDue = b.dueDate ?? FAR_FUTURE;
        return aDue - bDue;
      });
    } else if (sortKey === 'created-desc') {
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
    } else if (sortKey === 'created-asc') {
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.createdAt - b.createdAt;
      });
    } else if (sortKey === 'alpha') {
      result.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.title.localeCompare(b.title);
      });
    }

    // Always pull active task out of the list (it's shown in CurrentFocus)
    if (activeTask) {
      result = result.filter(t => t.id !== activeTask.id);
    }

    return result;
  }, [tasks, view, search, filterCategory, filterType, filterEnergy, sortKey, activeTask]);

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: 'today',   label: 'Today'   },
    { id: 'active',  label: 'Active'  },
    { id: 'blocked', label: 'Blocked' },
    { id: 'done',    label: 'Done'    },
    { id: 'all',     label: 'All'     },
  ];

  const hasActiveFilters = !!(filterCategory || filterType || filterEnergy);

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-20 px-4 min-h-screen flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Focus.</h1>
          <p className="text-sm text-[var(--color-dark-text-muted)] mt-1">Eliminate friction. Do the work.</p>
        </div>
        <div className="flex gap-2">
          {viewTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                view === tab.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTask && <CurrentFocus task={activeTask} />}
      {!activeTask && lastSessionTask && <ResumeLastSession task={lastSessionTask} />}

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500",
        activeTask ? "opacity-30 hover:opacity-100 focus-within:opacity-100" : "opacity-100"
      )}>
        <TaskForm />

        {/* Search + Sort + Filter row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setShowSort(!showSort)}
            title="Sort tasks"
            className={cn(
              "p-1.5 rounded-md border transition-colors flex items-center gap-1 text-sm",
              showSort || sortKey !== 'default'
                ? "bg-slate-800 border-slate-600 text-white"
                : "border-[var(--color-dark-border)] text-slate-400 hover:text-white"
            )}
          >
            <ArrowUpDown size={16} />
            <span className="hidden sm:inline">Sort</span>
            {sortKey !== 'default' && (
              <span className="text-[10px] text-[var(--color-accent)] font-semibold">
                {SORT_OPTIONS.find(o => o.id === sortKey)?.label}
              </span>
            )}
          </button>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-1.5 rounded-md border transition-colors flex items-center gap-1 text-sm",
              showFilters || hasActiveFilters
                ? "bg-slate-800 border-slate-600 text-white"
                : "border-[var(--color-dark-border)] text-slate-400 hover:text-white"
            )}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Sort pill bar */}
        {showSort && (
          <div className="flex flex-wrap gap-2 mb-3 px-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortKey(opt.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  sortKey === opt.id
                    ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
                    : "border-[var(--color-dark-border)] text-slate-400 hover:text-white hover:border-slate-500"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-slate-900/50 rounded-lg border border-[var(--color-dark-border)]">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#0f1115] border border-[var(--color-dark-border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-slate-500"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-[#0f1115] border border-[var(--color-dark-border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-slate-500"
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={filterEnergy}
              onChange={e => setFilterEnergy(e.target.value as EnergyType | '')}
              className="bg-[#0f1115] border border-[var(--color-dark-border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-slate-500"
            >
              <option value="">All Energy</option>
              <option value="deep">Deep Work</option>
              <option value="shallow">Shallow Work</option>
              <option value="admin">Admin</option>
              <option value="creative">Creative</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={() => { setFilterCategory(''); setFilterType(''); setFilterEnergy(''); }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-[var(--color-dark-border)] rounded-lg">
              <p>No tasks found.</p>
              <p className="text-sm mt-1">Press Ctrl+K to add a new task.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem key={task.id} task={task} />
            ))
          )}
        </div>

        <ShutdownNote />
      </div>
    </div>
  );
}
