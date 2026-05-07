import { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import type { EnergyType, TaskState } from '../types';
import { useSuggestions } from '../hooks/useSuggestions';
import { PlusCircle, Play } from 'lucide-react';
import { cn } from '../utils/cn';

export function TaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const { categories, types } = useSuggestions();
  
  const [rawInput, setRawInput] = useState('');
  
  // Explicit form states
  const [nextAction, setNextAction] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [energyType, setEnergyType] = useState<EnergyType>('shallow');
  const [pinned, setPinned] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsExpanded(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check for active token typing
  const match = rawInput.match(/([#+\/!])([\w-]*)$/);
  const activePrefix = match ? match[1] : null;
  const activeQuery = match ? match[2].toLowerCase() : '';

  let suggestions: string[] = [];
  if (activePrefix === '#') {
    suggestions = categories.filter(c => c.toLowerCase().includes(activeQuery));
    if (activeQuery && !suggestions.some(s => s.toLowerCase() === activeQuery)) suggestions.push(activeQuery);
  } else if (activePrefix === '+') {
    suggestions = types.filter(t => t.toLowerCase().includes(activeQuery));
    if (activeQuery && !suggestions.some(s => s.toLowerCase() === activeQuery)) suggestions.push(activeQuery);
  } else if (activePrefix === '/') {
    suggestions = ['deep', 'shallow', 'admin', 'creative'].filter(e => e.includes(activeQuery));
  } else if (activePrefix === '!') {
    suggestions = ['pin'].filter(p => p.includes(activeQuery));
  }

  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeQuery, activePrefix]);

  const applyToken = (value: string) => {
    if (activePrefix === '#') setCategory(value);
    else if (activePrefix === '+') setType(value);
    else if (activePrefix === '/') setEnergyType(value as EnergyType);
    else if (activePrefix === '!' && value === 'pin') setPinned(true);
    
    setRawInput(prev => prev.replace(/([#+\/!])([\w-]*)$/, '').trim() + ' ');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    const extract = (regex: RegExp) => {
      const m = val.match(regex);
      if (m) {
        val = val.replace(m[0], '');
        return m[1];
      }
      return null;
    };

    const cMatch = extract(/#([\w-]+)\s/);
    if (cMatch) setCategory(cMatch);

    const tMatch = extract(/\+([\w-]+)\s/);
    if (tMatch) setType(tMatch);

    const eMatch = extract(/\/(deep|shallow|admin|creative)\s/i);
    if (eMatch) setEnergyType(eMatch.toLowerCase() as EnergyType);

    const pMatch = val.match(/!pin\s/i);
    if (pMatch) {
      setPinned(true);
      val = val.replace(pMatch[0], '');
    }

    setRawInput(val);
    if (val && !isExpanded) setIsExpanded(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (activePrefix && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyToken(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalTitle = rawInput;
    let finalNextAction = nextAction;

    // Last chance extraction (if they didn't type a trailing space)
    const cMatch = finalTitle.match(/#([\w-]+)$/);
    if (cMatch) { setCategory(cMatch[1]); finalTitle = finalTitle.replace(cMatch[0], ''); }
    const tMatch = finalTitle.match(/\+([\w-]+)$/);
    if (tMatch) { setType(tMatch[1]); finalTitle = finalTitle.replace(tMatch[0], ''); }
    const eMatch = finalTitle.match(/\/(deep|shallow|admin|creative)$/i);
    if (eMatch) { setEnergyType(eMatch[1].toLowerCase() as EnergyType); finalTitle = finalTitle.replace(eMatch[0], ''); }
    const pMatch = finalTitle.match(/!pin$/i);
    if (pMatch) { setPinned(true); finalTitle = finalTitle.replace(pMatch[0], ''); }
    
    // Extract nextAction from "> "
    const aMatch = finalTitle.match(/>\s*(.+)$/);
    if (aMatch) {
      finalNextAction = aMatch[1].trim();
      finalTitle = finalTitle.replace(aMatch[0], '');
    }

    finalTitle = finalTitle.replace(/\s+/g, ' ').trim();
    if (!finalTitle || !finalNextAction.trim()) {
      setRawInput(finalTitle); // Keep the stripped title
      if (!isExpanded) setIsExpanded(true);
      return; 
    }

    addTask({
      title: finalTitle,
      nextAction: finalNextAction,
      category: category || 'General',
      type: type || 'Task',
      energyType,
      state: 'queued' as TaskState,
      pinned,
    });

    setRawInput('');
    setNextAction('');
    // Keep category, type, energyType, pinned as context for rapid entry?
    // Actually, user might want them reset. Let's reset them.
    setCategory('');
    setType('');
    setEnergyType('shallow');
    setPinned(false);
    inputRef.current?.focus();
  };

  const isValid = rawInput.trim().length > 0 && nextAction.trim().length > 0;
  // If rawInput has a '>', they might be typing nextAction inline, so allow submit.
  const canSubmit = isValid || (rawInput.includes('>') && rawInput.trim().length > 2);

  return (
    <div className="bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-lg p-3 shadow-sm mb-6 transition-all duration-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type task... e.g. Fix DB #backend /deep !pin > migrations"
            className="flex-1 bg-transparent border-none text-[var(--color-dark-text)] placeholder-[var(--color-dark-text-muted)] focus:outline-none focus:ring-0 text-lg py-1 font-medium"
            value={rawInput}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsExpanded(true)}
          />

          {activePrefix && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-xl z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <div
                  key={s}
                  onClick={() => applyToken(s)}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer",
                    i === selectedIndex ? "bg-[var(--color-accent)] text-white" : "text-slate-300 hover:bg-slate-700"
                  )}
                >
                  {activePrefix}{s}
                </div>
              ))}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-3 pt-2 border-t border-[var(--color-dark-border)] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Explicit Form Fields */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Work"
                  className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[120px]">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Type</label>
                <input
                  type="text"
                  placeholder="e.g. Bug"
                  className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>

              <div className="flex-none w-[130px]">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Energy</label>
                <select
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value as EnergyType)}
                  className="w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--color-accent)] text-[var(--color-dark-text)] appearance-none cursor-pointer"
                >
                  <option value="deep">Deep Work</option>
                  <option value="shallow">Shallow Work</option>
                  <option value="admin">Admin</option>
                  <option value="creative">Creative</option>
                </select>
              </div>

              <div className="flex-none flex items-end pb-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={pinned} 
                    onChange={(e) => setPinned(e.target.checked)}
                    className="rounded border-slate-600 bg-[#0f1115] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
                  />
                  Pinned
                </label>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Next Action</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <Play size={12} />
                  </div>
                  <input
                    type="text"
                    placeholder="Next explicit action... (Required)"
                    className={cn(
                      "w-full bg-[#0f1115] border border-[var(--color-dark-border)] rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none transition-colors",
                      !nextAction && !rawInput.includes('>') ? "border-amber-500/50" : "focus:border-[var(--color-accent)]"
                    )}
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "flex items-center gap-2 px-5 py-1.5 rounded-md font-medium text-sm transition-colors h-[34px]",
                  canSubmit
                    ? "bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white cursor-pointer" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <PlusCircle size={16} />
                Enter
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
